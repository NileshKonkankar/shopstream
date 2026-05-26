import { Request, Response } from "express";
import { Product } from "../models/Product";
import { emitInventoryUpdate } from "../sockets/inventory.socket";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 24), 1), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { isActive: true };

  if (typeof category === "string") {
    filter.category = category;
  }

  if (typeof search === "string") {
    filter.$text = { $search: search };
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter)
  ]);

  res.json({
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);

  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const productBeforeUpdate = await Product.findById(req.params.id);

  if (!productBeforeUpdate) {
    throw new AppError("Product not found", 404);
  }

  const previousStock = productBeforeUpdate.stock;
  Object.assign(productBeforeUpdate, req.body);
  const updatedProduct = await productBeforeUpdate.save();

  if (typeof req.body.stock === "number" && req.body.stock !== previousStock) {
    emitInventoryUpdate(String(updatedProduct._id), updatedProduct.stock);
  }

  res.json({ product: updatedProduct });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.json({ message: "Product deleted successfully" });
});
