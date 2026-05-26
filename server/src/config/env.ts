import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive(),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  CURRENCY: z.string().default("INR")
});

const parsedEnv = envSchema.superRefine((value, ctx) => {
  if (value.NODE_ENV === "production" && value.JWT_SECRET.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["JWT_SECRET"],
      message: "JWT_SECRET must be at least 32 characters in production"
    });
  }
}).safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid environment configuration: ${errors}`);
}

export const env = parsedEnv.data;
