import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from "../controllers/product.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createProductSchema,
  updateProductSchema
} from "../validations/product.validation";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(createProductSchema),
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateRequest(updateProductSchema),
  updateProduct
);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

export default router;
