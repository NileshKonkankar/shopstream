import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export interface RequestWithId extends Request {
  requestId?: string;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  (req as RequestWithId).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, path } = req;
    const { statusCode } = res;
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    logger[level]("http_request", {
      requestId,
      method,
      path,
      statusCode,
      durationMs: duration
    });
  });

  next();
};
