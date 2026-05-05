import brandsData from "@/data/catalog-brands.json";
import campaignsData from "@/data/catalog-campaigns.json";
import collectionsData from "@/data/catalog-collections.json";
import categoryFilterData from "@/data/category-filter.json";
import checkoutOptionsData from "@/data/checkout-options.json";
import footerContentData from "@/data/footer-content.json";
import flashSaleProductsData from "@/data/flash-sale-products.json";
import homeBrandsData from "@/data/home-brands.json";
import homeHeroData from "@/data/home-hero.json";
import homeSectionsData from "@/data/home-sections.json";
import navMenuData from "@/data/nav-menu.json";
import newProductsData from "@/data/new-products.json";
import reviewsData from "@/data/product-reviews.json";
import userAffiliateData from "@/data/user-affiliate.json";
import userDashboardData from "@/data/user-dashboard.json";
import userOrdersData from "@/data/user-orders-reseller.json";
import userWholesaleData from "@/data/user-wholesale.json";
import type { Product } from "./types";

export const data = {
  brands: brandsData,
  campaigns: campaignsData,
  categories: categoryFilterData,
  checkout: checkoutOptionsData,
  collections: collectionsData,
  flashProducts: normalizeProducts(flashSaleProductsData),
  footer: footerContentData,
  homeBrands: homeBrandsData,
  homeHero: homeHeroData,
  homeSections: homeSectionsData,
  nav: navMenuData,
  newProducts: newProductsData as Product[],
  reviews: reviewsData,
  userAffiliate: userAffiliateData,
  userDashboard: userDashboardData,
  userOrders: userOrdersData,
  userWholesale: userWholesaleData,
};

export function productTitle(product: Product) {
  return product.title ?? product.name ?? product.translation ?? "Untitled product";
}

export function productSlug(product: Product) {
  return product.slug ?? String(product.id).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function productImage(product: Product) {
  return product.thumbnail || product.image || `https://placehold.co/640x640/f8f0fa/8e208c?text=${encodeURIComponent(productTitle(product).slice(0, 18))}`;
}

export function productComparePrice(product: Product) {
  return product.compare_price ?? product.comparePrice ?? product.original_price;
}

export function formatMoney(value: number, currency = "BDT") {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function allProducts() {
  const sectionProducts = data.homeSections.product_sections.flatMap((section) => section.products as Product[]);
  const featured = data.homeSections.featured_products as Product[];
  const campaignProducts = data.campaigns.flatMap((campaign) => campaign.products as Product[]);
  const collectionProducts = data.collections.flatMap((collection) => collection.products as Product[]);
  return [...featured, ...data.newProducts, ...data.flashProducts, ...sectionProducts, ...campaignProducts, ...collectionProducts];
}

function normalizeProducts(source: unknown): Product[] {
  if (Array.isArray(source)) return source as Product[];
  if (source && typeof source === "object" && "data" in source) {
    const maybeData = source as { data?: { storeProducts?: { edges?: Array<{ node?: Product & { flashPrice?: number; comparePrice?: number } }> } } };
    return maybeData.data?.storeProducts?.edges?.map((edge) => {
      const node = edge.node;
      if (!node) return null;
      return {
        ...node,
        price: node.flashPrice ?? node.price,
        compare_price: node.comparePrice,
        is_continue_selling: node.isContinueSelling,
      };
    }).filter(Boolean) as Product[];
  }
  return [];
}

export function findProduct(idOrSlug?: string) {
  if (!idOrSlug) return allProducts()[0];
  return allProducts().find((product) => String(product.id) === idOrSlug || product.slug === idOrSlug) ?? allProducts()[0];
}

export function productsForCategory(idOrSlug?: string) {
  if (!idOrSlug) return allProducts();
  const category = data.categories.categories.find((item) => String(item.id) === idOrSlug || item.slug === idOrSlug);
  const subCategory = data.categories.sub_categories.find((item) => String(item.id) === idOrSlug || item.slug === idOrSlug);
  const subSubCategory = data.categories.sub_sub_categories.find((item) => String(item.id) === idOrSlug || item.slug === idOrSlug);
  return allProducts().filter((product) => {
    if (category) return product.category_id === category.id;
    if (subCategory) return product.sub_category_id === subCategory.id;
    if (subSubCategory) return product.sub_sub_category_id === subSubCategory.id;
    return productTitle(product).toLowerCase().includes(idOrSlug.toLowerCase());
  });
}
