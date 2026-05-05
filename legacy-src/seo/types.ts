export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type AlternateLink = {
  hrefLang: string;
  href: string;
};

export type SeoMeta = {
  title?: string;
  titleTemplate?: string;
  description?: string;
  canonicalPath?: string;
  robots?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  siteName?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  alternates?: AlternateLink[];
  jsonLd?: JsonLdValue | JsonLdValue[];
};

export type ResolvedSeoMeta = Required<
  Pick<
    SeoMeta,
    | "title"
    | "description"
    | "robots"
    | "type"
    | "locale"
    | "siteName"
    | "twitterCard"
  >
> & {
  canonicalUrl: string;
  keywords?: string;
  imageUrl?: string;
  imageAlt?: string;
  twitterSite?: string;
  alternates: AlternateLink[];
  jsonLd: JsonLdValue[];
};
