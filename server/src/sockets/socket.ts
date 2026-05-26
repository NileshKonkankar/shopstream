import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let ioInstance: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  ioInstance.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized. Call initSocket(server) first.");
  }

  return ioInstance;
};
