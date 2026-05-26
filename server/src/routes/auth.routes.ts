import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.route("/register")
  .post(validateRequest(registerSchema), register)
  .all((req, res) => {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      message: `Method ${req.method} not allowed on /api/auth/register. Use POST.`
    });
  });

router.route("/login")
  .post(validateRequest(loginSchema), login)
  .all((req, res) => {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      message: `Method ${req.method} not allowed on /api/auth/login. Use POST.`
    });
  });

router.route("/me")
  .get(authMiddleware, getMe)
  .all((req, res) => {
    res.setHeader("Allow", "GET, OPTIONS");
    res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      message: `Method ${req.method} not allowed on /api/auth/me. Use GET.`
    });
  });

export default router;
