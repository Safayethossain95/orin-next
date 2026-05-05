import type { SeoMeta } from "./types";

const DEFAULT_SITE_URL = "https://example.com";

export const defaultSeo = {
  siteName: "Orin",
  title: "Orin",
  titleTemplate: "%s | Orin",
  description: "Empty SolidJS storefront scaffold for Orin.",
  canonicalPath: "/",
  robots: "index, follow",
  type: "website",
  locale: "en_US",
  twitterCard: "summary_large_image",
  baseUrl: DEFAULT_SITE_URL,
  image: "/og-image.png",
  imageAlt: "Orin preview",
} satisfies SeoMeta & {
  baseUrl: string;
};

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: defaultSeo.siteName,
  url: defaultSeo.baseUrl,
} as const;
