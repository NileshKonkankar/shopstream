import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id");

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: objectId,
          quantity: z.number().int().positive().max(100)
        })
      )
      .min(1, "Order must include at least one item")
      .max(50, "Order cannot include more than 50 line items")
  }).strict()
});
