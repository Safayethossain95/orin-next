import { A, useNavigate } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import type { JSX } from "solid-js";
import { Icon } from "solid-heroicons";
import {
  bars_3BottomRight,
  check,
  chevronDown,
  chevronRight,
  heart,
  shoppingCart,
  user,
  xMark,
} from "solid-heroicons/outline";
import type { MenuData } from "../../lib/home";
import { languages, useI18n, type Locale } from "../../lib/i18n";
import { theme } from "../../lib/theme";
import { loadUserDashboardData } from "../../lib/user-dashboard";
import { wishlistProductCount } from "../../lib/user-wishlist";
import {
  authStore,
  hasStoredAuthSession,
  refreshAuthSession,
  useAuthStore,
} from "../../stores/auth-store";
import { useCartStore } from "../../stores/cart-store";

const dashboardData = loadUserDashboardData();
const primaryRouteMap: Record<string, string> = {
  home: "/",
  categories: "/categories",
  "new product": "/product/new",
  "flash sale": "/product/flash",
  brand: "/brands",
  campaign: "/campaigns",
  collection: "/collections",
};

type MainHeaderProps = {
  menu: MenuData;
};

export function MainHeader(props: MainHeaderProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const wishlistCount = wishlistProductCount(dashboardData.wishlist);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = createMemo(() =>
    cartItems().reduce((total, item) => total + item.quantity, 0),
  );
  const isLoggedIn = createMemo(() => isAuthenticated() || hasStoredAuthSession());

  onMount(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    onCleanup(() => window.removeEventListener("keydown", handleEscape));

    if (hasStoredAuthSession()) {
      authStore.getState().signIn();
      void refreshAuthSession();
    }
  });

  createEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.style.overflow = isSidebarOpen() ? "hidden" : "";
    onCleanup(() => {
      document.body.style.overflow = "";
    });
  });

  const handleWishlist = () => {
    if (isLoggedIn()) {
      void navigate("/user/wishlist");
      return;
    }

    void navigate("/login?returnTo=/user/wishlist");
  };

  return (
    <div class="bg-white">
      <MobileSidebar
        isOpen={isSidebarOpen()}
        menu={props.menu}
        isAuthenticated={isLoggedIn()}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div class={`${theme.container} flex items-center gap-2 py-2 lg:gap-4 lg:py-4`}>
        <A href="/" class="flex shrink-0 items-center gap-1.5 lg:gap-3">
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-[#8e208c] text-sm font-black text-white lg:h-11 lg:w-11 lg:rounded-2xl lg:text-lg">
            O
          </span>
          <div class="min-w-0">
            <div class="text-base font-black uppercase tracking-[0.12em] text-[#8e208c] lg:text-2xl lg:tracking-[0.22em]">Orin</div>
           
          </div>
        </A>

        <div class="flex min-w-0 flex-auto items-center rounded-full border border-[#d7c2e5] bg-[#fbf9fe] px-1 py-1 lg:px-2 lg:py-2">
          <input
            type="text"
            placeholder={t("nav.searchPlaceholder")}
            class="min-w-0 w-full border-none bg-transparent px-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 lg:px-3 lg:text-sm"
          />
          <button class="rounded-full bg-[#8e208c] px-4 py-1.5 text-xs font-semibold text-white lg:px-5 lg:py-2 lg:text-sm">
            {t("nav.search")}
          </button>
        </div>

        <div class="flex w-auto shrink-0 items-center justify-end gap-0.5">
          <LanguageSwitcher class="hidden lg:block" />
          <HeaderActionButton label={t("nav.wishlist")} onClick={handleWishlist} mobileHidden>
            <Icon path={heart} class="h-6 w-6 text-black" aria-hidden="true" />
            <Show when={wishlistCount() > 0}>
              <span class="absolute -top-1 left-5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8e208c] px-1 text-[10px] font-bold leading-none text-white">
                {wishlistCount()}
              </span>
            </Show>
          </HeaderActionButton>
          <HeaderActionLink href="/checkout" label={t("nav.cart")}>
            <Icon path={shoppingCart} class="h-6 w-6" aria-hidden="true" />
            <Show when={cartCount() > 0}>
              <span class="absolute -top-1 left-5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8e208c] px-1 text-[10px] font-bold leading-none text-white">
                {cartCount()}
              </span>
            </Show>
          </HeaderActionLink>
          <span
            class={`h-6 w-px bg-slate-200 lg:block ${
              !isLoggedIn() ? "mx-2" : "invisible hidden"
            }`}
            aria-hidden="true"
          />
          <Show
            when={isLoggedIn()}
            fallback={
              <div class="hidden space-x-2 shrink-0 items-center justify-end text-sm font-semibold text-slate-600 lg:ms-2 lg:block">
                <button
                  type="button"
                  onClick={() => void navigate("/login")}
                  class="cursor-pointer transition hover:text-[#8e208c]"
                >
                  {t("nav.login")}
                </button>
                <span class="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => void navigate("/register")}
                  class="cursor-pointer transition hover:text-[#8e208c]"
                >
                  {t("nav.register")}
                </button>
              </div>
            }
          >
            <div class="hidden h-9 w-9 shrink-0 items-center justify-end lg:flex">
              <HeaderActionLink href="/user" label={t("nav.account")}>
                <Icon path={user} class="h-6 w-6" aria-hidden="true" />
              </HeaderActionLink>
            </div>
          </Show>
          <button
            type="button"
            class="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:text-[#8e208c] lg:hidden"
            aria-label={t("nav.openSidebar")}
            title={t("nav.openSidebar")}
            onClick={() => setIsSidebarOpen(true)}
          >
            <Icon path={bars_3BottomRight} class="h-6 w-6" aria-hidden="true" />
            <span class="sr-only">{t("nav.openSidebar")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileSidebar(props: {
  isOpen: boolean;
  menu: MenuData;
  isAuthenticated: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      class={`fixed inset-0 z-9999 lg:hidden ${
        props.isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!props.isOpen}
    >
      <button
        type="button"
        class={`absolute inset-0 bg-slate-700/70 transition-opacity duration-300 ${
          props.isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-label={t("nav.closeSidebar")}
        tabIndex={props.isOpen ? 0 : -1}
        onClick={props.onClose}
      />
      <aside
        class={`relative flex h-full w-full max-w-xs flex-col bg-white py-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          props.isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.mobileNavigation")}
      >
        <div
          class={`absolute right-0 top-0 -mr-12 pt-2 transition-opacity duration-300 ${
            props.isOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <button
            type="button"
            class="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white ring-2 ring-inset ring-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-label={t("nav.closeSidebar")}
            tabIndex={props.isOpen ? 0 : -1}
            onClick={props.onClose}
          >
            <Icon path={xMark} class="h-6 w-6" aria-hidden="true" />
            <span class="sr-only">{t("nav.closeSidebar")}</span>
          </button>
        </div>

        <A href="/" class="flex items-center justify-center gap-3 px-4" onClick={props.onClose}>
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8e208c] text-base font-black text-white">
            O
          </span>
          <div>
            <div class="text-xl font-black uppercase tracking-[0.22em] text-[#8e208c]">Orin</div>
            <div class="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              {t("nav.curatedStore")}
            </div>
          </div>
        </A>

        <div class="mt-4 h-0 flex-1 overflow-y-auto border-t border-slate-100 px-2 pt-3">
          <nav aria-label="Primary mobile navigation">
            <div class="mb-4 space-y-1">
              <For each={props.menu.primaryLinks}>
                {(link) => {
                  const menuKey = link.trim().toLowerCase();
                  const href = primaryRouteMap[menuKey] ?? "#";

                  return (
                    <A
                      href={href}
                      class="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#8e208c]"
                      onClick={(event) => {
                        if (href === "#") {
                          event.preventDefault();
                        }
                        props.onClose();
                      }}
                    >
                      <span>{translateMenuLabel(menuKey, t)}</span>
                      <Icon path={chevronRight} class="h-4 w-4 text-[#8e208c]" aria-hidden="true" />
                    </A>
                  );
                }}
              </For>
            </div>

            <div class="border-t border-slate-100 pt-3">
              <h2 class="px-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                {t("nav.categories")}
              </h2>
              <ul class="mt-2 space-y-1">
                <For each={props.menu.sidebarCategories}>
                  {(category) => (
                    <li>
                      <A
                        href={`/categories?category=${category.id}`}
                        class="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#8e208c]"
                        onClick={props.onClose}
                      >
                        <span>{category.label}</span>
                        <Icon path={chevronRight} class="h-4 w-4 text-[#8e208c]" aria-hidden="true" />
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </div>

            <div class="mt-4 border-t border-slate-100 pt-3">
              <h2 class="px-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                {t("nav.more")}
              </h2>
              <div class="mt-2 grid grid-cols-2 gap-1">
                <For each={props.menu.utilityLinks}>
                  {(link) => (
                    <a
                      href="#"
                      class="rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#8e208c]"
                      onClick={(event) => {
                        event.preventDefault();
                        props.onClose();
                      }}
                    >
                      {link}
                    </a>
                  )}
                </For>
              </div>
            </div>
          </nav>
        </div>

        <div class="border-t border-slate-100 px-4 pt-4">
          <Show
            when={props.isAuthenticated}
            fallback={
              <div class="grid grid-cols-2 gap-2">
                <A
                  href="/login"
                  class="rounded-full border border-[#8e208c] px-4 py-2 text-center text-sm font-semibold text-[#8e208c]"
                  onClick={props.onClose}
                >
                  {t("nav.login")}
                </A>
                <A
                  href="/register"
                  class="rounded-full bg-[#8e208c] px-4 py-2 text-center text-sm font-semibold text-white!"
                  onClick={props.onClose}
                >
                  {t("nav.register")}
                </A>
              </div>
            }
          >
            <A
              href="/user"
              class="block rounded-full bg-[#8e208c] px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={props.onClose}
            >
              {t("nav.myAccount")}
            </A>
          </Show>
        </div>

        <div class="border-t border-slate-100 px-4 pt-4">
          <LanguageSwitcher onSelect={props.onClose} />
        </div>
      </aside>
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

function LanguageSwitcher(props: { class?: string; onSelect?: () => void }) {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = createSignal(false);
  let switcherRef: HTMLDivElement | undefined;
  const selectedLanguage = createMemo(
    () => languages.find((language) => language.code === locale()) ?? languages[0],
  );

  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef && !switcherRef.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    onCleanup(() => document.removeEventListener("click", handleClickOutside));
  });

  const selectLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setIsOpen(false);
    props.onSelect?.();
  };

  return (
    <div class={`relative ${props.class ?? ""}`} ref={switcherRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((value) => !value);
        }}
        class="flex w-full items-center justify-between gap-2 rounded-sm bg-white px-3 py-2 text-sm text-slate-700 transition hover:text-[#8e208c] focus:outline-none lg:w-auto"
        aria-haspopup="listbox"
        aria-expanded={isOpen()}
        aria-label={t("nav.language")}
      >
        <span class="block truncate font-medium text-slate-800">
          {selectedLanguage().name}
        </span>
        <Icon
          path={chevronDown}
          class={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
            isOpen() ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <Show when={isOpen()}>
        <ul
          class="absolute right-0 z-50 mt-1 w-full min-w-28 overflow-auto rounded-sm bg-white py-1 text-sm shadow-sm ring-1 ring-black/5 focus:outline-none"
          role="listbox"
        >
          <For each={languages}>
            {(language) => {
              const active = () => language.code === locale();

              return (
                <li
                  role="option"
                  aria-selected={active()}
                  onClick={() => selectLanguage(language.code)}
                  class="relative flex cursor-default select-none items-center py-2 pl-10 pr-4 text-slate-900 hover:bg-slate-100 hover:text-[#8e208c]"
                >
                  <span class={`block truncate ${active() ? "font-semibold" : "font-normal"}`}>
                    {language.name}
                  </span>
                  <Show when={active()}>
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8e208c]">
                      <Icon path={check} class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </Show>
    </div>
  );
}

function HeaderActionButton(props: {
  label: string;
  onClick: () => void;
  children: JSX.Element;
  mobileHidden?: boolean;
}) {
  return (
    <button
      type="button"
      class={`relative h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:text-[#8e208c] ${
        props.mobileHidden ? "hidden lg:inline-flex" : "inline-flex"
      }`}
      aria-label={props.label}
      title={props.label}
      onClick={props.onClick}
    >
      {props.children}
      <span class="sr-only">{props.label}</span>
    </button>
  );
}

function HeaderActionLink(props: {
  href: string;
  label: string;
  children: JSX.Element;
}) {
  return (
    <A
      href={props.href}
      class="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:text-[#8e208c]"
      aria-label={props.label}
      title={props.label}
    >
      {props.children}
      <span class="sr-only">{props.label}</span>
    </A>
  );
}
