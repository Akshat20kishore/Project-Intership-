"use client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ErrorState from "@/components/ErrorState";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { useCatalog } from "@/lib/catalog";

export default function Home() {
  const { products, loading, error, refresh } = useCatalog();
  const featured = (products || []).filter((p) => p.stock > 0).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Himalayan Botanicals & Timeless Ayurvedic Rituals.</h1>
          <p>
            Wildcrafted in high-altitude valleys, cold-pressed in small micro-batches, and
            infused with therapeutic botanicals for luminous, restored skin.
          </p>
          <div className="row">
            <Link href="/products" className="btn">Explore Remedies</Link>
            <Link href="/products?category=Ritual%20Sets" className="btn btn-secondary">Ritual Sets</Link>
          </div>
        </div>
        <div className="hero-shelf" aria-hidden="true">
          <img src="/products/kumkumadi.jpg" alt="Kumkumadi beauty fluid" />
          <img src="/products/rosehip.jpg" alt="Rosehip glow oil" />
          <img src="/products/saffron-cream.jpg" alt="Restorative night balm" />
        </div>
      </section>

      <section className="section" style={{ marginTop: "3rem" }}>
        <div className="row row-between" style={{ marginBottom: "1.25rem" }}>
          <h2>Seasonal Formulations</h2>
          <Link href="/products" style={{ fontWeight: 600, color: "var(--accent)" }}>View Full Apothecary →</Link>
        </div>
        {loading && !products ? (
          <ProductGridSkeleton count={4} />
        ) : error && !products ? (
          <ErrorState title="Could not load botanical formulations" message={error} onRetry={refresh} />
        ) : (
          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: "4rem", display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="panel">
          <h3 style={{ marginBottom: "0.5rem" }}>Pure & Unadulterated</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Zero synthetic fillers, artificial fragrance, or parabens. Pure cold-pressed seed oils and plant extracts.</p>
        </div>
        <div className="panel">
          <h3 style={{ marginBottom: "0.5rem" }}>Hand-Harvested in Season</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Wildcrafted with cooperative high-altitude farming families across Kashmir, Uttarakhand, and Himachal.</p>
        </div>
        <div className="panel">
          <h3 style={{ marginBottom: "0.5rem" }}>Artisanal Glass Packaging</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Bottled in UV-protective amber and miron glass to preserve the vital life force of delicate botanical compounds.</p>
        </div>
      </section>
    </>
  );
}
