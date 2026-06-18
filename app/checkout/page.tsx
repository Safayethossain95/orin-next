"use client";

import { useAuth, useCart } from "@/components/providers";
import { createOrder } from "@/lib/api";
import { data, formatMoney, productImage, productTitle } from "@/lib/data";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, subtotal, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const shipping = data.checkout.shipping_options[0];
  const total = subtotal + shipping.charge;
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const getProductUrl = (item) => {
    const slug = productTitle(item)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/(^-|-$)+/g, ""); // Remove leading/trailing hyphens

    return `/product/${slug}/${item.id}`;
  };
  return (
    <main className="container grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="surface bg-white p-5">
        <h1 className="text-2xl font-black">Checkout</h1>
        {!user ? (
          <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Login is required for backend order authorization.{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        ) : null}
        <div className="mt-6 space-y-4">
          {items.length ? (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  {/* Product Thumbnail */}
                  <Link
                    href={getProductUrl(item)}
                    className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 transition-all hover:border-[var(--brand)] hover:shadow-sm"
                  >
                    <img
                      src={productImage(item)}
                      alt={productTitle(item)}
                      className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col gap-1">
                    <Link href={getProductUrl(item)}>
                      <h4 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-[var(--brand)] transition-colors">
                        {productTitle(item)}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500 uppercase tracking-tight">
                      <span>Qty {item.cartQuantity}</span>
                      <span className="h-3 w-px bg-slate-200"></span>
                      <span>{formatMoney(item.price, item.currency)} / ea</span>
                    </div>

                    {/* Action Link */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-1 w-fit text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Price Section */}
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-slate-950">
                      {formatMoney(
                        item.price * item.cartQuantity,
                        item.currency,
                      )}
                    </p>
                    {/* Visual indicator for multi-item price */}
                    {item.cartQuantity > 1 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        Total
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-100 py-10 text-center">
              <p className="text-sm font-medium text-slate-400">
                Your shopping bag is empty.
              </p>
            </div>
          )}
        </div>
      </section>
      <aside className="surface h-fit bg-white p-5">
        <h2 className="text-xl font-black">Order Summary</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setMessage(null);
            try {
              const orderId = await createOrder({
                name,
                address,
                phone,
                items,
                subtotal,
                shipping,
                total,
                createdAt: new Date().toISOString(),
              });
              if (!orderId) throw new Error("Failed to create order");
              setMessage("Order placed — ID: " + orderId);
              setName("");
              setAddress("");
              setPhone("");
              clearCart();
            } catch (err: any) {
              setMessage(err?.message ?? "Could not place order");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="mt-4 grid gap-2 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Address
              </label>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Phone
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>{shipping.title}</span>
              <strong>{formatMoney(shipping.charge)}</strong>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-3 text-lg">
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled={!items.length || !user || loading}
              type="submit"
              className="w-full bg-[var(--brand)] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Placing order..." : "Place order"}
            </button>
            {message ? (
              <p className="mt-3 text-sm font-medium text-slate-700">
                {message}
              </p>
            ) : null}
          </div>
        </form>
      </aside>
    </main>
  );
}
