export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const STATUS_LABELS = {
  new: "Order Placed",
  processing: "Crafting in Apothecary",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const shortId = (id) => (id ? id.slice(0, 8).toUpperCase() : "");

export function dateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function stockState(stock) {
  if (stock <= 0) return { key: "out", label: "Harvest Exhausted (Sold out)" };
  if (stock <= 5) return { key: "low", label: `Only ${stock} small-batch units remaining` };
  return { key: "in", label: "In Stock & Freshly Bottled" };
}
