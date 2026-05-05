import { A } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { Icon } from "solid-heroicons";
import { bolt, chevronRight, flag, heart, home } from "solid-heroicons/outline";
import type {
  CategoryFilterCategory,
  CategoryFilterContext,
  CategoryFilterSubCategory,
} from "../../lib/categories";
import { useI18n } from "../../lib/i18n";
import { theme } from "../../lib/theme";

type CategoryLongSidebarProps = {
  categories: CategoryFilterCategory[];
  context: CategoryFilterContext;
  minPrice?: number;
  maxPrice?: number;
  onApplyPrice: (range: { min?: number; max?: number }) => void;
};

const filterTheme = theme.categoryFilter;

function parsePrice(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function CategoryLongSidebar(props: CategoryLongSidebarProps) {
  const { t } = useI18n();
  const [selectedCategoryKey, setSelectedCategoryKey] = createSignal("");
  const [selectedSubCategoryKey, setSelectedSubCategoryKey] = createSignal("");
  const [minPrice, setMinPrice] = createSignal(
    props.minPrice ? String(props.minPrice) : "",
  );
  const [maxPrice, setMaxPrice] = createSignal(
    props.maxPrice ? String(props.maxPrice) : "",
  );

  const hoveredCategory = () =>
    props.categories.find((category) => category.hid === selectedCategoryKey());
  const hoveredSubCategory = () =>
    hoveredCategory()?.children.find(
      (subCategory) => subCategory.hid === selectedSubCategoryKey(),
    );

  const applyPriceRange = () => {
    props.onApplyPrice({
      min: parsePrice(minPrice()),
      max: parsePrice(maxPrice()),
    });
  };

  const clearPriceRange = () => {
    setMinPrice("");
    setMaxPrice("");
    props.onApplyPrice({});
  };

  return (
    <aside class={filterTheme.sidebar}>
      <div class={filterTheme.sidebarSection}>
        <div class={filterTheme.sidebarTitle}>
          <h1 class={filterTheme.sidebarTitleText}>{t("filter.priceRange")}</h1>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="number"
            value={minPrice()}
            onInput={(event) => setMinPrice(event.currentTarget.value)}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                applyPriceRange();
              }
            }}
            placeholder={t("filter.min")}
            class={filterTheme.sidebarInput}
          />
          <span class="text-gray-500">-</span>
          <input
            type="number"
            value={maxPrice()}
            onInput={(event) => setMaxPrice(event.currentTarget.value)}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                applyPriceRange();
              }
            }}
            placeholder={t("filter.max")}
            class={filterTheme.sidebarInput}
          />
        </div>

        <div class="mt-3 flex gap-2">
          <button
            type="button"
            class={filterTheme.sidebarApply}
            onClick={applyPriceRange}
          >
            {t("filter.apply")}
          </button>
          <button
            type="button"
            class={filterTheme.sidebarClear}
            onClick={clearPriceRange}
          >
            {t("filter.clear")}
          </button>
        </div>
      </div>

      <div
        class={filterTheme.sidebarMenu}
        onMouseLeave={() => {
          setSelectedCategoryKey("");
          setSelectedSubCategoryKey("");
        }}
      >
        <Show when={hoveredCategory()?.children.length}>
          <div class={filterTheme.flyout}>
            <ul>
              <For each={hoveredCategory()?.children ?? []}>
                {(subCategory) => (
                  <SidebarSubCategoryRow
                    subCategory={subCategory}
                    active={props.context.subCategory?.hid === subCategory.hid}
                    onMouseEnter={() =>
                      setSelectedSubCategoryKey(subCategory.hid)
                    }
                  />
                )}
              </For>
            </ul>
          </div>
        </Show>

        <Show when={hoveredSubCategory()?.children.length}>
          <div class={filterTheme.flyoutSecond}>
            <ul>
              <For each={hoveredSubCategory()?.children ?? []}>
                {(subSubCategory) => (
                  <li>
                    <A
                      href={subSubCategory.href}
                      class="block w-full cursor-pointer rounded-sm transition-all hover:bg-green-50"
                    >
                      <div class={filterTheme.sidebarRowInner}>
                        <img
                          src={subSubCategory.image}
                          alt={subSubCategory.label}
                          class={filterTheme.sidebarFlyoutImage}
                        />
                        <span class={filterTheme.sidebarLabel}>
                          {subSubCategory.label}
                        </span>
                      </div>
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Show>

        <ul class={filterTheme.sidebarList}>
          <For each={props.categories}>
            {(category) => (
              <li onMouseEnter={() => setSelectedCategoryKey(category.hid)}>
                <A
                  href={category.href}
                  class={`${filterTheme.sidebarRow} ${
                    props.context.category?.hid === category.hid
                      ? "bg-green-50"
                      : ""
                  }`}
                >
                  <div class={filterTheme.sidebarRowInner}>
                    <img
                      src={category.image}
                      alt={category.label}
                      class={filterTheme.sidebarImage}
                    />
                    <span class={filterTheme.sidebarLabel}>
                      {category.label}
                    </span>
                  </div>

                  <Show when={category.children.length > 0}>
                    <Icon
                      path={chevronRight}
                      class="h-5 w-5 shrink-0 text-red-400"
                      aria-hidden="true"
                    />
                  </Show>
                </A>
              </li>
            )}
          </For>
        </ul>

        <h3 class="px-3 py-3 text-sm font-semibold text-gray-700">{t("filter.feature")}</h3>
        <ul class="mt-0">
          <li>
            <A
              href="/"
              class="block w-full cursor-pointer rounded-sm hover:bg-green-50"
            >
              <div class="flex w-full items-center px-2 py-2">
                <Icon
                  path={home}
                  class="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
                <span class="ml-4 truncate text-left text-sm font-medium leading-4 text-gray-700">
                  {t("nav.home")}
                </span>
              </div>
            </A>
          </li>
          <li>
            <A
              href="/brands"
              class="block w-full cursor-pointer rounded-sm hover:bg-green-50"
            >
              <div class="flex w-full items-center px-2 py-2">
                <Icon
                  path={flag}
                  class="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
                <span class="ml-4 truncate text-left text-sm font-medium leading-4 text-gray-700">
                  {t("nav.brand")}
                </span>
              </div>
            </A>
          </li>
          <li>
            <A
              href="/product/flash"
              class="block w-full cursor-pointer rounded-sm hover:bg-green-50"
            >
              <div class="flex w-full items-center px-2 py-2">
                <Icon
                  path={bolt}
                  class="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
                <span class="ml-4 truncate text-left text-sm font-medium leading-4 text-gray-700">
                  {t("nav.flashSale")}
                </span>
              </div>
            </A>
          </li>
          <li>
            <A
              href="/community"
              class="block w-full cursor-pointer rounded-sm hover:bg-green-50"
            >
              <div class="flex w-full items-center px-2 py-2">
                <Icon
                  path={heart}
                  class="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
                <span class="ml-4 truncate text-left text-sm font-medium leading-4 text-gray-700">
                  {t("nav.community")}
                </span>
              </div>
            </A>
          </li>
        </ul>
      </div>
    </aside>
  );
}

function SidebarSubCategoryRow(props: {
  subCategory: CategoryFilterSubCategory;
  active: boolean;
  onMouseEnter: () => void;
}) {
  return (
    <li onMouseEnter={props.onMouseEnter}>
      <A
        href={props.subCategory.href}
        class={`${filterTheme.sidebarRow} ${props.active ? "bg-green-50" : ""}`}
      >
        <div class={filterTheme.sidebarRowInner}>
          <img
            src={props.subCategory.image}
            alt={props.subCategory.label}
            class={filterTheme.sidebarFlyoutImage}
          />
          <span class={filterTheme.sidebarLabel}>
            {props.subCategory.label}
          </span>
        </div>

        <Show when={props.subCategory.children.length > 0}>
          <Icon
            path={chevronRight}
            class="h-5 w-5 shrink-0 text-red-400"
            aria-hidden="true"
          />
        </Show>
      </A>
    </li>
  );
}
