import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authMiddleware, getMe);

export default router;
