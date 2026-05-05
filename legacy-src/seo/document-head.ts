import type { ResolvedSeoMeta } from "./types";

const SEO_ATTRIBUTE = "data-orin-seo";

function setManagedAttribute(element: Element) {
  element.setAttribute(SEO_ATTRIBUTE, "true");
}

function upsertMeta(selector: string, attributes: Record<string, string | undefined>) {
  const head = document.head;
  let element = head.querySelector<HTMLMetaElement>(selector);
  const content = attributes.content;

  if (!content) {
    if (element?.hasAttribute(SEO_ATTRIBUTE)) {
      element.remove();
    }

    return;
  }

  if (!element) {
    element = document.createElement("meta");
    head.append(element);
  }

  setManagedAttribute(element);

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      element.setAttribute(key, value);
    } else {
      element.removeAttribute(key);
    }
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  const head = document.head;
  let element = head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    head.append(element);
  }

  setManagedAttribute(element);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function removeManagedJsonLd() {
  document
    .querySelectorAll(`script[type="application/ld+json"][${SEO_ATTRIBUTE}]`)
    .forEach((element) => element.remove());
}

function setJsonLd(jsonLd: ResolvedSeoMeta["jsonLd"]) {
  removeManagedJsonLd();

  jsonLd.forEach((schema) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    setManagedAttribute(script);
    document.head.append(script);
  });
}

export function applySeoMeta(meta: ResolvedSeoMeta) {
  document.documentElement.lang = meta.locale.split("_")[0] ?? "en";
  document.title = meta.title;

  upsertMeta('meta[name="description"]', {
    name: "description",
    content: meta.description,
  });
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: meta.robots,
  });
  upsertMeta('meta[name="keywords"]', {
    name: "keywords",
    content: meta.keywords,
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: meta.title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: meta.description,
  });
  upsertMeta('meta[property="og:type"]', {
    property: "og:type",
    content: meta.type,
  });
  upsertMeta('meta[property="og:site_name"]', {
    property: "og:site_name",
    content: meta.siteName,
  });
  upsertMeta('meta[property="og:locale"]', {
    property: "og:locale",
    content: meta.locale,
  });
  upsertMeta('meta[property="og:url"]', {
    property: "og:url",
    content: meta.canonicalUrl,
  });
  upsertMeta('meta[property="og:image"]', {
    property: "og:image",
    content: meta.imageUrl,
  });
  upsertMeta('meta[property="og:image:alt"]', {
    property: "og:image:alt",
    content: meta.imageAlt,
  });
  upsertMeta('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: meta.twitterCard,
  });
  upsertMeta('meta[name="twitter:title"]', {
    name: "twitter:title",
    content: meta.title,
  });
  upsertMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: meta.description,
  });
  upsertMeta('meta[name="twitter:image"]', {
    name: "twitter:image",
    content: meta.imageUrl,
  });
  upsertMeta('meta[name="twitter:site"]', {
    name: "twitter:site",
    content: meta.twitterSite,
  });

  upsertLink('link[rel="canonical"]', {
    rel: "canonical",
    href: meta.canonicalUrl,
  });

  document
    .querySelectorAll(`link[rel="alternate"][${SEO_ATTRIBUTE}]`)
    .forEach((element) => element.remove());

  meta.alternates.forEach((alternate) => {
    upsertLink(
      `link[rel="alternate"][hreflang="${alternate.hrefLang}"][href="${alternate.href}"]`,
      {
        rel: "alternate",
        hreflang: alternate.hrefLang,
        href: alternate.href,
      },
    );
  });

  setJsonLd(meta.jsonLd);
}
