import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "../../types";
import { formatCurrency, getProductId } from "../../utils/formatters";

interface CartItemRowProps {
  item: CartItem;
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow = ({ item, onUpdate, onRemove }: CartItemRowProps) => {
  const productId = getProductId(item.product);

  return (
    <div className="grid gap-4 border-b border-slate-200 py-4 last:border-0 sm:grid-cols-[96px_1fr_auto] sm:items-center">
      <img
        alt={item.product.title}
        className="h-24 w-24 rounded-md object-cover"
        src={item.product.images[0] ?? "https://placehold.co/300x300?text=ShopStream"}
      />
      <div>
        <h3 className="font-semibold text-slate-950">{item.product.title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {formatCurrency(item.product.price)} each
        </p>
        <p className="mt-1 text-xs text-slate-500">{item.product.stock} in stock</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-slate-300">
          <button
            aria-label="Decrease quantity"
            className="p-2 hover:bg-slate-100"
            onClick={() => onUpdate(productId, item.quantity - 1)}
            type="button"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
          <button
            aria-label="Increase quantity"
            className="p-2 hover:bg-slate-100"
            onClick={() => onUpdate(productId, item.quantity + 1)}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <button
          aria-label="Remove item"
          className="btn-secondary px-3 py-2 text-red-600"
          onClick={() => onRemove(productId)}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
