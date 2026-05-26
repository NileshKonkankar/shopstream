import { Response } from "express";
import { Types } from "mongoose";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { emitInventoryUpdate } from "../sockets/inventory.socket";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../utils/types";

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user.id;
};

export const getMyOrders = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const orders = await Order.find({ userId: getUserId(req) }).sort({ createdAt: -1 });

    res.json({ orders });
  }
);

export const getAllOrders = asyncHandler(async (_req, res: Response) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  res.json({ orders });
});

export const createOrder = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);
    const requestedItems = req.body.items as Array<{
      productId: string;
      quantity: number;
    }>;

    const productIds = requestedItems.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    if (products.length !== requestedItems.length) {
      throw new AppError("One or more products were not found", 404);
    }

    const orderItems = requestedItems.map((item) => {
      const product = products.find((entry) => String(entry._id) === item.productId);

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Not enough stock for ${product.title}`, 400);
      }

      return {
        productId: new Types.ObjectId(item.productId),
        title: product.title,
        price: product.price,
        quantity: item.quantity
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const decrementedItems: Array<{ productId: string; quantity: number; stock: number }> = [];

    try {
      for (const item of requestedItems) {
        const decrementResult = await Product.updateOne(
          {
            _id: item.productId,
            isActive: true,
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity }
          }
        );

        if (decrementResult.modifiedCount !== 1) {
          throw new AppError("One or more products no longer have enough stock", 409);
        }

        const product = products.find((entry) => String(entry._id) === item.productId);
        decrementedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          stock: Math.max((product?.stock ?? item.quantity) - item.quantity, 0)
        });
      }

      const order = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        paymentStatus: "pending",
        orderStatus: "pending"
      });

      decrementedItems.forEach((item) => {
        emitInventoryUpdate(item.productId, item.stock);
      });

      res.status(201).json({ order });
    } catch (error) {
      await Promise.all(
        decrementedItems.map((item) =>
          Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
          )
        )
      );

      throw error;
    }
  }
);
