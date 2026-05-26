export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);

export const getProductId = (product: { _id?: string; id?: string }): string =>
  product._id ?? product.id ?? "";
