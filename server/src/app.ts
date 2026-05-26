import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import productRoutes from "./routes/product.routes";
import { requestLogger } from "./middleware/requestLogger";

export const app = express();

app.use(requestLogger);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: {
      policy: "no-referrer"
    }
  })
);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"]
  })
);
app.use(
  express.json({
    limit: "1mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => env.NODE_ENV === "test"
});

app.use(globalApiLimiter);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "shopstream-server",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get("/ready", (_req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;
  const status = isDatabaseReady ? "ready" : "not_ready";

  res.status(isDatabaseReady ? 200 : 503).json({
    status,
    service: "shopstream-server",
    dependencies: {
      database: {
        status: isDatabaseReady ? "up" : "down",
        readyState: mongoose.connection.readyState
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);
