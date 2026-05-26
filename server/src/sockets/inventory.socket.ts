import { getIO } from "./socket";

export const emitInventoryUpdate = (productId: string, stock: number): void => {
  getIO().emit("inventory:update", {
    productId,
    stock
  });
};
