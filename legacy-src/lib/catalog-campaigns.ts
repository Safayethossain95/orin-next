import catalogCampaignsRaw from "../data/catalog-campaigns.json";
import type { CategoryFilterProduct } from "./categories";

type RawCampaign = {
  id: string;
  hid: string;
  slug: string;
  title: string;
  subtitle: string;
  offer: string;
  category: string;
  background: string;
  foreground: string;
  accent: string;
  product: string;
  products: RawCampaignProduct[];
};

type RawCampaignProduct = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  price: number;
  compare_price: number;
  currency: string;
  rating: number;
  rating_total: number;
  quantity: number;
  is_continue_selling: boolean;
  sold_count: number;
  created_at: string;
};

export type CatalogCampaign = {
  id: string;
  hid: string;
  slug: string;
  title: string;
  image: string;
  detailPath: string;
};

const campaignsRaw = catalogCampaignsRaw as RawCampaign[];

function toDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createSkincareProductImage(product: RawCampaignProduct, index: number) {
  const washes = ["#dbeafe", "#eef2ff", "#e0f2fe", "#f5e8df", "#e0f7ff"];
  const productNames = ["Simple", "CeraVe", "Vaseline", "WishCare", "Nivea"];
  const wash = washes[index % washes.length];

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" role="img" aria-label="${escapeXml(
    product.title,
  )}">
    <defs>
      <linearGradient id="snow" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="${wash}" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
    </defs>
    <rect width="320" height="320" fill="url(#snow)" />
    <text x="160" y="36" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" fill="#ef4444">WINTER SALE</text>
    <text x="160" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#ef4444">30% OFF</text>
    <circle cx="96" cy="226" r="44" fill="#f43f5e" opacity="0.92" />
    <rect x="118" y="112" width="78" height="148" rx="12" fill="#ffffff" stroke="#cbd5e1" />
    <rect x="134" y="96" width="48" height="22" rx="5" fill="#e2e8f0" />
    <rect x="70" y="136" width="76" height="136" rx="10" fill="#bbf7d0" stroke="#86efac" transform="rotate(-12 108 204)" />
    <text x="108" y="190" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#16a34a" transform="rotate(-12 108 190)">${productNames[index % productNames.length]}</text>
    <text x="157" y="180" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="#2563eb">${productNames[(index + 1) % productNames.length]}</text>
    <text x="234" y="270" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="#ef4444">Order now</text>
  </svg>`);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createCampaignImage(campaign: RawCampaign, index: number) {
  const isYellow = campaign.background === "#ffd51f" || campaign.background === "#ffc928";
  const panelFill = isYellow ? "#ffffff" : campaign.accent;
  const panelText = isYellow ? campaign.foreground : "#ffffff";
  const productX = index % 2 === 0 ? 650 : 150;
  const headlineX = index % 2 === 0 ? 70 : 520;
  const align = index % 2 === 0 ? "start" : "middle";

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 270" role="img" aria-label="${escapeXml(
    campaign.title,
  )}">
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="72%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="shine" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="880" height="270" rx="4" fill="${campaign.background}" />
    <path d="M0 0h880v270H0z" fill="url(#shine)" />
    <circle cx="72" cy="54" r="30" fill="#ffffff" opacity="0.12" />
    <circle cx="274" cy="188" r="42" fill="#ffffff" opacity="0.12" />
    <circle cx="804" cy="74" r="50" fill="url(#glow)" />
    <text x="${headlineX}" y="78" text-anchor="${align}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="900" fill="${campaign.foreground}">${escapeXml(
      campaign.title,
    )}</text>
    <text x="${headlineX}" y="120" text-anchor="${align}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${campaign.accent}">${escapeXml(
      campaign.subtitle,
    )}</text>
    <g transform="translate(${headlineX}, 142)">
      <rect x="${index % 2 === 0 ? 0 : -135}" y="0" width="270" height="54" rx="8" fill="${panelFill}" opacity="0.96" />
      <text x="${index % 2 === 0 ? 135 : 0}" y="35" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="${panelText}">${escapeXml(
        campaign.offer,
      )}</text>
    </g>
    <g transform="translate(${productX}, 70)">
      <rect x="-48" y="52" width="210" height="100" rx="12" fill="#ffffff" opacity="0.92" />
      <rect x="-18" y="20" width="54" height="132" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
      <rect x="48" y="4" width="62" height="148" rx="12" fill="#ffffff" stroke="#cbd5e1" />
      <rect x="122" y="38" width="58" height="114" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
      <circle cx="70" cy="178" r="26" fill="${campaign.accent}" opacity="0.9" />
      <text x="70" y="184" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="#ffffff">${escapeXml(
        campaign.category,
      )}</text>
    </g>
    <text x="70" y="238" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="${campaign.foreground}" opacity="0.9">${escapeXml(
      campaign.product,
    )}</text>
  </svg>`);
}

const campaigns = campaignsRaw.map((campaign, index) => ({
  id: campaign.id,
  hid: campaign.hid,
  slug: campaign.slug,
  title: campaign.title,
  image: createCampaignImage(campaign, index),
  detailPath: `/campaign/${campaign.slug}/${campaign.hid}/`,
}));

export function loadCatalogCampaigns() {
  return campaigns;
}

export function resolveCatalogCampaign(params: { slug?: string; id?: string }) {
  const rawCampaign = campaignsRaw.find(
    (campaign) => campaign.slug === params.slug && campaign.hid === params.id,
  );

  if (!rawCampaign) {
    return null;
  }

  const campaignIndex = campaignsRaw.findIndex(
    (campaign) => campaign.id === rawCampaign.id,
  );

  return {
    id: rawCampaign.id,
    hid: rawCampaign.hid,
    slug: rawCampaign.slug,
    title: rawCampaign.title,
    image: createCampaignImage(rawCampaign, campaignIndex),
    detailPath: `/campaign/${rawCampaign.slug}/${rawCampaign.hid}/`,
  };
}

export function getCampaignProducts(campaignId: string): CategoryFilterProduct[] {
  const campaign = campaignsRaw.find((item) => item.id === campaignId);

  return (campaign?.products ?? []).map((product, index) => ({
    id: product.id,
    hid: product.hid,
    slug: product.slug,
    title: product.title,
    translation: product.translation,
    thumbnail: createSkincareProductImage(product, index),
    categoryId: 104,
    subCategoryId: 208,
    price: product.price,
    comparePrice: product.compare_price,
    currency: product.currency,
    rating: product.rating,
    ratingTotal: product.rating_total,
    quantity: product.quantity,
    isContinueSelling: product.is_continue_selling,
    soldCount: product.sold_count,
    createdAt: product.created_at,
    detailPath: `/product/${product.slug}/${product.hid}/`,
  }));
}
