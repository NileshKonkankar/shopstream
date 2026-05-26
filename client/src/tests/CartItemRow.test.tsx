import { render, screen, fireEvent } from "@testing-library/react";
import { CartItemRow } from "../components/cart/CartItemRow";
import { CartItem } from "../types";

const mockItem: CartItem = {
  product: {
    _id: "product-1",
    title: "Canvas Backpack",
    slug: "canvas-backpack",
    description: "A durable backpack.",
    price: 89,
    category: "Bags",
    images: [],
    stock: 8,
    isActive: true
  },
  quantity: 2
};

describe("CartItemRow", () => {
  it("renders cart item details correctly", () => {
    const onUpdateMock = vi.fn();
    const onRemoveMock = vi.fn();

    render(
      <CartItemRow
        item={mockItem}
        onUpdate={onUpdateMock}
        onRemove={onRemoveMock}
      />
    );

    expect(screen.getByText("Canvas Backpack")).toBeInTheDocument();
    expect(screen.getByText("₹89.00 each")).toBeInTheDocument();
    expect(screen.getByText("8 in stock")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls onUpdate with decreased quantity when minus button clicked", () => {
    const onUpdateMock = vi.fn();
    const onRemoveMock = vi.fn();

    render(
      <CartItemRow
        item={mockItem}
        onUpdate={onUpdateMock}
        onRemove={onRemoveMock}
      />
    );

    const minusButton = screen.getByRole("button", { name: /decrease quantity/i });
    fireEvent.click(minusButton);

    expect(onUpdateMock).toHaveBeenCalledWith("product-1", 1);
  });

  it("calls onRemove when trash button clicked", () => {
    const onUpdateMock = vi.fn();
    const onRemoveMock = vi.fn();

    render(
      <CartItemRow
        item={mockItem}
        onUpdate={onUpdateMock}
        onRemove={onRemoveMock}
      />
    );

    const removeButton = screen.getByRole("button", { name: /remove item/i });
    fireEvent.click(removeButton);

    expect(onRemoveMock).toHaveBeenCalledWith("product-1");
  });
});
