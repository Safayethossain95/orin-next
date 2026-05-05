import { createSignal } from "solid-js";
import type { loadUserDashboardData } from "./user-dashboard";

type DashboardData = ReturnType<typeof loadUserDashboardData>;
export type WishlistProduct = DashboardData["wishlist"][number];

const WISHLIST_STORAGE_KEY = "orin.wishlist.productIds";
const WISHLIST_RECORDS_STORAGE_KEY = "orin.wishlist.products";

const [wishlistIds, setWishlistIds] = createSignal<string[]>([]);
const [wishlistRecords, setWishlistRecords] = createSignal<WishlistProduct[]>([]);
let isWishlistLoaded = false;

function persistWishlist(nextIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextIds));
}

function persistWishlistRecords(nextProducts: WishlistProduct[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WISHLIST_RECORDS_STORAGE_KEY, JSON.stringify(nextProducts));
}

export function ensureWishlistLoaded(defaultProducts: WishlistProduct[]) {
  if (isWishlistLoaded || typeof window === "undefined") {
    return;
  }

  const defaultIds = defaultProducts.map((product) => product.id);
  const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
  const storedProducts = window.localStorage.getItem(WISHLIST_RECORDS_STORAGE_KEY);

  if (storedProducts) {
    try {
      const parsedProducts = JSON.parse(storedProducts);

      if (Array.isArray(parsedProducts)) {
        setWishlistRecords(
          parsedProducts.filter(
            (value): value is WishlistProduct =>
              Boolean(value) &&
              typeof value === "object" &&
              typeof (value as WishlistProduct).id === "string",
          ),
        );
      }
    } catch {
      persistWishlistRecords([]);
    }
  }

  if (!stored) {
    setWishlistIds(defaultIds);
    persistWishlist(defaultIds);
    isWishlistLoaded = true;
    return;
  }

  try {
    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) {
      setWishlistIds(parsed.filter((value): value is string => typeof value === "string"));
    }
  } catch {
    setWishlistIds(defaultIds);
    persistWishlist(defaultIds);
  }

  isWishlistLoaded = true;
}

export function wishlistProductIds(defaultProducts: WishlistProduct[]) {
  ensureWishlistLoaded(defaultProducts);
  return wishlistIds;
}

export function wishlistProductCount(defaultProducts: WishlistProduct[]) {
  ensureWishlistLoaded(defaultProducts);
  return () => wishlistIds().length;
}

export function wishlistProducts(defaultProducts: WishlistProduct[]) {
  ensureWishlistLoaded(defaultProducts);

  return () => {
    const productMap = new Map<string, WishlistProduct>();

    for (const product of [...defaultProducts, ...wishlistRecords()]) {
      productMap.set(product.id, product);
    }

    return wishlistIds()
      .map((id) => productMap.get(id))
      .filter((product): product is WishlistProduct => Boolean(product));
  };
}

export function toggleWishlistProduct(
  productId: string,
  defaultProducts: WishlistProduct[],
  product?: WishlistProduct,
) {
  ensureWishlistLoaded(defaultProducts);

  setWishlistIds((currentIds) => {
    const isRemoving = currentIds.includes(productId);
    const nextIds = isRemoving
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];

    persistWishlist(nextIds);

    if (isRemoving) {
      setWishlistRecords((currentProducts) => {
        const nextProducts = currentProducts.filter((item) => item.id !== productId);
        persistWishlistRecords(nextProducts);
        return nextProducts;
      });
    } else if (product) {
      setWishlistRecords((currentProducts) => {
        const nextProducts = [
          ...currentProducts.filter((item) => item.id !== product.id),
          product,
        ];
        persistWishlistRecords(nextProducts);
        return nextProducts;
      });
    }

    return nextIds;
  });
}
