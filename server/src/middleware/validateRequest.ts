import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { RequestWithId } from "./requestLogger";

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      req.body = parsed.body ?? req.body;
      req.params = parsed.params ?? req.params;
      req.query = parsed.query ?? req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: "Validation failed",
          requestId: (req as RequestWithId).requestId,
          errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }

      next(error);
    }
  };
