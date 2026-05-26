import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders
} from "../controllers/order.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { createOrderSchema } from "../validations/order.validation";

const router = Router();

router.get("/my", authMiddleware, getMyOrders);
router.get("/", authMiddleware, roleMiddleware("admin"), getAllOrders);
router.post("/", authMiddleware, validateRequest(createOrderSchema), createOrder);

export default router;
