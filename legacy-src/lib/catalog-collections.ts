import catalogCollectionsRaw from "../data/catalog-collections.json";
import type { CategoryFilterProduct } from "./categories";
import { createProductImage } from "./home";

type RawCollectionProduct = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  price: number;
  compare_price: number;
  currency: string;
  rating: number;
  rating_total: number;
  quantity: number;
  is_continue_selling: boolean;
  sold_count: number;
  created_at: string;
};

type RawCollection = {
  id: string;
  hid: string;
  slug: string;
  title: string;
  subtitle: string;
  offer: string;
  category: string;
  background: string;
  foreground: string;
  accent: string;
  product: string;
  products: RawCollectionProduct[];
};

export type CatalogCollection = {
  id: string;
  hid: string;
  slug: string;
  title: string;
  image: string;
  detailPath: string;
};

const collectionsRaw = catalogCollectionsRaw as RawCollection[];

function toDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createCollectionImage(collection: RawCollection, index: number) {
  const productX = index % 2 === 0 ? 650 : 140;
  const textX = index % 2 === 0 ? 72 : 520;
  const align = index % 2 === 0 ? "start" : "middle";

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 270" role="img" aria-label="${escapeXml(
    collection.title,
  )}">
    <defs>
      <linearGradient id="band" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="880" height="270" rx="4" fill="${collection.background}" />
    <path d="M0 0h880v270H0z" fill="url(#band)" />
    <circle cx="110" cy="62" r="52" fill="#ffffff" opacity="0.11" />
    <circle cx="782" cy="210" r="76" fill="#ffffff" opacity="0.1" />
    <text x="${textX}" y="82" text-anchor="${align}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="900" fill="${collection.foreground}">${escapeXml(
      collection.title,
    )}</text>
    <text x="${textX}" y="122" text-anchor="${align}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${collection.accent}">${escapeXml(
      collection.subtitle,
    )}</text>
    <g transform="translate(${textX}, 146)">
      <rect x="${index % 2 === 0 ? 0 : -140}" y="0" width="280" height="54" rx="8" fill="#ffffff" opacity="0.95" />
      <text x="${index % 2 === 0 ? 140 : 0}" y="35" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="900" fill="${collection.background}">${escapeXml(
        collection.offer,
      )}</text>
    </g>
    <g transform="translate(${productX}, 54)">
      <rect x="-52" y="112" width="242" height="32" rx="16" fill="#000000" opacity="0.14" />
      <rect x="-16" y="20" width="88" height="130" rx="12" fill="#ffffff" stroke="#d1d5db" />
      <rect x="88" y="52" width="92" height="96" rx="14" fill="#f8fafc" stroke="#d1d5db" />
      <circle cx="134" cy="100" r="26" fill="${collection.accent}" opacity="0.85" />
      <rect x="-52" y="74" width="72" height="76" rx="10" fill="#f1f5f9" stroke="#d1d5db" />
    </g>
    <text x="72" y="238" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${collection.foreground}" opacity="0.9">${escapeXml(
      collection.product,
    )}</text>
  </svg>`);
}

function createCollectionProductImage(
  product: RawCollectionProduct,
  index: number,
) {
  const palettes = [
    { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
    { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
    { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
    { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
    { background: "#ecfeff", foreground: "#0891b2", accent: "#164e63" },
  ];

  return createProductImage(product.title, palettes[index % palettes.length]);
}

const collections = collectionsRaw.map((collection, index) => ({
  id: collection.id,
  hid: collection.hid,
  slug: collection.slug,
  title: collection.title,
  image: createCollectionImage(collection, index),
  detailPath: `/collection/${collection.slug}/${collection.hid}/`,
}));

export function loadCatalogCollections() {
  return collections;
}

export function resolveCatalogCollection(params: {
  slug?: string;
  id?: string;
}) {
  const rawCollection = collectionsRaw.find(
    (collection) =>
      collection.slug === params.slug && collection.hid === params.id,
  );

  if (!rawCollection) {
    return null;
  }

  const index = collectionsRaw.findIndex(
    (collection) => collection.id === rawCollection.id,
  );

  return {
    id: rawCollection.id,
    hid: rawCollection.hid,
    slug: rawCollection.slug,
    title: rawCollection.title,
    image: createCollectionImage(rawCollection, index),
    detailPath: `/collection/${rawCollection.slug}/${rawCollection.hid}/`,
  };
}

export function getCollectionProducts(
  collectionId: string,
): CategoryFilterProduct[] {
  const collection = collectionsRaw.find((item) => item.id === collectionId);

  return (collection?.products ?? []).map((product, index) => ({
    id: product.id,
    hid: product.hid,
    slug: product.slug,
    title: product.title,
    translation: product.translation,
    thumbnail: createCollectionProductImage(product, index),
    categoryId: 103,
    subCategoryId: 206,
    price: product.price,
    comparePrice: product.compare_price,
    currency: product.currency,
    rating: product.rating,
    ratingTotal: product.rating_total,
    quantity: product.quantity,
    isContinueSelling: product.is_continue_selling,
    soldCount: product.sold_count,
    createdAt: product.created_at,
    detailPath: `/product/${product.slug}/${product.hid}/`,
  }));
}
