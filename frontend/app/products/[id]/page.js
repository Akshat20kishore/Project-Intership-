"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductImage from "@/components/ProductImage";
import QuantityControl from "@/components/QuantityControl";
import ErrorState from "@/components/ErrorState";
import Loader from "@/components/Loader";
import { useCatalog } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import { inr, stockState } from "@/lib/format";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading, error, refresh } = useCatalog();
  const { add, items } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  const product = products?.find((p) => p.id === id);

  useEffect(() => {
    if (product && qty > product.stock && product.stock > 0) setQty(product.stock);
  }, [product, qty]);

  if (loading && !products) return <Loader page message="Preparing botanical formulation..." />;
  if (error && !products) return <ErrorState title="Could not load formulation" message={error} onRetry={refresh} />;
  if (!product) {
    return (
      <div className="state">
        <h2>Formulation Not Found</h2>
        <p>This remedy may have concluded its seasonal run.</p>
        <Link href="/products" className="btn">Return to Apothecary</Link>
      </div>
    );
  }

  const state = stockState(product.stock);
  const inCart = items.find((i) => i.id === product.id)?.quantity || 0;

  function addToCart() {
    const res = add(product, qty);
    toast(res.message || `${qty} x ${product.name} added to your ritual bag.`, res.ok ? "success" : "error");
  }

  return (
    <div className="detail">
      <div className="detail-media">
        <ProductImage src={product.image_url} alt={product.name} eager />
      </div>
      <div className="detail-info">
        <p className="product-category">{product.category}</p>
        <h1 style={{ fontSize: "clamp(1.9rem, 5vw, 2.7rem)" }}>{product.name}</h1>
        <p className="detail-price">{inr(product.price)}</p>
        <p className={`stock stock-${state.key}`}>{state.label}</p>
        <p style={{ marginTop: "0.75rem", fontSize: "1.05rem", color: "var(--muted)" }}>{product.description}</p>

        {state.key === "out" ? (
          <div className="alert alert-warn" style={{ marginTop: "1rem" }}>
            This formulation is currently exhausted until the spring harvest.
          </div>
        ) : (
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <QuantityControl value={qty} max={product.stock} onChange={(n) => setQty(Math.max(1, n))} label="Quantity" />
            <button className="btn" onClick={addToCart}>Add to Ritual Bag</button>
          </div>
        )}
        {inCart > 0 && (
          <p className="small muted" style={{ marginTop: "0.5rem" }}>
            {inCart} currently in your bag. <Link href="/cart" style={{ color: "var(--brand)", fontWeight: 600 }}>View Bag</Link>
          </p>
        )}
      </div>
    </div>
  );
}
