import http from "http";
import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocket } from "./sockets/socket";
import { logger } from "./utils/logger";

const startServer = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT}`);
  });

  const shutdown = (signal: string): void => {
    logger.warn("shutdown_signal_received", { signal });

    httpServer.close(() => {
      logger.info("http_server_closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("forced_shutdown_timeout", { signal });
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  logger.error("Server startup failed", error);
  process.exit(1);
});
