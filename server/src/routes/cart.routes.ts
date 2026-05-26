import { Router } from "express";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  addCartItemSchema,
  updateCartItemSchema
} from "../validations/cart.validation";

const router = Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/items", validateRequest(addCartItemSchema), addCartItem);
router.put("/items/:productId", validateRequest(updateCartItemSchema), updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
