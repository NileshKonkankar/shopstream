import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { generateToken } from "../utils/generateToken";
import { AuthenticatedRequest } from "../utils/types";

const toAuthResponse = (user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
}) => ({
  _id: String(user._id),
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "customer"
  });

  const token = generateToken(String(user._id), user.role);

  res.status(201).json({
    user: toAuthResponse(user),
    accessToken: token,
    token
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(String(user._id), user.role);

  res.json({
    user: toAuthResponse(user),
    accessToken: token,
    token
  });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    user: toAuthResponse(user)
  });
});
