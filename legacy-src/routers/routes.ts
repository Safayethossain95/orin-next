import type { Component } from "solid-js";
import { BrandDetailsPage } from "../pages/BrandDetailsPage";
import { BrandsPage } from "../pages/BrandsPage";
import { CampaignDetailsPage } from "../pages/CampaignDetailsPage";
import { CampaignsPage } from "../pages/CampaignsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { CategoryFilterPage } from "../pages/CategoryFilterPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CollectionDetailsPage } from "../pages/CollectionDetailsPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import { FlashProductPage } from "../pages/FlashProductPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NewProductPage } from "../pages/NewProductPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { RegisterPage } from "../pages/RegisterPage";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import type { SeoMeta } from "../seo/types";

export type AppRoute = {
  path: string;
  component: Component;
  seo: SeoMeta;
};

export const publicRoutes = [
  {
    path: "/",
    component: HomePage,
    seo: {
      title: "Orin",
      description: "Empty Orin theme scaffold.",
      canonicalPath: "/",
      keywords: ["orin", "solid", "tailwind"],
    },
  },
  {
    path: "/user/*",
    component: UserDashboardPage,
    seo: {
      title: "User Dashboard",
      description: "View the Orin user dashboard.",
      canonicalPath: "/user",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/user",
    component: UserDashboardPage,
    seo: {
      title: "User Dashboard",
      description: "View the Orin user dashboard.",
      canonicalPath: "/user",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/collection/:slug/:id",
    component: CollectionDetailsPage,
    seo: {
      title: "Collection Details",
      description: "Browse products from a selected Orin collection.",
      canonicalPath: "/collection",
      keywords: ["collection details", "collection products", "orin offers"],
    },
  },
  {
    path: "/collections",
    component: CollectionsPage,
    seo: {
      title: "Collections",
      description: "Browse all active Orin storefront collections.",
      canonicalPath: "/collections",
      keywords: ["collections", "orin collections", "store offers"],
    },
  },
  {
    path: "/campaign/:slug/:id",
    component: CampaignDetailsPage,
    seo: {
      title: "Campaign Details",
      description: "Browse products from a selected Orin campaign.",
      canonicalPath: "/campaign",
      keywords: ["campaign details", "campaign products", "orin offers"],
    },
  },
  {
    path: "/campaigns",
    component: CampaignsPage,
    seo: {
      title: "Campaigns",
      description: "Browse all active Orin storefront campaigns.",
      canonicalPath: "/campaigns",
      keywords: ["campaigns", "orin campaigns", "store offers"],
    },
  },
  {
    path: "/brand/:slug/:id",
    component: BrandDetailsPage,
    seo: {
      title: "Brand Products",
      description: "Browse products from a selected Orin brand.",
      canonicalPath: "/brand",
      keywords: ["brand products", "orin brand products"],
    },
  },
  {
    path: "/brands",
    component: BrandsPage,
    seo: {
      title: "Brands",
      description: "Browse Orin storefront brands by category.",
      canonicalPath: "/brands",
      keywords: ["brands", "orin brands", "store brands"],
    },
  },
  {
    path: "/categories",
    component: CategoriesPage,
    seo: {
      title: "All Categories",
      description: "Browse all Orin storefront categories and subcategories.",
      canonicalPath: "/categories",
      keywords: ["orin categories", "store categories", "online shopping"],
    },
  },
  {
    path: "/categories/",
    component: CategoriesPage,
    seo: {
      title: "All Categories",
      description: "Browse all Orin storefront categories and subcategories.",
      canonicalPath: "/categories",
      keywords: ["orin categories", "store categories", "online shopping"],
    },
  },
  {
    path: "/category/:slug/:id",
    component: CategoryFilterPage,
    seo: {
      title: "Category Products",
      description: "Browse products in a selected Orin category.",
      canonicalPath: "/category",
    },
  },
  {
    path: "/sub-category/:slug/:id",
    component: CategoryFilterPage,
    seo: {
      title: "Sub Category Products",
      description: "Browse products in a selected Orin sub category.",
      canonicalPath: "/sub-category",
    },
  },
  {
    path: "/sub-sub-category/:slug/:id",
    component: CategoryFilterPage,
    seo: {
      title: "Sub Child Category Products",
      description: "Browse products in a selected Orin sub child category.",
      canonicalPath: "/sub-sub-category",
    },
  },
  {
    path: "/product/new",
    component: NewProductPage,
    seo: {
      title: "New Product",
      description: "Browse newly added Orin storefront products.",
      canonicalPath: "/product/new",
      keywords: ["new products", "new arrival", "orin products"],
    },
  },
  {
    path: "/product/flash",
    component: FlashProductPage,
    seo: {
      title: "Flash Sale",
      description: "Browse limited-time Orin flash sale products.",
      canonicalPath: "/product/flash",
      keywords: ["flash sale", "orin deals", "limited time products"],
    },
  },
  {
    path: "/login",
    component: LoginPage,
    seo: {
      title: "Sign In",
      description: "Sign in to continue using Orin.",
      canonicalPath: "/login",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/register",
    component: RegisterPage,
    seo: {
      title: "Create Account",
      description: "Create an Orin account.",
      canonicalPath: "/register",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/checkout",
    component: CheckoutPage,
    seo: {
      title: "Checkout",
      description: "Review products added to your cart.",
      canonicalPath: "/checkout",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/product/:slug/:id",
    component: ProductDetailsPage,
    seo: {
      title: "Product Details",
      description:
        "View product details, gallery and related products in Orin.",
      canonicalPath: "/product",
    },
  },
] satisfies AppRoute[];

export const protectedRoutes = [
  {
    path: "/protected",
    component: HomePage,
    seo: {
      title: "Protected",
      description: "A protected Orin page.",
      canonicalPath: "/protected",
      robots: "noindex, nofollow",
    },
  },
] satisfies AppRoute[];

export const fallbackRoute = {
  path: "*404",
  component: HomePage,
  seo: {
    title: "Page Not Found",
    description: "The page you requested could not be found.",
    robots: "noindex, nofollow",
  },
} satisfies AppRoute;
