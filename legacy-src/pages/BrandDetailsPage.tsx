import {
  getStoreBrandAction,
  getStoreSearchProductsAction,
  type ProductSearchViewDto,
} from "@repo/graphql";
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Icon } from "solid-heroicons";
import { arrowsUpDown, chevronDown } from "solid-heroicons/outline";
import { ApiLoader } from "../components/common/ApiLoader";
import {
  loadLiveCategoryFilterCategories,
  type CategoryFilterContext,
  type CategoryFilterCategory,
  type CategorySortKey,
} from "../lib/categories";
import {
  createProductImage,
  loadMenuData,
  type ProductCardData,
} from "../lib/home";
import { useI18n } from "../lib/i18n";
import { theme } from "../lib/theme";
import { CategoryLongSidebar } from "../widgets/category-filter/CategoryLongSidebar";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { Footer } from "../widgets/footer/Footer";
import { ProductCard } from "../widgets/home/ProductCard";
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
const productPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
];

type StoreBrand = NonNullable<Awaited<ReturnType<typeof getStoreBrandAction>>>;
type BrandProductCardData = ProductCardData & {
  createdAt: string;
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

function toSortKey(value: string | null): CategorySortKey {
  return sortKeys.includes(value as CategorySortKey)
    ? (value as CategorySortKey)
    : "latest";
}

function mapStoreProduct(
  product: ProductSearchViewDto,
  index: number,
): BrandProductCardData {
  const price = Number(product.minPrice ?? product.maxPrice ?? 0);
  const comparePrice = Number(product.maxPrice ?? product.minPrice ?? price);
  const updatedAt = product.updatedAtTs
    ? new Date(product.updatedAtTs * 1000).toISOString()
    : new Date().toISOString();

  return {
    id: String(product.id),
    backendProductId: String(product.id),
    slug: product.slug,
    detailPath: `/product/${product.slug}/${product.id}/`,
    name: product.title,
    brand: product.brandName?.trim() || "Store",
    categoryName: product.categoryName?.trim() || undefined,
    badge: product.availableStock > 0 ? "In stock" : "Product",
    image:
      product.primaryImageUrl?.trim() ||
      createProductImage(
        product.title,
        productPalettes[index % productPalettes.length],
      ),
    price,
    originalPrice: comparePrice,
    tint: productPalettes[index % productPalettes.length],
    subtitle:
      product.subtitle?.trim() || product.shortDescription?.trim() || undefined,
    sku: product.sku?.trim() || undefined,
    availability:
      product.availableStock > 0
        ? `${product.availableStock} in stock`
        : "Out of stock",
    createdAt: updatedAt,
  };
}

function sortProducts(
  products: BrandProductCardData[],
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

export function BrandDetailsPage() {
  const { t } = useI18n();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCategories, setSidebarCategories] = createSignal<
    CategoryFilterCategory[]
  >([]);
  const [brand, setBrand] = createSignal<StoreBrand | null>(null);
  const [brandProducts, setBrandProducts] = createSignal<
    BrandProductCardData[]
  >([]);
  const [isLoadingBrand, setIsLoadingBrand] = createSignal(true);

  const query = createMemo(() => new URLSearchParams(location.search));
  const context = createMemo<CategoryFilterContext>(() => ({
    kind: "category",
    title: brand()?.name ?? "Brand",
    cover: "",
    description: "",
    category: null,
    subCategory: null,
    subSubCategory: null,
  }));
  const queryType = createMemo(() => toSortKey(query().get("queryType")));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 15));
  const priceRange = createMemo(() => ({
    min: parseQueryNumber(query().get("min")),
    max: parseQueryNumber(query().get("max")),
  }));
  const products = createMemo(() => sortProducts(brandProducts(), queryType()));
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
    const brandId = params.id;
    const range = priceRange();
    let isCurrent = true;

    setBrand(null);
    setBrandProducts([]);

    if (!brandId) {
      setIsLoadingBrand(false);
      return;
    }

    setIsLoadingBrand(true);

    void (async () => {
      try {
        const brandResponse = await getStoreBrandAction({ brandId });

        if (!isCurrent) {
          return;
        }

        if (!brandResponse) {
          setBrand(null);
          setBrandProducts([]);
          return;
        }

        setBrand(brandResponse);

        const productsResponse = await getStoreSearchProductsAction({
          input: {
            status: "active",
            brandId,
            minPrice: range.min,
            maxPrice: range.max,
            limit: 100,
            offset: 0,
          },
        });

        if (isCurrent) {
          setBrandProducts((productsResponse ?? []).map(mapStoreProduct));
        }
      } catch {
        if (isCurrent) {
          setBrand(null);
          setBrandProducts([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoadingBrand(false);
        }
      }
    })();

    onCleanup(() => {
      isCurrent = false;
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
          <div class={filterTheme.layout}>
            <CategoryLongSidebar
              categories={sidebarCategories()}
              context={context()}
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
              <div class="mb-8 bg-white p-4">
                <div class="flex items-center gap-2 text-base text-slate-900">
                  <span>{t("nav.brand")}</span>
                  <span class="text-slate-300">/</span>
                </div>
              </div>

              <Show
                when={brand()}
                keyed
                fallback={
                  <Show
                    when={!isLoadingBrand()}
                    fallback={
                      <ApiLoader
                        title={t("brand.loadingDetailTitle")}
                        copy={t("brand.loadingDetailCopy")}
                      />
                    }
                  >
                    <div class="bg-white px-6 py-16 text-center">
                      <h1 class="text-2xl font-bold text-slate-900">
                        {t("brand.notFound")}
                      </h1>
                      <A
                        href="/brands"
                        class="mt-6 inline-flex bg-[#8e208c] px-5 py-2.5 text-sm font-semibold !text-white"
                      >
                        {t("brand.browseBrands")}
                      </A>
                    </div>
                  </Show>
                }
              >
                {(currentBrand) => (
                  <>
                    <div class="flex items-center justify-between border border-gray-200 bg-white p-2">
                      <h1 class="px-2 text-xl font-normal text-slate-950">
                        {currentBrand.name}
                      </h1>

                      <div class="flex items-center gap-2">
                        <Icon
                          path={arrowsUpDown}
                          class="h-5 w-5 text-slate-950"
                          aria-hidden="true"
                        />
                        <span class="text-sm text-slate-950">{t("filter.sortBy")}</span>
                        <select
                          class="h-12 border-0 bg-gray-100 px-5 text-sm text-slate-950 outline-none"
                          value={queryType()}
                          onChange={(event) =>
                            updateQuery({
                              queryType: event.currentTarget.value,
                              page: undefined,
                            })
                          }
                        >
                          {sortKeys.map((sortKey) => (
                            <option value={sortKey}>
                              {getSortLabel(sortKey, t)}
                            </option>
                          ))}
                        </select>
                        <Icon
                          path={chevronDown}
                          class="-ml-9 h-5 w-5 pointer-events-none text-slate-950"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <Show
                      when={products().length > 0}
                      fallback={
                        <div class="mt-4 bg-white px-6 py-16 text-center">
                          <h2 class="text-2xl font-bold text-gray-800">
                            {t("brand.noProducts")}
                          </h2>
                          <p class="mt-2 text-gray-500">
                            {t("brand.noProductsDescription")}
                          </p>
                        </div>
                      }
                    >
                      <div class="relative mt-4 grid grid-cols-2 gap-2 pb-8 md:grid-cols-3 md:gap-3 md:rounded-sm md:pb-6 xl:grid-cols-5 2xl:grid-cols-5">
                        <For each={paginatedProducts()}>
                          {(product) => <ProductCard product={product} />}
                        </For>
                      </div>
                    </Show>

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
                  </>
                )}
              </Show>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getSortLabel(sortKey: CategorySortKey, t: (key: string) => string) {
  const labels: Record<CategorySortKey, string> = {
    latest: t("filter.default"),
    highest_sold: t("filter.mostPopular"),
    highest_rating: t("filter.highestRating"),
    lowest_price: t("filter.lowestPrice"),
    highest_price: t("filter.highestPrice"),
  };

  return labels[sortKey];
}
