import { Request } from "express";

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
