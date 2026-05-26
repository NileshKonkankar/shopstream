import { Router } from "express";
import {
  createPaymentIntent,
  paymentWebhook
} from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { createPaymentIntentSchema } from "../validations/payment.validation";

const router = Router();

router.post(
  "/create-intent",
  authMiddleware,
  validateRequest(createPaymentIntentSchema),
  createPaymentIntent
);
router.post("/webhook", paymentWebhook);

export default router;
