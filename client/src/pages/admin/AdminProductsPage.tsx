import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { ProductPayload, productsApi } from "../../api/products.api";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { Product } from "../../types";
import { getApiErrorMessage } from "../../utils/error";
import { formatCurrency } from "../../utils/formatters";

interface ProductFormState {
  title: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  images: string;
  stock: string;
  isActive: boolean;
}

const emptyForm: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  price: "",
  category: "",
  images: "",
  stock: "0",
  isActive: true
};

const toPayload = (form: ProductFormState): ProductPayload => ({
  title: form.title,
  slug: form.slug,
  description: form.description,
  price: Number(form.price),
  category: form.category,
  images: form.images
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean),
  stock: Number(form.stock),
  isActive: form.isActive
});

const toForm = (product: Product): ProductFormState => ({
  title: product.title,
  slug: product.slug,
  description: product.description,
  price: String(product.price),
  category: product.category,
  images: product.images.join(", "),
  stock: String(product.stock),
  isActive: product.isActive
});

export const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products", { admin: true, page: 1, limit: 100 }],
    queryFn: () => productsApi.getProducts({ page: 1, limit: 100 })
  });

  const products = useMemo(() => productsQuery.data?.products ?? [], [productsQuery.data]);

  const invalidateProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: async () => {
      setForm(emptyForm);
      await invalidateProducts();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productsApi.updateProduct(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      setForm(emptyForm);
      await invalidateProducts();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: invalidateProducts
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setForm(toForm(product));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="grid gap-6">
      <form className="card grid gap-4 p-5" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "Edit product" : "Create product"}
          </h2>
          {editingId && (
            <button className="btn-secondary px-3 py-2" onClick={handleCancelEdit} type="button">
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="label">Title</span>
            <input
              className="input-field"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              value={form.title}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="label">Slug</span>
            <input
              className="input-field"
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              required
              value={form.slug}
            />
          </label>
          <label className="grid gap-1.5 md:col-span-2">
            <span className="label">Description</span>
            <textarea
              className="input-field min-h-24"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
              value={form.description}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="label">Price</span>
            <input
              className="input-field"
              min="0"
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              required
              step="0.01"
              type="number"
              value={form.price}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="label">Category</span>
            <input
              className="input-field"
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              required
              value={form.category}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="label">Image URLs</span>
            <input
              className="input-field"
              onChange={(event) => setForm({ ...form, images: event.target.value })}
              placeholder="https://example.com/image.jpg"
              value={form.images}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="label">Stock</span>
            <input
              className="input-field"
              min="0"
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              required
              type="number"
              value={form.stock}
            />
          </label>
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {getApiErrorMessage(createMutation.error ?? updateMutation.error)}
          </p>
        )}

        <button
          className="btn-primary w-fit"
          disabled={createMutation.isPending || updateMutation.isPending}
          type="submit"
        >
          {editingId ? (
            <Save className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {editingId ? "Save product" : "Create product"}
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Product table</h2>
          <p className="mt-1 text-sm text-slate-600">
            Updating stock triggers the backend inventory event.
          </p>
        </div>

        {productsQuery.isLoading && <LoadingState label="Loading products" />}
        {productsQuery.isError && <ErrorState message="Admin products could not load." />}
        {!productsQuery.isLoading && !productsQuery.isError && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {product.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-secondary px-3 py-2"
                          onClick={() => handleEdit(product)}
                          type="button"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          className="btn-secondary px-3 py-2 text-red-600"
                          onClick={() => deleteMutation.mutate(product._id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
