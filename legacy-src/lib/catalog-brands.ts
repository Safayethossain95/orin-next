import catalogBrandsRaw from "../data/catalog-brands.json";
import catalogBrandProductsRaw from "../data/catalog-brand-products.json";
import type { CategoryFilterProduct, CategorySortKey } from "./categories";
import { createProductImage } from "./home";

type RawBrand = {
  id: string;
  name: string;
  category: string;
  background: string;
  foreground: string;
  accent?: string;
  style: "filled" | "wordmark" | "mark" | "dark" | "italic" | "block" | "split" | "spaced";
};

export type CatalogBrand = {
  id: string;
  name: string;
  category: string;
  image: string;
  detailPath: string;
};

type RawBrandProduct = {
  id: number;
  hid: string;
  brand_id: string;
  slug: string;
  title: string;
  translation: string;
  thumbnail?: string;
  category_id: number;
  sub_category_id: number;
  sub_sub_category_id?: number;
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

const catalogBrandData = catalogBrandsRaw as {
  categories: string[];
  brands: RawBrand[];
};
const catalogBrandProducts = catalogBrandProductsRaw as RawBrandProduct[];

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

function getFontSize(name: string) {
  if (name.length > 15) {
    return 34;
  }

  if (name.length > 10) {
    return 42;
  }

  return 52;
}

function createBrandLogo(brand: RawBrand) {
  const name = escapeXml(brand.name);
  const accent = brand.accent ?? brand.foreground;
  const fontStyle = brand.style === "italic" ? "italic" : "normal";
  const letterSpacing = brand.style === "spaced" ? 7 : 0;
  const weight = brand.style === "wordmark" || brand.style === "italic" ? 800 : 900;
  const fontSize = getFontSize(brand.name);
  const markOpacity = brand.style === "filled" || brand.style === "dark" ? 0.18 : 0.12;
  const splitText =
    brand.style === "split" && brand.name.includes(" ")
      ? brand.name.split(" ")
      : null;

  const text = splitText
    ? `<text x="136" y="90" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="${brand.foreground}">${escapeXml(
        splitText[0],
      )}</text>
      <text x="136" y="128" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="${escapeXml(
        accent,
      )}">${escapeXml(splitText.slice(1).join(" "))}</text>`
    : `<text x="180" y="108" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-style="${fontStyle}" font-weight="${weight}" letter-spacing="${letterSpacing}" fill="${brand.foreground}">${name}</text>`;

  const mark =
    brand.style === "mark" || brand.style === "split"
      ? `<circle cx="76" cy="92" r="34" fill="${escapeXml(accent)}" opacity="0.16" />
      <path d="M48 98c20-42 57-42 76 0-24-15-51-15-76 0Z" fill="${escapeXml(accent)}" opacity="0.9" />`
      : `<rect x="24" y="28" width="312" height="104" rx="4" fill="${brand.foreground}" opacity="${markOpacity}" />`;

  const underline =
    brand.style === "block"
      ? `<rect x="72" y="128" width="216" height="8" rx="4" fill="${escapeXml(accent)}" />`
      : "";

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" role="img" aria-label="${name}">
    <rect width="360" height="160" fill="${brand.background}" />
    ${mark}
    ${text}
    ${underline}
  </svg>`);
}

function getBrandRouteId(brandId: string) {
  return brandId === "haier" ? "te" : brandId.slice(0, 2);
}

function createHaierAcImage(title: string) {
  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 320" role="img" aria-label="${escapeXml(
    title,
  )}">
    <rect width="360" height="320" fill="#f8fafc" />
    <text x="34" y="40" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" fill="#0271bd">Haier</text>
    <text x="34" y="58" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#0271bd">www.haier.com.bd</text>
    <rect x="54" y="124" width="252" height="68" rx="8" fill="#ffffff" stroke="#d7dde6" />
    <rect x="64" y="180" width="232" height="18" rx="9" fill="#e5ebf2" />
    <rect x="75" y="136" width="210" height="12" rx="6" fill="#f0f4f8" />
    <text x="180" y="164" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#111827">Haier</text>
    <circle cx="288" cy="154" r="4" fill="#67e8f9" />
  </svg>`);
}

function getBrandProductImage(product: RawBrandProduct, index: number) {
  if (product.thumbnail?.trim()) {
    return product.thumbnail;
  }

  if (product.brand_id === "haier") {
    return createHaierAcImage(product.title);
  }

  const palettes = [
    { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
    { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
    { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  ];

  return createProductImage(product.title, palettes[index % palettes.length]);
}

function adaptBrandProduct(
  product: RawBrandProduct,
  index: number,
): CategoryFilterProduct & { brandId: string } {
  return {
    id: product.id,
    hid: product.hid,
    slug: product.slug,
    title: product.title,
    translation: product.translation,
    thumbnail: getBrandProductImage(product, index),
    categoryId: product.category_id,
    subCategoryId: product.sub_category_id,
    subSubCategoryId: product.sub_sub_category_id,
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
    brandId: product.brand_id,
  };
}

const brands = catalogBrandData.brands.map((brand) => ({
  id: brand.id,
  name: brand.name,
  category: brand.category,
  image: createBrandLogo(brand),
  detailPath: `/brand/${brand.id}/${getBrandRouteId(brand.id)}/`,
}));
const brandProducts = catalogBrandProducts.map(adaptBrandProduct);

export function loadCatalogBrands() {
  return {
    categories: catalogBrandData.categories,
    brands,
  };
}

export function resolveCatalogBrand(params: { slug?: string; id?: string }) {
  return (
    brands.find(
      (brand) =>
        brand.id === params.slug &&
        (!params.id || getBrandRouteId(brand.id) === params.id),
    ) ?? null
  );
}

export function getProductsForBrand(
  brandId: string,
  sortKey: CategorySortKey,
  range: { min?: number; max?: number },
) {
  const filtered = brandProducts.filter((product) => {
    if (product.brandId !== brandId) {
      return false;
    }

    if (range.min && product.price < range.min) {
      return false;
    }

    if (range.max && product.price > range.max) {
      return false;
    }

    return true;
  });

  return [...filtered].sort((first, second) => {
    if (sortKey === "highest_sold") {
      return second.soldCount - first.soldCount;
    }

    if (sortKey === "highest_rating") {
      return second.rating - first.rating;
    }

    if (sortKey === "lowest_price") {
      return first.price - second.price;
    }

    if (sortKey === "highest_price") {
      return second.price - first.price;
    }

    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
}
