import { useCartStore } from "../store/cart.store";
import { Product } from "../types";

const product: Product = {
  _id: "product-1",
  title: "Desk Lamp",
  slug: "desk-lamp",
  description: "A bright desk lamp.",
  price: 40,
  category: "Home",
  images: [],
  stock: 1,
  isActive: true
};

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("prevents local quantity from exceeding stock", () => {
    useCartStore.getState().addItem(product, 1);
    useCartStore.getState().addItem(product, 1);

    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(useCartStore.getState().errorMessage).toContain("only has 1");
  });
});
