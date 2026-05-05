import {
  getStoreProductAction,
  getStoreSearchProductsAction,
  type ProductDetailViewDto,
  type ProductSearchViewDto,
} from "@repo/graphql";
import {
  createProductImage,
  loadFeaturedProducts,
  loadFlashSaleProducts,
  loadHomeSections,
  type ProductCardData,
} from "./home";

const RECENTLY_VIEWED_KEY = "orin.recently-viewed-products";
const RELATED_PRODUCT_LIMIT = 12;

export type ProductDetailsData = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryName: string;
  brandName: string;
  sku: string;
  stock: number;
  features: string[];
  gallery: Array<{
    url: string;
    alt: string;
  }>;
  relatedProducts: ProductCardData[];
};

function defaultImage(title: string) {
  return createProductImage(title, {
    background: "#f8ecf8",
    foreground: "#8e208c",
    accent: "#641661",
  });
}

function normalizeFeatureValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeFeatureValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nestedValue = record.value;

    if (
      typeof nestedValue === "string" ||
      typeof nestedValue === "number" ||
      typeof nestedValue === "boolean"
    ) {
      return String(nestedValue).trim();
    }
  }

  return "";
}

function buildFeatureLines(product: ProductDetailViewDto) {
  const lines = product.features
    .map((item) => normalizeFeatureValue(item.feature))
    .filter(Boolean);

  if (lines.length > 0) {
    return lines.slice(0, 8);
  }

  const fallback = [
    product.shortDescription?.trim(),
    product.subtitle?.trim(),
    product.categoryName?.trim(),
    product.brandName?.trim(),
  ].filter(Boolean) as string[];

  return fallback.length > 0 ? fallback : ["Curated product from the Orin catalog."];
}

