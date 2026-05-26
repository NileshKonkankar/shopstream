import { z } from "zod";

const productBody = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  description: z.string().trim().min(10).max(5000),
  price: z.number().nonnegative().max(1_000_000),
  category: z.string().trim().min(2).max(80),
  images: z.array(z.string().url()).max(10).default([]),
  stock: z.number().int().nonnegative().max(100_000),
  isActive: z.boolean().optional()
}).strict();

export const createProductSchema = z.object({
  body: productBody
});

export const updateProductSchema = z.object({
  body: productBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  })
});
