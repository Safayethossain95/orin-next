import flashSaleProductsRaw from "../data/flash-sale-products.json";
import type { CategoryFilterProduct } from "./categories";

type RawFlashWholesale = {
  id: number;
  maxOrder: number;
  minOrder: number;
  price: number;
};

type RawFlashProduct = {
  comparePrice: number;
  currency: string;
  discount: number;
  features: Array<{ key: string; value: string }>;
  flashPrice: number;
  id: number;
  images: Array<{ id: number; image: string }>;
  isContinueSelling: boolean;
  price: number;
  quantity: number;
  sku: string;
  slug: string;
  thumbnail: string;
  title: string;
  translation: string;
  wholesale: RawFlashWholesale[];
  wholesalePrice: number;
};

const flashSaleData = flashSaleProductsRaw as {
  data: {
    storeProducts: {
      edges: Array<{ node: RawFlashProduct }>;
    };
  };
};

function getFirstValidImage(product: RawFlashProduct) {
  const imageFromGallery = product.images
    .map((item) => item.image?.trim())
    .find((image) => image && !image.endsWith("/"));

  return imageFromGallery || product.thumbnail;
}

function adaptFlashProduct(product: RawFlashProduct): CategoryFilterProduct {
  const price = product.flashPrice > 0 ? product.flashPrice : product.price;

  return {
    id: product.id,
    hid: String(product.id),
    slug: product.slug,
    title: product.title,
    translation: product.translation,
    thumbnail: getFirstValidImage(product),
    categoryId: 104,
    subCategoryId: 208,
    price,
    comparePrice: product.comparePrice > 0 ? product.comparePrice : price,
    currency: product.currency,
    rating: 4.5,
    ratingTotal: Math.max(8, Math.round(product.id % 53)),
    quantity: Math.round(product.quantity),
    isContinueSelling: product.isContinueSelling,
    soldCount: Math.max(20, Math.round(product.id % 240)),
    createdAt: "2026-04-28T06:00:00.000Z",
    detailPath: `/product/${product.slug}/${product.id}/`,
  };
}

const flashProducts = flashSaleData.data.storeProducts.edges.map(({ node }) =>
  adaptFlashProduct(node),
);

export function loadFlashProducts() {
  return flashProducts;
}

export function filterFlashProductsByPrice(
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
