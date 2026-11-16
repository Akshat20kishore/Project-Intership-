"use client";
import Link from "next/link";
import { useEffect } from "react";
import ProductImage from "@/components/ProductImage";
import QuantityControl from "@/components/QuantityControl";
import Loader from "@/components/Loader";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";
import { inr } from "@/lib/format";

export default function Cart() {
  const { items, hydrated, total, count, setQty, remove, reconcile } = useCart();
  const { products, error } = useCatalog();

  useEffect(() => {
    if (products) reconcile(products);
  }, [products, reconcile]);

  if (!hydrated) return <Loader page message="Opening your ritual bag..." />;

  if (items.length === 0) {
    return (
      <div className="state">
        <h2>Your Ritual Bag is Empty</h2>
        <p>Explore our seasonal apothecary formulations to begin your daily skincare regimen.</p>
        <Link href="/products" className="btn">Explore Formulations</Link>
      </div>
    );
  }

  const blocked = items.some((i) => i.stock <= 0);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1>Your Ritual Bag</h1>
        <p style={{ color: "var(--muted)" }}>{count} {count === 1 ? "formulation" : "formulations"} selected</p>
      </div>

      {error && <div className="alert alert-warn" style={{ marginBottom: "1rem" }}>Prices and harvest availability could not refresh. They will be verified at checkout.</div>}
      {blocked && <div className="alert alert-error" role="alert" style={{ marginBottom: "1rem" }}>Some formulations are currently sold out. Please remove them to proceed.</div>}

      <div className="cart-layout">
        <div className="panel">
          {items.map((item) => (
            <div className="line" key={item.id}>
              <div className="thumb-box">
                <ProductImage src={item.image_url} alt={item.name} />
              </div>
              <div className="line-body">
                <Link href={`/products/${item.id}`} style={{ fontWeight: 600, textDecoration: "none" }}>{item.name}</Link>
                {item.stock <= 0 ? (
                  <p className="stock stock-out">Harvest Exhausted</p>
                ) : (
                  <p className="small muted">{inr(item.price)} each</p>
                )}
                <div className="line-actions">
                  {item.stock > 0 ? (
                    <QuantityControl value={item.quantity} max={item.stock} onChange={(n) => setQty(item.id, n)} label={`Quantity of ${item.name}`} />
                  ) : <span />}
                  <span className="price">{inr(item.price * item.quantity)}</span>
                  <button className="link-danger" onClick={() => remove(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="panel">
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>Ritual Order Summary</h2>
          <div className="totals">
            <div><span>Subtotal</span><span>{inr(total)}</span></div>
            <div><span>Complimentary Botanical Shipping</span><span>Free</span></div>
            <div className="grand"><span>Total Amount</span><span>{inr(total)}</span></div>
          </div>
          <Link
            href="/checkout"
            className="btn btn-block"
            aria-disabled={blocked}
            onClick={(e) => blocked && e.preventDefault()}
            style={{ marginTop: "1.25rem" }}
          >
            Proceed to Delivery
          </Link>
          <Link href="/products" className="btn btn-secondary btn-block" style={{ marginTop: "0.5rem" }}>
            Add More Remedies
          </Link>
        </aside>
      </div>
    </div>
  );
}
