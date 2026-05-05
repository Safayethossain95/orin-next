import { A, useLocation } from "@solidjs/router";
import { createEffect, createSignal, For } from "solid-js";
import { Icon } from "solid-heroicons";
import { home } from "solid-heroicons/outline";
import type { MenuData } from "../../lib/home";
import { useI18n } from "../../lib/i18n";

type CategoryMenuBarProps = {
  links: MenuData["primaryLinks"];
};

const navMenuContainer =
  "mx-auto flex min-h-10 w-full max-w-[1280px] flex-wrap items-stretch gap-x-0 gap-y-2 text-sm font-medium px-6";
const navMenuItemBase = "inline-flex min-h-10 items-center transition";
const activeNavMenuItem =
  "bg-white !text-black visited:!text-black hover:bg-slate-50 hover:!text-black";
const inactiveNavMenuItem = "text-white hover:bg-white/10";

const getMenuKey = (link: string) => link.trim().toLowerCase();
const menuRouteMap: Record<string, string> = {
  home: "/",
  categories: "/categories",
  "new product": "/product/new",
  "flash sale": "/product/flash",
  brand: "/brands",
  campaign: "/campaigns",
  collection: "/collections",
};

function getRouteActiveMenuKey(pathname: string) {
  if (pathname === "/") {
    return "home";
  }

  if (
    pathname === "/categories" ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/sub-category/") ||
    pathname.startsWith("/sub-sub-category/")
  ) {
    return "categories";
  }

  if (pathname === "/product/new" || pathname.startsWith("/product/new/")) {
    return "new product";
  }

  if (
    pathname === "/product/flash" ||
    pathname.startsWith("/product/flash/")
  ) {
    return "flash sale";
  }

  if (
    pathname === "/brands" ||
    pathname.startsWith("/brands/") ||
    pathname.startsWith("/brand/")
  ) {
    return "brand";
  }

  if (
    pathname === "/campaigns" ||
    pathname.startsWith("/campaigns/") ||
    pathname.startsWith("/campaign/")
  ) {
    return "campaign";
  }

  if (
    pathname === "/collections" ||
    pathname.startsWith("/collections/") ||
    pathname.startsWith("/collection/")
  ) {
    return "collection";
  }

  return undefined;
}

export function CategoryMenuBar(props: CategoryMenuBarProps) {
  const { t } = useI18n();
  const location = useLocation();
  const [activeMenuKey, setActiveMenuKey] = createSignal("home");

  createEffect(() => {
    const routeMenuKey = getRouteActiveMenuKey(location.pathname);

    if (routeMenuKey) {
      setActiveMenuKey(routeMenuKey);
    }
  });

  return (
    <div class="bg-[#8e208c] text-white">
      <div class={navMenuContainer}>
        <For each={props.links}>
          {(link) => {
            const menuKey = getMenuKey(link);
            const isActive = () => activeMenuKey() === menuKey;
            const href = menuRouteMap[menuKey];

            return href ? (
              <A
                href={href}
                class={`${navMenuItemBase} gap-1.5 px-4 ${
                  isActive() ? activeNavMenuItem : inactiveNavMenuItem
                }`}
                onClick={() => setActiveMenuKey(menuKey)}
              >
                {menuKey === "home" ? (
                  <Icon path={home} class="h-4 w-4" aria-hidden="true" />
                ) : null}
                {translateMenuLabel(menuKey, t)}
              </A>
            ) : (
              <a
                href="#"
                class={`${navMenuItemBase} px-3 ${
                  isActive() ? activeNavMenuItem : inactiveNavMenuItem
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveMenuKey(menuKey);
                }}
              >
                {translateMenuLabel(menuKey, t)}
              </a>
            );
          }}
        </For>
      </div>
    </div>
  );
}

function translateMenuLabel(menuKey: string, t: (key: string) => string) {
  const translationKey: Record<string, string> = {
    home: "nav.home",
    categories: "nav.categories",
    "new product": "nav.newProduct",
    "flash sale": "nav.flashSale",
    brand: "nav.brand",
    campaign: "nav.campaign",
    collection: "nav.collection",
  };

  return translationKey[menuKey] ? t(translationKey[menuKey]) : menuKey;
}
