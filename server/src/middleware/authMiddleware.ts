import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest, UserRole } from "../utils/types";

interface JwtPayload {
  userId: string;
  role: UserRole;
}

const isJwtPayload = (value: unknown): value is JwtPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<JwtPayload>;
  return (
    typeof payload.userId === "string" &&
    payload.userId.length > 0 &&
    (payload.role === "customer" || payload.role === "admin")
  );
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Authentication token is required", 401));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!isJwtPayload(decoded)) {
      next(new AppError("Invalid authentication token payload", 401));
      return;
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401));
  }
};
