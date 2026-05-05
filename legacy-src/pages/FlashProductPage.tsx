import { useLocation, useNavigate } from "@solidjs/router";
import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import {
  loadLiveCategoryFilterCategories,
  type CategoryFilterContext,
  type CategoryFilterCategory,
} from "../lib/categories";
import {
  filterFlashProductsByPrice,
  loadFlashProducts,
} from "../lib/flash-products";
import { loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import { CategoryLongSidebar } from "../widgets/category-filter/CategoryLongSidebar";
import { CategoryProductList } from "../widgets/category-filter/CategoryProductList";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const products = loadFlashProducts();
const filterTheme = theme.categoryFilter;
const FLASH_ENDS_AT_KEY = "orin_flash_product_ends_at";
const FLASH_DURATION_MS = 12 * 60 * 60 * 1000;
const FIRST_OPTIONS = [15, 30, 50, 100];
const PRODUCT_GRID_TWO_ROWS = 10;

const flashProductContext: CategoryFilterContext = {
  kind: "category",
  title: "Flash",
  cover: "",
  description: "",
  category: null,
  subCategory: null,
  subSubCategory: null,
};

function parseQueryNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseQueryInt(value: string | null, fallback: number) {
  const parsed = parseQueryNumber(value);

  return parsed ? Math.trunc(parsed) : fallback;
}

function getStoredFlashEnd(now: number) {
  const storageValue = window.localStorage.getItem(FLASH_ENDS_AT_KEY);
  let endsAt = storageValue ? Number(storageValue) : NaN;

  if (!Number.isFinite(endsAt) || endsAt <= now) {
    endsAt = now + FLASH_DURATION_MS;
    window.localStorage.setItem(FLASH_ENDS_AT_KEY, String(endsAt));
  }

  return endsAt;
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { value: days, label: "days" },
    { value: hours, label: "hours" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

export function FlashProductPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [remainingMs, setRemainingMs] = createSignal(FLASH_DURATION_MS);
  const [sidebarCategories, setSidebarCategories] = createSignal<
    CategoryFilterCategory[]
  >([]);

  const query = createMemo(() => new URLSearchParams(location.search));
  const priceRange = createMemo(() => ({
    min: parseQueryNumber(query().get("min")),
    max: parseQueryNumber(query().get("max")),
  }));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 15));
  const visibleProducts = createMemo(() =>
    filterFlashProductsByPrice(products, priceRange()),
  );
  const paginatedProducts = createMemo(() => {
    const rows = visibleProducts();
    const page = Math.min(
      currentPage(),
      Math.max(1, Math.ceil(rows.length / first())),
    );
    const start = (page - 1) * first();

    return rows.slice(start, start + first());
  });
  const countdown = createMemo(() => formatCountdown(remainingMs()));

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const nextQuery = new URLSearchParams(location.search);

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        nextQuery.set(key, value);
      } else {
        nextQuery.delete(key);
      }
    }

    const queryString = nextQuery.toString();
    void navigate(
      `${location.pathname}${queryString ? `?${queryString}` : ""}`,
      {
        replace: true,
      },
    );
  };

  onMount(() => {
    let endsAt = getStoredFlashEnd(Date.now());

    const updateCountdown = () => {
      const now = Date.now();

      if (endsAt <= now) {
        endsAt = now + FLASH_DURATION_MS;
        window.localStorage.setItem(FLASH_ENDS_AT_KEY, String(endsAt));
      }

      setRemainingMs(Math.max(0, endsAt - now));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    onCleanup(() => {
      window.clearInterval(intervalId);
    });
  });

  onMount(() => {
    let isMounted = true;

    void (async () => {
      try {
        const categories = await loadLiveCategoryFilterCategories();

        if (isMounted) {
          setSidebarCategories(categories);
        }
      } catch {
        if (isMounted) {
          setSidebarCategories([]);
        }
      }
    })();

    onCleanup(() => {
      isMounted = false;
    });
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class={filterTheme.main}>
        <div class="mx-auto flex w-full px-0 pb-5 sm:px-4">
          <div class={filterTheme.wrap}>
            <CategoryLongSidebar
              categories={sidebarCategories()}
              context={flashProductContext}
              minPrice={priceRange().min}
              maxPrice={priceRange().max}
              onApplyPrice={(range) =>
                updateQuery({
                  min: range.min ? String(range.min) : undefined,
                  max: range.max ? String(range.max) : undefined,
                  page: undefined,
                })
              }
            />

            <div class={filterTheme.content}>
              <div class="mb-2 bg-white p-4">
                <div class="flex items-center gap-2 text-base text-slate-900">
                  <span>Feature</span>
                  <span class="text-slate-300">/</span>
                </div>

                <div class="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)]">
                  <h1 class="text-2xl font-bold text-slate-950">Flash</h1>

                  <div class="flex justify-start lg:justify-center">
                    <div class="grid grid-cols-4 gap-4 text-center sm:gap-6">
                      <For each={countdown()}>
                        {(item) => (
                          <div class="min-w-14">
                            <div class="font-mono text-4xl leading-none text-black sm:text-5xl">
                              {padTime(item.value)}
                            </div>
                            <div class="mt-2 text-sm text-black">
                              {item.label}
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>

              <CategoryProductList
                products={paginatedProducts()}
                gridClass="relative mt-4 grid grid-cols-2 gap-2 pb-8 md:grid-cols-3 md:gap-3 md:rounded-sm md:pb-12 xl:grid-cols-5 2xl:grid-cols-5"
              />

              <Show when={visibleProducts().length > PRODUCT_GRID_TWO_ROWS}>
                <PaginationControls
                  total={visibleProducts().length}
                  page={currentPage()}
                  first={first()}
                  firstOptions={FIRST_OPTIONS}
                  onPageChange={(page) => updateQuery({ page: String(page) })}
                  onFirstChange={(nextFirst) =>
                    updateQuery({ first: String(nextFirst), page: undefined })
                  }
                />
              </Show>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
