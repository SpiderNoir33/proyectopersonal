const CURRENCY = "USD";

const priceFormatter = new Intl.NumberFormat("es", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => priceFormatter.format(Number(value) || 0);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("es", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
