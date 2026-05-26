import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { stripe } from "../config/stripe";
import { env } from "../config/env";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "../utils/types";
import { emitInventoryUpdate } from "../sockets/inventory.socket";
import { logger } from "../utils/logger";

interface CartItemInput {
  productId: string;
  quantity: number;
}

/**
 * Create a Stripe PaymentIntent and return its client secret.
 * Expects body: { items: [{ productId: string, quantity: number }] }
 * Recalculates total securely on the server and checks stock availability.
 */
export const createPaymentIntent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { items } = req.body as { items: CartItemInput[] };

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("Invalid checkout request: items are required", 400);
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Authentication required for checkout", 401);
  }

  // Fetch all requested products from DB to get the source of truth prices and stock
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true
  });

  if (products.length !== items.length) {
    throw new AppError("One or more products in your cart are invalid or inactive", 404);
  }

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = products.find((p) => String(p._id) === item.productId);
    if (!product) {
      throw new AppError(`Product with ID ${item.productId} not found`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product: ${product.title}`, 400);
    }

    totalAmount += product.price * item.quantity;
    validatedItems.push({
      productId: item.productId,
      quantity: item.quantity
    });
  }

  // Stripe expects amount in the smallest currency unit (paise for INR)
  const amountInPaise = Math.round(totalAmount * 100);

  logger.info(`Creating PaymentIntent for user ${userId} with total: ₹${totalAmount}`);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaise,
    currency: "inr",
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      items: JSON.stringify(validatedItems)
    }
  });

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    amount: totalAmount,
    currency: "inr",
    status: paymentIntent.status
  });
});

/**
 * Stripe webhook endpoint to handle payment events.
 * Verifies webhook signature, processes successful payments, creates the order, and updates inventory.
 */
export const paymentWebhook = asyncHandler(async (req: any, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    logger.error("Webhook verification failed: signature or secret missing");
    throw new AppError("Missing Stripe webhook signature or secret", 400);
  }

  let event;
  try {
    const rawBody = req.rawBody as Buffer;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  logger.info(`Received Stripe webhook event: ${event.type}`);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const paymentIntentId = paymentIntent.id;

    // Ensure idempotency: check if we've already created an order for this paymentIntentId
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      logger.info(`Duplicate webhook: Order for PaymentIntent ${paymentIntentId} already exists.`);
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    const userId = paymentIntent.metadata?.userId;
    const items = JSON.parse(paymentIntent.metadata?.items || "[]") as CartItemInput[];

    if (!userId || items.length === 0) {
      logger.error(`PaymentIntent ${paymentIntentId} metadata is missing userId or items`);
      res.status(400).json({ error: "Missing metadata in payment intent" });
      return;
    }

    // Process order items
    const orderItems = [];
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    for (const item of items) {
      const product = products.find((p) => String(p._id) === item.productId);
      if (!product) {
        logger.error(`Product ${item.productId} from payment metadata not found in database.`);
        continue;
      }

      const originalStock = product.stock;
      const updatedStock = originalStock - item.quantity;
      const decrementResult = await Product.updateOne(
        {
          _id: product._id,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        }
      );

      if (decrementResult.modifiedCount !== 1) {
        logger.error(
          `PaymentIntent ${paymentIntentId}: insufficient stock while fulfilling product ${item.productId}`
        );
        continue;
      }

      // Broadcast inventory updates in real-time
      emitInventoryUpdate(String(product._id), updatedStock);

      orderItems.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity
      });
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create a database order in the "paid" and "processing" status
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      paymentStatus: "paid",
      orderStatus: "processing",
      paymentIntentId
    });

    logger.info(`Successfully created Order ${order._id} for user ${userId} following PaymentIntent ${paymentIntentId}`);
  }

  res.status(200).json({ received: true });
});
