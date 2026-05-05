import categorySidebarImagesRaw from "@/data/category-sidebar-images.json";
import flashSaleProductsRaw from "@/data/flash-sale-products.json";
import homeBrandsRaw from "@/data/home-brands.json";
import homeHeroRaw from "@/data/home-hero.json";
import homeSectionsRaw from "@/data/home-sections.json";
import navMenuRaw from "@/data/nav-menu.json";

export type SidebarCategoryLeaf = {
  id: string;
  label: string;
};

export type SidebarCategoryGroup = {
  id: string;
  label: string;
  children: SidebarCategoryLeaf[];
};

export type SidebarCategory = {
  id: string;
  label: string;
  children: SidebarCategoryGroup[];
};

export type ProductCardData = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  badge: string;
  image: string;
  slug?: string;
  detailPath?: string;
  backendProductId?: string;
  subtitle?: string;
  sku?: string;
};

export type HomeSectionData = {
  id: string;
  title: string;
  accent: string;
  products: ProductCardData[];
};

type RawProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  original_price: number;
  badge: string;
  section_key?: string;
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
  wholesale: Array<{ id: number; maxOrder: number; minOrder: number; price: number }>;
  wholesalePrice: number;
};

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function adaptProduct(product: RawProduct): ProductCardData {
  const slug = slugify(product.name) || product.id;
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    originalPrice: product.original_price,
    badge: product.badge,
    image: product.image,
    slug,
    detailPath: `/product/${slug}/${product.id}/`,
    backendProductId: product.id,
  };
}

function firstFlashImage(product: RawFlashProduct) {
  return product.images.map((item) => item.image?.trim()).find((image) => image && !image.endsWith("/")) || product.thumbnail;
}

function featureLabel(product: RawFlashProduct) {
  return product.features.find((feature) => feature.value?.trim())?.value?.trim() || "Flash Sale";
}

export const orinTheme = {
  container: "mx-auto w-full max-w-[1280px] px-4 sm:px-5 lg:px-6",
  page: "min-h-screen bg-[#f3f4f8] text-slate-900",
  card: "border border-[#ece7f5] bg-white shadow-[0_10px_30px_rgba(58,19,91,0.05)]",
  sectionHeader: "flex items-center justify-between gap-3 border-b border-[#f1ecf7] px-4 py-3 sm:px-5",
  sectionTitle: "text-[15px] font-bold uppercase tracking-[0.18em] text-[#8e208c]",
  sectionCopy: "text-xs text-slate-500",
  action: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8e208c] transition hover:text-[#641661]",
};

export function formatOrinPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}

export const categorySidebarImages = categorySidebarImagesRaw as Record<string, string>;

export const menuData = {
  utilityLinks: navMenuRaw.utility_links,
  primaryLinks: navMenuRaw.primary_links,
  sidebarCategories: navMenuRaw.sidebar_categories as SidebarCategory[],
};

export const heroData = {
  announcement: homeHeroRaw.announcement,
  slides: homeHeroRaw.slides,
  highlights: homeHeroRaw.highlights,
};

export const brandNames = homeBrandsRaw.brands;

export const featuredProducts = homeSectionsRaw.featured_products.map((product) => adaptProduct(product as RawProduct));

export const homeSections = homeSectionsRaw.product_sections.map((section) => ({
  id: section.id,
  title: section.title,
  accent: section.accent,
  products: section.products.map((product) => adaptProduct(product as RawProduct)),
}));

export const flashSaleProducts: ProductCardData[] = flashSaleProductsRaw.data.storeProducts.edges.map(({ node }: { node: RawFlashProduct }) => ({
  id: String(node.id),
  slug: node.slug,
  detailPath: `/product/${node.slug}/${node.id}/`,
  backendProductId: String(node.id),
  name: node.title,
  brand: node.currency,
  price: node.flashPrice > 0 ? node.flashPrice : node.price,
  originalPrice: node.comparePrice > 0 ? node.comparePrice : node.price,
  badge: node.discount > 0 ? `${Math.round(node.discount)}% off` : node.flashPrice > 0 ? "Flash" : "Deal",
  image: firstFlashImage(node),
  subtitle: featureLabel(node),
  sku: node.sku.toUpperCase(),
}));
