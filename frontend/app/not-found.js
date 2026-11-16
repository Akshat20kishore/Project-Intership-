import Link from "next/link";

export default function NotFound() {
  return (
    <div className="state">
      <h2>Page Not Found</h2>
      <p>The botanical elixir or page you are looking for has been moved or does not exist.</p>
      <Link href="/products" className="btn">Return to Catalog</Link>
    </div>
  );
}
