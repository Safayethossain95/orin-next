"use client";

import Link from "next/link";
import { formatMoney, productComparePrice, productImage, productSlug, productTitle } from "@/lib/data";
import type { Product } from "@/lib/types";
import { useCart } from "./providers";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const compareAt = productComparePrice(product);

  return (
    <article className="surface flex min-h-[320px] flex-col bg-white">
      <Link href={`/product/${productSlug(product)}/${product.id}`} className="block bg-slate-50">
        <img src={productImage(product)} alt={productTitle(product)} className="aspect-square w-full object-contain p-4" />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs font-bold uppercase text-[var(--brand)]">{product.brand ?? product.badge ?? "Orin"}</p>
        <Link href={`/product/${productSlug(product)}/${product.id}`} className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
          {productTitle(product)}
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex items-end gap-2">
            <span className="text-base font-black text-slate-950">{formatMoney(product.price, product.currency)}</span>
            {compareAt ? <span className="text-xs font-semibold text-slate-400 line-through">{formatMoney(compareAt, product.currency)}</span> : null}
          </div>
          <button onClick={() => addItem(product)} className="mt-3 w-full bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--brand-dark)]">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={`${product.id}-${productSlug(product)}`} product={product} />
      ))}
    </div>
  );
}
