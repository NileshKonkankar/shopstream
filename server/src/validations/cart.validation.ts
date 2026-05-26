import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id");

export const addCartItemSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.number().int().positive().max(100)
  }).strict()
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: objectId
  }),
  body: z.object({
    quantity: z.number().int().positive().max(100)
  }).strict()
});
