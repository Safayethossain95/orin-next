import { defaultSeo, siteJsonLd } from "./seo-config";
import type { JsonLdValue, ResolvedSeoMeta, SeoMeta } from "./types";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function toAbsoluteUrl(value: string | undefined, baseUrl: string) {
  if (!value) {
    return undefined;
  }

  if (isAbsoluteUrl(value)) {
    return value;
  }

  return `${trimTrailingSlash(baseUrl)}${ensureLeadingSlash(value)}`;
}

function formatTitle(title: string, template: string | undefined) {
  if (!template || title === defaultSeo.title) {
    return title;
  }

  return template.replace("%s", title);
}

function normalizeJsonLd(jsonLd: JsonLdValue | JsonLdValue[] | undefined) {
  if (!jsonLd) {
    return [siteJsonLd];
  }

  return Array.isArray(jsonLd) ? [siteJsonLd, ...jsonLd] : [siteJsonLd, jsonLd];
}

export function resolveSeoMeta(meta: SeoMeta, pathname: string): ResolvedSeoMeta {
  const title = meta.title ?? defaultSeo.title;
  const titleTemplate = meta.titleTemplate ?? defaultSeo.titleTemplate;
  const canonicalPath = meta.canonicalPath ?? pathname;
  const baseUrl = defaultSeo.baseUrl;

  return {
    title: formatTitle(title, titleTemplate),
    description: meta.description ?? defaultSeo.description,
    robots: meta.robots ?? defaultSeo.robots,
    type: meta.type ?? defaultSeo.type,
    locale: meta.locale ?? defaultSeo.locale,
    siteName: meta.siteName ?? defaultSeo.siteName,
    twitterCard: meta.twitterCard ?? defaultSeo.twitterCard,
    twitterSite: meta.twitterSite,
    canonicalUrl:
      toAbsoluteUrl(canonicalPath, baseUrl) ?? toAbsoluteUrl("/", baseUrl) ?? baseUrl,
    keywords: meta.keywords?.join(", "),
    imageUrl: toAbsoluteUrl(meta.image ?? defaultSeo.image, baseUrl),
    imageAlt: meta.imageAlt ?? defaultSeo.imageAlt,
    alternates: meta.alternates ?? [],
    jsonLd: normalizeJsonLd(meta.jsonLd),
  };
}
