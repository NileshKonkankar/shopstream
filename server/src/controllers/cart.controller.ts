import { Response } from "express";
import { Types } from "mongoose";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../utils/types";

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user.id;
};

const findPopulatedCart = async (userId: string) =>
  Cart.findOne({ userId }).populate("items.productId");

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const cart = await findPopulatedCart(userId);

  res.json({ cart: cart ?? { userId, items: [] } });
});

export const addCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);
    const { productId, quantity } = req.body;

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId }, $set: { updatedAt: new Date() } },
      { new: true, upsert: true }
    );

    const existingItem = cart.items.find((item) => String(item.productId) === productId);

    const nextQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < nextQuantity) {
      throw new AppError("Not enough stock available", 400);
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(productId),
        quantity
      });
    }

    await cart.save();
    const populatedCart = await findPopulatedCart(userId);

    res.status(201).json({ cart: populatedCart });
  }
);

export const updateCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item = cart.items.find((cartItem) => String(cartItem.productId) === productId);
    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.stock < quantity) {
      throw new AppError("Not enough stock available", 400);
    }

    item.quantity = quantity;
    await cart.save();
    const populatedCart = await findPopulatedCart(userId);

    res.json({ cart: populatedCart });
  }
);

export const removeCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    cart.items = cart.items.filter((item) => String(item.productId) !== productId);
    await cart.save();
    const populatedCart = await findPopulatedCart(userId);

    res.json({ cart: populatedCart });
  }
);

export const clearCart = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = getUserId(req);
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true, upsert: true }
    ).populate("items.productId");

    res.json({ cart });
  }
);
