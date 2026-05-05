"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { menuData, orinTheme } from "@/lib/orin-home-data";
import { useAuth, useCart } from "./providers";

const routeMap: Record<string, string> = {
  home: "/",
  categories: "/categories",
  "new product": "/product/new",
  "flash sale": "/product/flash",
  brand: "/brands",
  campaign: "/campaigns",
  collection: "/collections",
};

function menuKey(label: string) {
  return label.trim().toLowerCase();
}

function activeKey(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/categories" || pathname.startsWith("/category/") || pathname.startsWith("/sub-category/") || pathname.startsWith("/sub-sub-category/")) return "categories";
  if (pathname === "/product/new") return "new product";
  if (pathname === "/product/flash") return "flash sale";
  if (pathname === "/brands" || pathname.startsWith("/brand/")) return "brand";
  if (pathname === "/campaigns" || pathname.startsWith("/campaign/")) return "campaign";
  if (pathname === "/collections" || pathname.startsWith("/collection/")) return "collection";
  return "";
}

export function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="bg-white">
        <div className={`${orinTheme.container} flex items-center gap-2 py-2 lg:gap-4 lg:py-4`}>
          <Link href="/" className="flex shrink-0 items-center gap-1.5 lg:gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#8e208c] text-sm font-black text-white lg:h-11 lg:w-11 lg:rounded-2xl lg:text-lg">O</span>
            <div className="min-w-0">
              <div className="text-base font-black uppercase tracking-[0.12em] text-[#8e208c] lg:text-2xl lg:tracking-[0.22em]">Orin</div>
            </div>
          </Link>

          <div className="flex min-w-0 flex-auto items-center rounded-full border border-[#d7c2e5] bg-[#fbf9fe] px-1 py-1 lg:px-2 lg:py-2">
            <input type="text" placeholder="Search by product, brand or category" className="min-w-0 w-full border-none bg-transparent px-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 lg:px-3 lg:text-sm" />
            <button className="rounded-full bg-[#8e208c] px-4 py-1.5 text-xs font-semibold text-white lg:px-5 lg:py-2 lg:text-sm">Search</button>
          </div>

          <div className="flex w-auto shrink-0 items-center justify-end gap-0.5">
            <Link href="/user/wishlist" className="relative hidden h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:text-[#8e208c] lg:inline-flex" aria-label="Wishlist">
              <span className="text-2xl leading-none">♡</span>
              <span className="absolute -top-1 left-5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8e208c] px-1 text-[10px] font-bold leading-none text-white">4</span>
            </Link>
            <Link href="/checkout" className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:text-[#8e208c]" aria-label="Cart">
              <span className="text-xl leading-none">🛒</span>
              {count > 0 ? <span className="absolute -top-1 left-5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8e208c] px-1 text-[10px] font-bold leading-none text-white">{count}</span> : null}
            </Link>
            <span className={`mx-2 h-6 w-px bg-slate-200 lg:block ${user ? "invisible hidden" : ""}`} aria-hidden="true" />
            {user ? (
              <div className="hidden h-9 w-9 shrink-0 items-center justify-end lg:flex">
                <Link href="/user" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:text-[#8e208c]" aria-label="Account">👤</Link>
              </div>
            ) : (
              <div className="hidden shrink-0 items-center justify-end space-x-2 text-sm font-semibold text-slate-600 lg:ms-2 lg:block">
                <Link href="/login" className="cursor-pointer transition hover:text-[#8e208c]">Login</Link>
                <span className="text-slate-300">/</span>
                <Link href="/register" className="cursor-pointer transition hover:text-[#8e208c]">Register</Link>
              </div>
            )}
            {user ? (
              <button onClick={() => void signOut()} className="hidden text-xs font-bold text-slate-500 hover:text-[#8e208c] lg:block">Logout</button>
            ) : null}
            <button type="button" className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:text-[#8e208c] lg:hidden" aria-label="Open sidebar" onClick={() => setOpen(true)}>
              <span className="text-2xl leading-none">☰</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden bg-[#8e208c] text-white lg:block">
        <div className="mx-auto flex min-h-10 w-full max-w-[1280px] flex-wrap items-stretch gap-x-0 gap-y-2 px-6 text-sm font-medium">
          {menuData.primaryLinks.map((link) => {
            const key = menuKey(link);
            const href = routeMap[key] ?? "#";
            const isActive = activeKey(pathname) === key;
            return (
              <Link key={link} href={href} className={`inline-flex min-h-10 items-center gap-1.5 px-4 transition ${isActive ? "bg-white !text-black visited:!text-black hover:bg-slate-50 hover:!text-black" : "text-white hover:bg-white/10"}`}>
                {key === "home" ? <span className="text-base">⌂</span> : null}
                {link}
              </Link>
            );
          })}
        </div>
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button type="button" className={`absolute inset-0 bg-slate-700/70 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} aria-label="Close sidebar" onClick={() => setOpen(false)} />
        <aside className={`relative flex h-full w-full max-w-xs flex-col bg-white py-4 shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <button type="button" className="absolute right-3 top-3 text-2xl text-slate-500" onClick={() => setOpen(false)} aria-label="Close sidebar">×</button>
          <Link href="/" className="flex items-center justify-center gap-3 px-4" onClick={() => setOpen(false)}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8e208c] text-base font-black text-white">O</span>
            <div>
              <div className="text-xl font-black uppercase tracking-[0.22em] text-[#8e208c]">Orin</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Curated Store</div>
            </div>
          </Link>
          <nav className="mt-4 h-0 flex-1 overflow-y-auto border-t border-slate-100 px-2 pt-3">
            {menuData.primaryLinks.map((link) => {
              const key = menuKey(link);
              return (
                <Link key={link} href={routeMap[key] ?? "#"} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fbf7fb] hover:text-[#8e208c]">
                  {link}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-slate-100 pt-4">
              {user ? <Link href="/user" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700">Account</Link> : <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700">Login / Register</Link>}
            </div>
          </nav>
        </aside>
      </div>
    </header>
  );
}
