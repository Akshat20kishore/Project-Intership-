"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Loader from "@/components/Loader";
import Field from "@/components/Field";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/format";
import { validateShipping } from "@/lib/validate";

const EMPTY = { full_name: "", phone: "", address: "", city: "", pincode: "" };

function CheckoutForm() {
  const { items, total, hydrated } = useCart();
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("vana:checkout:shipping");
      if (saved) setValues({ ...EMPTY, ...JSON.parse(saved) });
    } catch {
      /* ignore unreadable saved data */
    }
  }, []);

  if (!hydrated) return <Loader page message="Preparing your ritual order" />;

  if (items.length === 0) {
    return (
      <div className="state">
        <h2>Your ritual basket is empty</h2>
        <p>Select your preferred botanicals and elixirs before proceeding to checkout.</p>
        <Link href="/products" className="btn">Browse formulations</Link>
      </div>
    );
  }

  const blocked = items.some((i) => i.stock <= 0 || i.quantity > i.stock);
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const found = validateShipping(values);
    setErrors(found);
    if (Object.keys(found).length || blocked) return;
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    sessionStorage.setItem("vana:checkout:shipping", JSON.stringify(clean));
    router.push("/payment");
  }

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">Apothecary Delivery</span>
        <h1>Shipping Address</h1>
      </div>
      <div className="cart-layout">
        <form className="panel" onSubmit={submit} noValidate>
          {blocked && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: "1rem" }}>
              A botanical in your basket is freshly sold out. <Link href="/cart">Adjust your basket</Link>.
            </div>
          )}
          <div className="form-grid">
            <Field
              label="Recipient full name"
              name="full_name"
              autoComplete="name"
              value={values.full_name}
              onChange={set("full_name")}
              error={errors.full_name}
            />
            <Field
              label="Mobile contact"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              value={values.phone}
              onChange={set("phone")}
              error={errors.phone}
            />
            <Field
              label="Door, suite & street address"
              name="address"
              autoComplete="street-address"
              value={values.address}
              onChange={set("address")}
              error={errors.address}
            />
            <div className="form-grid two">
              <Field
                label="City / Town"
                name="city"
                autoComplete="address-level2"
                value={values.city}
                onChange={set("city")}
                error={errors.city}
              />
              <Field
                label="PIN Code"
                name="pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                value={values.pincode}
                onChange={set("pincode")}
                error={errors.pincode}
              />
            </div>
          </div>
          <button className="btn btn-block" style={{ marginTop: "1.25rem" }} disabled={blocked}>
            Continue to Payment
          </button>
        </form>

        <aside className="panel summary">
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>Ritual Order</h2>
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
              <span>Order Total</span>
              <span>{inr(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <RequireAuth>
      <CheckoutForm />
    </RequireAuth>
  );
}
