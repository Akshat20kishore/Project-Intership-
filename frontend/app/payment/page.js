"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Loader from "@/components/Loader";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { clearCatalogCache } from "@/lib/catalog";
import { inr } from "@/lib/format";

function PaymentScreen() {
  const { items, total, hydrated, clear } = useCart();
  const router = useRouter();
  const [shipping, setShipping] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | processing | failed | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("vana:checkout:shipping");
      if (saved) setShipping(JSON.parse(saved));
      else router.replace("/checkout");
    } catch {
      router.replace("/checkout");
    }
  }, [router]);

  if (!hydrated || !shipping) return <Loader page message="Preparing apothecary checkout" />;

  if (items.length === 0 && status !== "processing") {
    return (
      <div className="state">
        <h2>No botanicals to complete</h2>
        <p>Your ritual basket is empty.</p>
        <Link href="/products" className="btn">Browse formulations</Link>
      </div>
    );
  }

  async function pay(outcome) {
    setStatus("processing");
    setMessage("");
    await new Promise((r) => setTimeout(r, 1200));

    if (outcome === "fail") {
      setStatus("failed");
      return;
    }

    try {
      const res = await api("/orders", {
        method: "POST",
        auth: true,
        body: { items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })), shipping },
      });
      sessionStorage.removeItem("vana:checkout:shipping");
      await clearCatalogCache();
      clear();
      router.replace(`/orders?placed=${res.id}`);
    } catch (err) {
      setMessage(err.message);
      setStatus("error");
    }
  }

  if (status === "processing") {
    return <Loader page message="Confirming formulation order with the apothecary" />;
  }

  return (
    <div className="medium">
      <div className="page-head">
        <span className="eyebrow">Checkout Confirmation</span>
        <h1>Ritual Payment</h1>
        <p>This is a simulated sandbox payment gateway. No real card is charged.</p>
      </div>

      {status === "failed" && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: "1rem" }}>
          Simulated transaction declined. Nothing was charged and your ritual basket remains untouched. You can try again.
        </div>
      )}
      {status === "error" && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: "1rem" }}>
          {message} <Link href="/cart">Review basket</Link>.
        </div>
      )}

      <div className="panel stack">
        <ul className="summary-lines">
          {items.map((i) => (
            <li key={i.id}>
              <span>{i.quantity} x {i.name}</span>
              <span>{inr(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="totals">
          <div className="grand">
            <span>Amount Due</span>
            <span>{inr(total)}</span>
          </div>
        </div>
        <div className="small muted">
          Delivering to <strong>{shipping.full_name}</strong>, {shipping.address}, {shipping.city} {shipping.pincode}. <Link href="/checkout">Change address</Link>
        </div>
        <div className="pay-actions">
          <button className="btn" onClick={() => pay("success")}>
            Simulate Successful Ritual Payment
          </button>
          <button className="btn btn-secondary" onClick={() => pay("fail")}>
            Simulate Failed Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Payment() {
  return (
    <RequireAuth>
      <PaymentScreen />
    </RequireAuth>
  );
}
