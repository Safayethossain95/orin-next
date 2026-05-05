import {
  getStoreListCategoriesWithAttributesAction,
  getStoreSearchProductsAction,
  type ProductSearchViewDto,
} from "@repo/graphql";
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { ApiLoader } from "../components/common/ApiLoader";
import {
  getCategoryAndDescendantIds,
  mapStoreCategoriesToCategoryFilter,
  resolveLiveCategoryFilterContext,
  type CategoryFilterContext,
  type CategoryFilterCategory,
  type CategoryFilterKind,
  type CategoryFilterProduct,
  type CategorySortKey,
} from "../lib/categories";
import { createProductImage } from "../lib/home";
import { loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import { Footer } from "../widgets/footer/Footer";
import { CategoryLongSidebar } from "../widgets/category-filter/CategoryLongSidebar";
import { CategoryProductList } from "../widgets/category-filter/CategoryProductList";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { CategorySortBar } from "../widgets/category-filter/CategorySortBar";
import { CategoryTopInfo } from "../widgets/category-filter/CategoryTopInfo";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const filterTheme = theme.categoryFilter;
const sortKeys: CategorySortKey[] = [
  "latest",
  "highest_sold",
  "highest_rating",
  "lowest_price",
  "highest_price",
];
const FIRST_OPTIONS = [15, 30, 50, 100];
const PRODUCT_GRID_TWO_ROWS = 10;
const categoryPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
  { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
];

function getRouteKind(pathname: string): CategoryFilterKind {
  if (pathname.startsWith("/sub-sub-category")) {
    return "subSubCategory";
  }

  if (pathname.startsWith("/sub-category")) {
    return "subCategory";
  }

  return "category";
}

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

function toSortKey(value: string | null): CategorySortKey {
  return sortKeys.includes(value as CategorySortKey)
    ? (value as CategorySortKey)
    : "latest";
}

function toNumericId(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapStoreProduct(
  product: ProductSearchViewDto,
  index: number,
): CategoryFilterProduct {
  const price = Number(product.minPrice ?? product.maxPrice ?? 0);
  const comparePrice = Number(product.maxPrice ?? product.minPrice ?? price);
  const updatedAt = product.updatedAtTs
    ? new Date(product.updatedAtTs * 1000).toISOString()
    : new Date().toISOString();

  return {
    id: toNumericId(product.id, index + 1),
    hid: String(product.id),
    slug: product.slug,
    title: product.title,
    translation: product.title,
    thumbnail:
      product.primaryImageUrl?.trim() ||
      createProductImage(
        product.title,
        categoryPalettes[index % categoryPalettes.length],
      ),
    categoryId: toNumericId(product.categoryId, 0),
    subCategoryId: toNumericId(product.categoryId, 0),
    price,
    comparePrice,
    currency: "BDT",
    rating: 0,
    ratingTotal: 0,
    quantity: product.availableStock,
    isContinueSelling: false,
    soldCount: 0,
    createdAt: updatedAt,
    detailPath: `/product/${product.slug}/${product.id}/`,
  };
}

function sortProducts(
  products: CategoryFilterProduct[],
  sortKey: CategorySortKey,
) {
  return [...products].sort((left, right) => {
    if (sortKey === "lowest_price") {
      return left.price - right.price;
    }

    if (sortKey === "highest_price") {
      return right.price - left.price;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

export function CategoryFilterPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [liveContext, setLiveContext] =
    createSignal<CategoryFilterContext | null>(null);
  const [liveProducts, setLiveProducts] = createSignal<CategoryFilterProduct[]>(
    [],
  );
  const [liveSidebarCategories, setLiveSidebarCategories] = createSignal<
    CategoryFilterCategory[]
  >([]);
  const [isLoadingLiveProducts, setIsLoadingLiveProducts] = createSignal(true);

  const query = createMemo(() => new URLSearchParams(location.search));
  const routeKind = createMemo(() => getRouteKind(location.pathname));
  const context = createMemo(() => liveContext());
  const queryType = createMemo(() => toSortKey(query().get("queryType")));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 15));
  const priceRange = createMemo(() => ({
    min: parseQueryNumber(query().get("min")),
    max: parseQueryNumber(query().get("max")),
  }));
  const products = createMemo(() => {
    const liveRows = liveProducts();

    return sortProducts(liveRows, queryType());
  });
  const paginatedProducts = createMemo(() => {
    const rows = products();
    const page = Math.min(
      currentPage(),
      Math.max(1, Math.ceil(rows.length / first())),
    );
    const start = (page - 1) * first();

    return rows.slice(start, start + first());
  });

  createEffect(() => {
    const id = params.id;
    const slug = params.slug;
    const kind = routeKind();
    const range = priceRange();
    let isCurrent = true;

    setLiveContext(null);
    setLiveProducts([]);

    if (!id) {
      setIsLoadingLiveProducts(false);
      return;
    }

    setIsLoadingLiveProducts(true);

    void (async () => {
      try {
        const categoriesResponse =
          await getStoreListCategoriesWithAttributesAction();

        if (!isCurrent) {
          return;
        }

        const categories = categoriesResponse ?? [];
        setLiveSidebarCategories(
          mapStoreCategoriesToCategoryFilter(categories),
        );
        const currentCategory =
          categories.find((category) => String(category.id) === id) ??
          categories.find((category) => category.slug === slug) ??
          null;

        const categoryIds = currentCategory
          ? getCategoryAndDescendantIds(String(currentCategory.id), categories)
          : [id];
        const productResponses = await Promise.all(
          categoryIds.map((categoryId) =>
            getStoreSearchProductsAction({
              input: {
                status: "active",
                categoryId,
                minPrice: range.min,
                maxPrice: range.max,
                limit: 100,
                offset: 0,
              },
            }),
          ),
        );

        if (!isCurrent) {
          return;
        }

        if (currentCategory) {
          setLiveContext(
            resolveLiveCategoryFilterContext(kind, currentCategory, categories),
          );
        }

        const seenProductIds = new Set<string>();
        const nextProducts = productResponses
          .flatMap((response) => response ?? [])
          .filter((product) => {
            const productId = String(product.id);

            if (seenProductIds.has(productId)) {
              return false;
            }

            seenProductIds.add(productId);
            return true;
          })
          .map(mapStoreProduct);

        setLiveProducts(nextProducts);
      } catch {
        if (isCurrent) {
          setLiveContext(null);
          setLiveProducts([]);
          setLiveSidebarCategories([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoadingLiveProducts(false);
        }
      }
    })();

    onCleanup(() => {
      isCurrent = false;
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
        <div class={filterTheme.wrap}>
          <Show
            when={!isLoadingLiveProducts()}
            fallback={
              <ApiLoader
                title="Loading content..."
                copy="Fetching products for this section."
              />
            }
          >
            <Show
              when={context()}
              keyed
              fallback={
                <div class="w-full rounded-sm bg-white px-6 py-16 text-center">
                  <h1 class="text-2xl font-bold text-slate-900">
                    Category not found
                  </h1>
                  <p class="mt-2 text-sm text-slate-500">
                    The category route does not match the available store data.
                  </p>
                  <A
                    href="/categories"
                    class="mt-6 inline-flex rounded-sm bg-[#8e208c] px-5 py-2.5 text-sm font-semibold !text-white"
                  >
                    Browse categories
                  </A>
                </div>
              }
            >
              {(currentContext) => (
                <div class={filterTheme.layout}>
                  <CategoryLongSidebar
                    categories={liveSidebarCategories()}
                    context={currentContext}
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
                    <CategoryTopInfo context={currentContext} />

                    <CategorySortBar
                      title={currentContext.title}
                      queryType={queryType()}
                      onChange={(nextQueryType) =>
                        updateQuery({
                          queryType: nextQueryType,
                          page: undefined,
                        })
                      }
                    />

                    <CategoryProductList products={paginatedProducts()} />
                    <Show when={products().length > PRODUCT_GRID_TWO_ROWS}>
                      <PaginationControls
                        total={products().length}
                        page={currentPage()}
                        first={first()}
                        firstOptions={FIRST_OPTIONS}
                        onPageChange={(page) =>
                          updateQuery({ page: String(page) })
                        }
                        onFirstChange={(nextFirst) =>
                          updateQuery({
                            first: String(nextFirst),
                            page: undefined,
                          })
                        }
                      />
                    </Show>

                    <Show when={currentContext.description}>
                      <div
                        class="space-y-5 bg-white p-5 text-sm leading-7 text-slate-600"
                        innerHTML={currentContext.description}
                      />
                    </Show>
                  </div>
                </div>
              )}
            </Show>
          </Show>
        </div>
      </main>

      <Footer />
    </div>
  );
}
