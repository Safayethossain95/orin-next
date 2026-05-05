"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/data";
import { data } from "@/lib/data";
import { productTitle } from "@/lib/data";
import { useAuth, useCart } from "@/components/providers";

export default function CheckoutPage() {
  const { items, subtotal, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const shipping = data.checkout.shipping_options[0];
  const total = subtotal + shipping.charge;

  return (
    <main className="container grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="surface bg-white p-5">
        <h1 className="text-2xl font-black">Checkout</h1>
        {!user ? (
          <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Login is required for backend order authorization. <Link href="/login" className="underline">Sign in</Link>
          </p>
        ) : null}
        <div className="mt-5 grid gap-3">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-bold">{productTitle(item)}</p>
                  <p className="text-sm text-slate-500">Qty {item.cartQuantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{formatMoney(item.price * item.cartQuantity, item.currency)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-xs font-bold text-red-600">Remove</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">Your cart is empty.</p>
          )}
        </div>
      </section>
      <aside className="surface h-fit bg-white p-5">
        <h2 className="text-xl font-black">Order Summary</h2>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
          <div className="flex justify-between"><span>{shipping.title}</span><strong>{formatMoney(shipping.charge)}</strong></div>
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-3 text-lg"><span>Total</span><strong>{formatMoney(total)}</strong></div>
        </div>
        <button disabled={!items.length || !user} onClick={clearCart} className="mt-5 w-full bg-[var(--brand)] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
          Place demo order
        </button>
      </aside>
    </main>
  );
}
