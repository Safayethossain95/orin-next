import footerContentRaw from "../data/footer-content.json";

type FooterLink = {
  id: string;
  title: string;
  href: string;
};

type FooterSocialLink = FooterLink & {
  icon: "facebook" | "instagram" | "twitter" | "youtube";
};

type FooterContent = {
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  popular_links: FooterLink[];
  important_links: FooterLink[];
  contact: {
    head_office: string;
    phone: string;
    email: string;
  };
  social_links: FooterSocialLink[];
  bottom_bar: {
    copyright_name: string;
    developed_by_label: string;
    developed_by_href: string;
  };
};

export function loadFooterContent() {
  return footerContentRaw as FooterContent;
}
