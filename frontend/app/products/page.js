"use client";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ErrorState from "@/components/ErrorState";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { useCatalog } from "@/lib/catalog";
import { timeAgo } from "@/lib/format";

export default function Products() {
  const { products, loading, refreshing, error, slow, savedAt, refresh } = useCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c) setCategory(c);
  }, []);

  const categories = useMemo(() => ["All", ...new Set((products || []).map((p) => p.category))], [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products || []).filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [products, query, category]);

  function clearFilters() {
    setQuery("");
    setCategory("All");
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.4rem" }}>Botanical Apothecary</h1>
        <p style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
          {products ? `${visible.length} of ${products.length} formulations available` : "Loading remedies..."}
          {savedAt && !refreshing ? `, updated ${timeAgo(savedAt)}` : ""}
        </p>
      </div>

      <div className="row row-between" style={{ marginBottom: "1.25rem", gap: "1rem" }}>
        <div className="field" style={{ flex: 1, minWidth: "260px" }}>
          <label htmlFor="search" style={{ position: "absolute", left: "-9999px" }}>Search Remedies</label>
          <input
            id="search"
            type="search"
            placeholder="Search by ingredient (saffron, rosehip, vetiver...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={refresh} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh Catalog"}
        </button>
      </div>

      <div className="chips" role="group" aria-label="Filter by category" style={{ marginBottom: "1.75rem" }}>
        {categories.map((c) => (
          <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {error && products && (
        <div className="alert alert-warn" role="status" style={{ marginBottom: "1rem" }}>
          Showing cached apothecary catalog because network update failed. {error}
        </div>
      )}

      {loading && !products ? (
        <>
          <ProductGridSkeleton />
          {slow && <p className="muted small" style={{ marginTop: "1rem" }}>Apothecary server is waking up. This may take a moment.</p>}
        </>
      ) : error && !products ? (
        <ErrorState title="Could not load botanical formulations" message={error} onRetry={refresh} />
      ) : visible.length === 0 ? (
        <div className="state">
          <h2>No matching formulations found</h2>
          <p>Try searching for a different botanical herb or clear category filters.</p>
          <button className="btn" onClick={clearFilters}>Reset Filters</button>
        </div>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
