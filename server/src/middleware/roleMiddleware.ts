import { NextFunction, Response } from "express";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest, UserRole } from "../utils/types";

export const roleMiddleware =
  (...allowedRoles: UserRole[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication is required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("You do not have permission to access this resource", 403));
      return;
    }

    next();
  };
