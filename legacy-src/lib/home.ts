import {
  getStoreSearchProductsAction,
  type ProductSearchViewDto,
} from "@repo/graphql";
import homeBrandsRaw from "../data/home-brands.json";
import flashSaleProductsRaw from "../data/flash-sale-products.json";
import homeHeroRaw from "../data/home-hero.json";
import homeSectionsRaw from "../data/home-sections.json";
import navMenuRaw from "../data/nav-menu.json";

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

type RawSection = {
  id: string;
  title: string;
  accent: string;
  section_key: string;
  products: RawProduct[];
};

type RawHeroHighlight = {
  title: string;
  description: string;
};

type RawFeature = {
  key: string;
  value: string;
};

type RawHeroSlide = {
  id: string;
  image: string;
  href: string;
};

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
  features: RawFeature[];
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

const paletteMap: Record<
  string,
  { background: string; foreground: string; accent: string }
> = {
  featured: { background: "#fff4ea", foreground: "#f97316", accent: "#7c2d12" },
  fashion: { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
  appliances: { background: "#e9edf5", foreground: "#475569", accent: "#1e293b" },
  power: { background: "#eaf5ff", foreground: "#2563eb", accent: "#1e3a8a" },
  television: { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
  home: { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
  bestseller: { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  gadgets: { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  security: { background: "#f1f5f9", foreground: "#0f172a", accent: "#334155" },
  network: { background: "#ecfeff", foreground: "#0891b2", accent: "#164e63" },
};

export type MenuData = {
  utilityLinks: string[];
  primaryLinks: string[];
  sidebarCategories: SidebarCategory[];
};

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
  categoryName?: string;
  tint: {
    background: string;
    foreground: string;
    accent: string;
  };
  subtitle?: string;
  sku?: string;
  availability?: string;
  wholesaleLabel?: string;
};

export type HomeSectionData = {
  id: string;
  title: string;
  accent: string;
  products: ProductCardData[];
};

export type HeroData = {
  announcement: string;
  slides: RawHeroSlide[];
  highlights: RawHeroHighlight[];
  flashDeals: ProductCardData[];
};

const HOME_SECTION_PRODUCT_LIMIT = 6;
const PRODUCT_BATCH_SIZE = 100;
const MAX_PRODUCT_BATCHES = 20;

function toDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createProductImage(
  title: string,
  palette: { background: string; foreground: string; accent: string },
) {
  const lines = splitTitle(title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" role="img" aria-label="${escapeXml(
    title,
  )}">
    <defs>
      <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="${palette.background}" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
    </defs>
    <rect width="360" height="240" rx="24" fill="url(#g)" />
    <rect x="28" y="28" width="304" height="184" rx="22" fill="#ffffff" opacity="0.9" />
    <circle cx="82" cy="86" r="34" fill="${palette.foreground}" opacity="0.18" />
    <rect x="136" y="72" width="128" height="14" rx="7" fill="${palette.foreground}" opacity="0.32" />
    <rect x="136" y="96" width="96" height="12" rx="6" fill="${palette.foreground}" opacity="0.22" />
    <rect x="52" y="144" width="256" height="16" rx="8" fill="${palette.accent}" opacity="0.85" />
    <text x="52" y="190" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${palette.accent}">${escapeXml(
      lines[0],
    )}</text>
    <text x="52" y="214" font-family="Arial, sans-serif" font-size="18" fill="${palette.foreground}">${escapeXml(
      lines[1] ?? "",
    )}</text>
  </svg>`;

  return toDataUri(svg);
}

function splitTitle(title: string) {
  const words = title.split(" ");
  const midpoint = Math.ceil(words.length / 2);

  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function adaptProduct(product: RawProduct, sectionKey = "featured"): ProductCardData {
  const tint = paletteMap[sectionKey] ?? paletteMap.featured;
  const slug = slugifyCategory(product.name) || product.id;

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
    tint,
  };
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("en-US");
}

function toDataSectionKey(value: string | null | undefined) {
  const normalized = normalizeText(value);
  if (normalized.includes("fashion") || normalized.includes("clothing")) return "fashion";
  if (
    normalized.includes("fridge") ||
    normalized.includes("refrigerator") ||
    normalized.includes("appliance")
  ) {
    return "appliances";
  }
  if (normalized.includes("battery") || normalized.includes("ips") || normalized.includes("power")) {
    return "power";
  }
  if (normalized.includes("tv") || normalized.includes("television")) return "television";
  if (normalized.includes("home")) return "home";
  if (normalized.includes("best")) return "bestseller";
  if (normalized.includes("electronic") || normalized.includes("gadget")) return "gadgets";
  if (normalized.includes("security")) return "security";
  if (normalized.includes("network")) return "network";

  return "featured";
}

function toThemeAccent(title: string, count: number) {
  return `${count} live products from ${title}`;
}

function getProductBadge(product: ProductSearchViewDto) {
  if (product.isFeatured) return "Featured";
  if (product.isPromoted) return "Promoted";
  if (product.availableStock > 0) return "In stock";

  return "Product";
}

function getProductBrand(product: ProductSearchViewDto) {
  return product.brandName?.trim() || product.categoryName?.trim() || "Store";
}

function getProductImage(product: ProductSearchViewDto) {
  const image = product.primaryImageUrl?.trim();
  if (image) {
    return image;
  }

  const tint = paletteMap[toDataSectionKey(product.categoryName)];
  return createProductImage(product.title, tint);
}

function mapSearchProductToCard(product: ProductSearchViewDto): ProductCardData {
  const sectionKey = toDataSectionKey(product.categoryName);
  const tint = paletteMap[sectionKey] ?? paletteMap.featured;
  const price = product.minPrice ?? product.maxPrice ?? 0;
  const originalPrice =
    product.maxPrice && product.maxPrice > price ? product.maxPrice : Math.max(price, product.maxPrice ?? 0);

  return {
    id: String(product.id),
    slug: product.slug,
    detailPath: `/product/${product.slug}/${product.id}/`,
    backendProductId: String(product.id),
    name: product.title,
    brand: getProductBrand(product),
    categoryName: product.categoryName?.trim() || "Featured Products",
    price,
    originalPrice,
    badge: getProductBadge(product),
    image: getProductImage(product),
    tint,
    subtitle: product.subtitle?.trim() || product.shortDescription?.trim() || undefined,
    sku: product.sku?.trim() || undefined,
    availability:
      product.availableStock > 0 ? `${product.availableStock} in stock` : "Out of stock",
  };
}

function sortSearchProducts(left: ProductSearchViewDto, right: ProductSearchViewDto) {
  if (left.isFeatured !== right.isFeatured) {
    return Number(right.isFeatured) - Number(left.isFeatured);
  }

  if (left.isPromoted !== right.isPromoted) {
    return Number(right.isPromoted) - Number(left.isPromoted);
  }

  if (left.availableStock !== right.availableStock) {
    return right.availableStock - left.availableStock;
  }

  return right.updatedAtTs - left.updatedAtTs;
}

async function fetchAllSearchProducts(): Promise<ProductSearchViewDto[]> {
  const items: ProductSearchViewDto[] = [];
  const seenIds = new Set<string>();

  for (let batchIndex = 0; batchIndex < MAX_PRODUCT_BATCHES; batchIndex += 1) {
    const response = await getStoreSearchProductsAction({
      input: {
        status: "active",
        limit: PRODUCT_BATCH_SIZE,
        offset: batchIndex * PRODUCT_BATCH_SIZE,
      },
    });

    const batch = response ?? [];

    if (batch.length === 0) {
      break;
    }

    for (const product of batch) {
      const key = String(product.id);
      if (seenIds.has(key)) continue;
      seenIds.add(key);
      items.push(product);
    }

    if (batch.length < PRODUCT_BATCH_SIZE) {
      break;
    }
  }

  return items;
}

export function loadMenuData(): MenuData {
  return {
    utilityLinks: navMenuRaw.utility_links,
    primaryLinks: navMenuRaw.primary_links,
    sidebarCategories: navMenuRaw.sidebar_categories,
  };
}

export function loadHeroData(): HeroData {
  return {
    announcement: homeHeroRaw.announcement,
    slides: homeHeroRaw.slides as RawHeroSlide[],
    highlights: homeHeroRaw.highlights,
    flashDeals: homeHeroRaw.flash_deals.map((product) =>
      adaptProduct(product as RawProduct, "featured"),
    ),
  };
}

export function loadBrandNames() {
  return homeBrandsRaw.brands;
}

export function loadFeaturedProducts() {
  return homeSectionsRaw.featured_products.map((product) =>
    adaptProduct(product as RawProduct, "featured"),
  );
}

function getFirstValidImage(product: RawFlashProduct) {
  const imageFromGallery = product.images
    .map((item) => item.image?.trim())
    .find((image) => image && !image.endsWith("/"));

  return imageFromGallery || product.thumbnail;
}

function getFeatureLabel(features: RawFeature[]) {
  return features.find((feature) => feature.value?.trim())?.value?.trim() || "Flash Sale";
}

function getWholesaleLabel(wholesale: RawFlashWholesale[], wholesalePrice: number) {
  if (wholesale.length > 0) {
    const firstTier = wholesale[0];
    return `Wholesale ${firstTier.minOrder}+ at BDT ${Math.round(firstTier.price)}`;
  }

  if (wholesalePrice > 0) {
    return `Wholesale price BDT ${Math.round(wholesalePrice)}`;
  }

  return undefined;
}

export function loadFlashSaleProducts(): ProductCardData[] {
  const edges = flashSaleProductsRaw.data.storeProducts.edges as Array<{ node: RawFlashProduct }>;

  return edges.map(({ node }) => ({
    id: String(node.id),
    slug: node.slug,
    detailPath: `/product/${node.slug}/${node.id}/`,
    backendProductId: String(node.id),
    name: node.title,
    brand: node.currency,
    categoryName: "Flash Sale",
    price: node.flashPrice > 0 ? node.flashPrice : node.price,
    originalPrice: node.comparePrice > 0 ? node.comparePrice : node.price,
    badge:
      node.discount > 0
        ? `${Math.round(node.discount)}% off`
        : node.flashPrice > 0
          ? "Flash"
          : "Deal",
    image: getFirstValidImage(node),
    tint: paletteMap.featured,
    subtitle: getFeatureLabel(node.features),
    sku: node.sku.toUpperCase(),
    availability:
      node.quantity > 0
        ? `${Math.round(node.quantity)} in stock`
        : node.isContinueSelling
          ? "Available on demand"
          : "Out of stock",
    wholesaleLabel: getWholesaleLabel(node.wholesale, node.wholesalePrice),
  }));
}

export function loadHomeSections(): HomeSectionData[] {
  return homeSectionsRaw.product_sections.map((section) => {
    const rawSection = section as RawSection;

    return {
      id: rawSection.id,
      title: rawSection.title,
      accent: rawSection.accent,
      products: rawSection.products.map((product) =>
        adaptProduct(product, rawSection.section_key),
      ),
    };
  });
}

export async function loadDynamicHomeSections(): Promise<HomeSectionData[]> {
  try {
    const products = await fetchAllSearchProducts();

    if (products.length === 0) {
      return loadHomeSections();
    }

    const sectionsByCategory = new Map<string, HomeSectionData>();

    for (const product of [...products].sort(sortSearchProducts)) {
      const title = product.categoryName?.trim() || "Featured Products";
      const categoryKey = normalizeText(title) || "featured-products";
      const currentSection = sectionsByCategory.get(categoryKey);

      if (currentSection) {
        if (currentSection.products.length < HOME_SECTION_PRODUCT_LIMIT) {
          currentSection.products.push(mapSearchProductToCard(product));
          currentSection.accent = toThemeAccent(currentSection.title, currentSection.products.length);
        }
        continue;
      }

      sectionsByCategory.set(categoryKey, {
        id: slugifyCategory(title) || `section-${sectionsByCategory.size + 1}`,
        title,
        accent: toThemeAccent(title, 1),
        products: [mapSearchProductToCard(product)],
      });
    }

    const dynamicSections = Array.from(sectionsByCategory.values()).filter(
      (section) => section.products.length > 0,
    );

    return dynamicSections.length > 0 ? dynamicSections : loadHomeSections();
  } catch {
    return loadHomeSections();
  }
}
