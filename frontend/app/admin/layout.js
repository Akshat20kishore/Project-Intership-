"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Formulations" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  return (
    <RequireAuth admin>
      <div className="page-head">
        <span className="eyebrow">Apothecary Management</span>
        <h1>Store Admin</h1>
      </div>
      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={pathname === t.href ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </RequireAuth>
  );
}
