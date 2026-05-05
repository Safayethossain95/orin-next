import { useLocation, useNavigate } from "@solidjs/router";
import {
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
import { loadMenuData } from "../lib/home";
import { filterNewProductsByPrice, loadNewProducts } from "../lib/new-products";
import { theme } from "../lib/theme";
import { CategoryLongSidebar } from "../widgets/category-filter/CategoryLongSidebar";
import { CategoryProductList } from "../widgets/category-filter/CategoryProductList";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const products = loadNewProducts();
const filterTheme = theme.categoryFilter;
const FIRST_OPTIONS = [15, 30, 50, 100];
const PRODUCT_GRID_TWO_ROWS = 10;

const newProductContext: CategoryFilterContext = {
  kind: "category",
  title: "New Arrival",
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

export function NewProductPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
    filterNewProductsByPrice(products, priceRange()),
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

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class={filterTheme.main}>
        <div class="mx-auto flex w-full px-0 pb-5 sm:px-4">
          <div class={filterTheme.wrap}>
            <CategoryLongSidebar
              categories={sidebarCategories()}
              context={newProductContext}
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
                <h1 class="mt-7 text-2xl font-bold text-slate-950">
                  New Arrival
                </h1>
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
