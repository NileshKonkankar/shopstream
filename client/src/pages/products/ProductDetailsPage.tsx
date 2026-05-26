import { useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../api/products.api";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { useCartActions } from "../../hooks/useCartActions";
import { useCartStore } from "../../store/cart.store";
import { formatCurrency } from "../../utils/formatters";

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart, isAdding } = useCartActions();
  const cartError = useCartStore((state) => state.errorMessage);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProduct(id ?? ""),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return <LoadingState label="Loading product" />;
  }

  if (isError || !data?.product) {
    return (
      <section className="container-page py-8">
        <ErrorState message="This product could not be loaded." />
      </section>
    );
  }

  const product = data.product;
  const imageUrl = product.images[0] ?? "https://placehold.co/900x700?text=ShopStream";

  return (
    <section className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <img
          alt={product.title}
          className="aspect-[4/3] w-full rounded-lg object-cover"
          src={imageUrl}
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{product.title}</h1>
          <p className="mt-4 text-2xl font-bold text-slate-950">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-5 leading-7 text-slate-600">{product.description}</p>
          <p
            className={`mt-5 font-medium ${
              product.stock > 0 ? "text-brand-700" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <button
            className="btn-primary mt-6"
            disabled={product.stock === 0 || isAdding}
            onClick={() => addToCart(product)}
            type="button"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {isAdding ? "Adding" : "Add to cart"}
          </button>
          {cartError && (
            <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {cartError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
