import newProductsRaw from "../data/new-products.json";
import { createProductImage } from "./home";
import type { CategoryFilterProduct } from "./categories";

type RawNewProduct = {
  id: number;
  hid: string;
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

const productPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
  { background: "#f1f5f9", foreground: "#0f172a", accent: "#334155" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
];

const rawNewProducts = newProductsRaw as RawNewProduct[];

function getProductImage(product: RawNewProduct, index: number) {
  return (
    product.thumbnail?.trim() ||
    createProductImage(
      product.title,
      productPalettes[index % productPalettes.length],
    )
  );
}

function adaptNewProduct(
  product: RawNewProduct,
  index: number,
): CategoryFilterProduct {
  return {
    id: product.id,
    hid: product.hid,
    slug: product.slug,
    title: product.title,
    translation: product.translation,
    thumbnail: getProductImage(product, index),
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
  };
}

const newProducts = rawNewProducts.map(adaptNewProduct);

export function loadNewProducts() {
  return newProducts;
}

export function filterNewProductsByPrice(
  products: CategoryFilterProduct[],
  range: { min?: number; max?: number },
) {
  return products.filter((product) => {
    if (range.min && product.price < range.min) {
      return false;
    }

    if (range.max && product.price > range.max) {
      return false;
    }

    return true;
  });
}
