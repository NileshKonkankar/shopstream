import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../api/products.api";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { ProductCard } from "../../components/product/ProductCard";

export const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { search, category }],
    queryFn: () =>
      productsApi.getProducts({
        search: search || undefined,
        category: category || undefined,
        page: 1,
        limit: 24
      })
  });

  const categories = useMemo(() => {
    const values = data?.products.map((product) => product.category) ?? [];
    return Array.from(new Set(values));
  }, [data?.products]);

  return (
    <section className="container-page py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Products</h1>
          <p className="mt-2 text-slate-600">Search and filter active catalog items.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px] md:w-[520px]">
          <label className="relative">
            <span className="sr-only">Search products</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className="input-field pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              value={search}
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              className="input-field"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading products" />}
      {isError && <ErrorState message="Products could not be loaded." />}
      {!isLoading && !isError && data?.products.length === 0 && (
        <EmptyState
          message="Try clearing search filters or ask an admin to add products."
          title="No products found"
        />
      )}
      {!isLoading && !isError && Boolean(data?.products.length) && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