function dedupeProducts(products: ProductCardData[]) {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product.backendProductId || product.id;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function staticProductPool() {
  return dedupeProducts([
    ...loadFeaturedProducts(),
    ...loadFlashSaleProducts(),
    ...loadHomeSections().flatMap((section) => section.products),
  ]);
}

function mapSearchProductToCard(product: ProductSearchViewDto): ProductCardData {
  const price = product.minPrice ?? product.maxPrice ?? 0;
  const originalPrice =
    product.maxPrice && product.maxPrice > price
      ? product.maxPrice
      : Math.max(price, product.maxPrice ?? 0);

  return {
    id: String(product.id),
    slug: product.slug,
    detailPath: `/product/${product.slug}/${product.id}/`,
    backendProductId: String(product.id),
    name: product.title,
    brand: product.brandName?.trim() || product.categoryName?.trim() || "Store",
    categoryName: product.categoryName?.trim() || "Featured Products",
    price,
    originalPrice,
    badge: product.isFeatured ? "Featured" : product.isPromoted ? "Promoted" : "Product",
    image: product.primaryImageUrl?.trim() || defaultImage(product.title),
    tint: {
      background: "#f8ecf8",
      foreground: "#8e208c",
      accent: "#641661",
    },
    subtitle: product.subtitle?.trim() || product.shortDescription?.trim() || undefined,
    sku: product.sku?.trim() || undefined,
    availability:
      product.availableStock > 0 ? `${product.availableStock} in stock` : "Out of stock",
  };
}

function mapStaticProductDetails(slug: string, id?: string): ProductDetailsData | null {
  const product = staticProductPool().find((item) => {
    if (id && item.id === id) {
      return true;
    }

    if (item.slug && item.slug === slug) {
      return true;
    }

    return false;
  });

  if (!product) {
    return null;
  }

  return {
    id: product.backendProductId || product.id,
    slug: product.slug || slug,
    title: product.name,
    subtitle: product.subtitle,
    description:
      product.subtitle ||
      `${product.name} from ${product.brand} is part of the Orin product collection.`,
    price: product.price,
    originalPrice: product.originalPrice,
    categoryName: product.categoryName || "Featured Products",
    brandName: product.brand,
    sku: product.sku || product.id.toUpperCase(),
    stock: 12,
    features: [
      `${product.brand} curated product`,
      product.availability || "Available for order",
      `Designed for the Orin showcase route`,
    ],
    gallery: [
      { url: product.image, alt: product.name },
      { url: product.image, alt: `${product.name} alternate view` },
    ],
    relatedProducts: staticProductPool()
      .filter((item) => (item.backendProductId || item.id) !== (product.backendProductId || product.id))
      .slice(0, RELATED_PRODUCT_LIMIT),
  };
}

function mapDetailToPageData(
  product: ProductDetailViewDto,
  relatedProducts: ProductCardData[],
): ProductDetailsData {
  const sellPrice = product.price?.sellPrice ?? product.price?.basePrice ?? 0;
  const compareAtPrice =
    product.price?.compareAtPrice && product.price.compareAtPrice > sellPrice
      ? product.price.compareAtPrice
      : product.price?.basePrice ?? sellPrice;
  const primaryImage = product.primaryImageUrl?.trim() || defaultImage(product.title);
  const mediaUrls = product.media
    .map((item) => item.url?.trim())
    .filter((url): url is string => Boolean(url));
  const galleryUrls = mediaUrls.length > 0 ? mediaUrls : [primaryImage];

  return {
    id: String(product.id),
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle?.trim() || undefined,
    description:
      product.description?.trim() ||
      product.shortDescription?.trim() ||
      `${product.title} is part of the Orin product catalog.`,
    price: sellPrice,
    originalPrice: compareAtPrice,
    categoryName: product.categoryName?.trim() || "Featured Products",
    brandName: product.brandName?.trim() || "Store",
    sku: product.sku?.trim() || String(product.id),
    stock: product.inventory?.availableStock ?? 0,
    features: buildFeatureLines(product),
    gallery: galleryUrls.map((url, index) => ({
      url,
      alt: index === 0 ? product.title : `${product.title} view ${index + 1}`,
    })),
    relatedProducts,
  };
}

export async function loadProductDetails(slug: string, id?: string): Promise<ProductDetailsData | null> {
  try {
    const product = await getStoreProductAction({ slug });

    if (!product) {
      return mapStaticProductDetails(slug, id);
    }

    const relatedResponse = await getStoreSearchProductsAction({
      input: {
        status: "active",
        categoryId: product.categoryId ?? undefined,
        limit: RELATED_PRODUCT_LIMIT,
        offset: 0,
      },
    });

    const relatedProducts = dedupeProducts(
      (relatedResponse ?? [])
        .filter((item) => String(item.id) !== String(product.id))
        .map(mapSearchProductToCard),
    );

    return mapDetailToPageData(
      product,
      relatedProducts.length > 0 ? relatedProducts : staticProductPool().slice(0, RELATED_PRODUCT_LIMIT),
    );
  } catch {
    return mapStaticProductDetails(slug, id);
  }
}

export function pushRecentlyViewedProduct(product: ProductDetailsData) {
  if (typeof window === "undefined") {
    return;
  }

  const item: ProductCardData = {
    id: product.id,
    slug: product.slug,
    detailPath: `/product/${product.slug}/${product.id}/`,
    backendProductId: product.id,
    name: product.title,
    brand: product.brandName,
    categoryName: product.categoryName,
    price: product.price,
    originalPrice: product.originalPrice,
    badge: product.stock > 0 ? "Viewed" : "Out",
    image: product.gallery[0]?.url || defaultImage(product.title),
    tint: {
      background: "#f8ecf8",
      foreground: "#8e208c",
      accent: "#641661",
    },
    subtitle: product.subtitle,
    sku: product.sku,
    availability: product.stock > 0 ? `${product.stock} in stock` : "Out of stock",
  };

  try {
    const rawValue = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    const current = rawValue ? (JSON.parse(rawValue) as ProductCardData[]) : [];
    const next = dedupeProducts([item, ...current]).slice(0, 8);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

export function readRecentlyViewedProducts(currentProductId?: string) {
  if (typeof window === "undefined") {
    return [] as ProductCardData[];
  }

  try {
    const rawValue = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!rawValue) {
      return [];
    }

    return (JSON.parse(rawValue) as ProductCardData[]).filter(
      (item) => (item.backendProductId || item.id) !== currentProductId,
    );
  } catch {
    return [];
  }
}
