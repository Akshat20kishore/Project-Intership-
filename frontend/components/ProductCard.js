import Link from "next/link";
import ProductImage from "./ProductImage";
import { inr, stockState } from "@/lib/format";

export default function ProductCard({ product }) {
  const state = stockState(product.stock);
  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`} className="product-media" aria-label={product.name}>
        <ProductImage src={product.image_url} alt={product.name} />
      </Link>
      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-foot">
          <span className="price">{inr(product.price)}</span>
          <span className={`stock stock-${state.key}`}>{state.label}</span>
        </div>
      </div>
    </article>
  );
}
