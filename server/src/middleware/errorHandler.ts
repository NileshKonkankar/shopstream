import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { getErrorCode } from "../utils/httpStatus";
import { logger } from "../utils/logger";
import { RequestWithId } from "./requestLogger";

type MongoDuplicateError = Error & {
  code?: number;
  keyValue?: Record<string, unknown>;
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  const requestId = (req as RequestWithId).requestId;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource id";
  } else if ((error as MongoDuplicateError).code === 11000) {
    statusCode = 409;
    const fields = Object.keys((error as MongoDuplicateError).keyValue ?? {}).join(", ");
    message = fields ? `${fields} already exists` : "Duplicate value";
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = error.message;
  }

  if (statusCode >= 500) {
    logger.error(message, {
      requestId,
      error
    });
  }

  res.status(statusCode).json({
    code: getErrorCode(statusCode),
    message,
    requestId,
    ...(env.NODE_ENV === "development" && { stack: error.stack })
  });
};
