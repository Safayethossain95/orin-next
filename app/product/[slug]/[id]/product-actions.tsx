"use client";

import type { Product } from "@/lib/types";
import { useCart } from "@/components/providers";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  return (
    <button onClick={() => addItem(product)} className="mt-6 w-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--brand-dark)] md:w-auto">
      Add to cart
    </button>
  );
}
