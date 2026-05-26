import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id");

export const createPaymentIntentSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: objectId,
          quantity: z.number().int().positive().max(100)
        }).strict()
      )
      .min(1, "Payment intent must include at least one item")
      .max(50, "Payment intent cannot include more than 50 line items")
  }).strict()
});
