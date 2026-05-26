import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartActions } from "../../hooks/useCartActions";
import { Product } from "../../types";
import { formatCurrency, getProductId } from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isAdding } = useCartActions();
  const productId = getProductId(product);
  const imageUrl = product.images[0] ?? "https://placehold.co/640x480?text=ShopStream";

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <Link to={`/products/${productId}`}>
        <img
          alt={product.title}
          className="aspect-[4/3] w-full object-cover"
          src={imageUrl}
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              className="text-base font-semibold text-slate-950 hover:text-brand-700"
              to={`/products/${productId}`}
            >
              {product.title}
            </Link>
            <p className="mt-1 text-sm text-slate-500">{product.category}</p>
          </div>
          <p className="font-semibold text-slate-950">{formatCurrency(product.price)}</p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span
            className={`text-sm font-medium ${
              product.stock > 0 ? "text-brand-700" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
          <button
            className="btn-primary px-3 py-2"
            disabled={product.stock === 0 || isAdding}
            onClick={() => addToCart(product)}
            type="button"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
};
