import {
  getStoreListCategoriesWithAttributesAction,
  getStoreCollectionAction,
  getStoreProductByIdAction,
  type StoreCollectionQuery,
  type StoreProductByIdQuery,
} from "@repo/graphql";
import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import {
  mapStoreCategoriesToCategoryFilter,
  type CategoryFilterCategory,
  type CategoryFilterContext,
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
const productPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
  { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
];
const FIRST_OPTIONS = [15, 30, 50, 100];
const PRODUCT_GRID_TWO_ROWS = 10;

type CollectionRecord = NonNullable<StoreCollectionQuery["store_collection"]>;
type StoreProduct = NonNullable<StoreProductByIdQuery["store_product_by_id"]>;

const sidebarContext: CategoryFilterContext = {
  kind: "category",
  title: "Collections",
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

function extractProductId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const id = record.id ?? record.productId ?? record.product_id;

    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }

  return null;
}

function mapProduct(product: StoreProduct, index: number): ProductCardData {
  const sellPrice = Number(
    product.price?.sellPrice ?? product.price?.basePrice ?? 0,
  );
  const comparePrice = Number(
    product.price?.compareAtPrice ?? product.price?.basePrice ?? sellPrice,
  );
  const stock = product.inventory?.availableStock ?? product.inventory?.stock ?? 0;
  const tint = productPalettes[index % productPalettes.length];

  return {
    id: String(product.id),
    backendProductId: String(product.id),
    slug: product.slug,
    detailPath: `/product/${product.slug}/${product.id}/`,
    name: product.title,
    brand: product.brandName?.trim() || "Store",
    categoryName: product.categoryName?.trim() || undefined,
    badge: stock > 0 ? "In stock" : "Product",
    image:
      product.primaryImageUrl?.trim() ||
      createProductImage(
        product.title,
        tint,
      ),
    price: sellPrice,
    originalPrice: comparePrice,
    tint,
    subtitle: product.subtitle?.trim() || product.shortDescription?.trim() || undefined,
    sku: product.sku?.trim() || undefined,
    availability: stock > 0 ? `${stock} in stock` : "Out of stock",
  };
}

function LoadingState() {
  return (
    <div class="flex h-[60vh] items-center justify-center space-x-2 bg-white">
      <div class="h-4 w-4 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
      <div class="h-4 w-4 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
      <div class="h-4 w-4 animate-bounce rounded-full bg-gray-300" />
    </div>
  );
}

export function CollectionDetailsPage() {
  const { t } = useI18n();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [collection, setCollection] = createSignal<CollectionRecord | null>(
    null,
  );
  const [products, setProducts] = createSignal<ProductCardData[]>([]);
  const [sidebarCategories, setSidebarCategories] = createSignal<
    CategoryFilterCategory[]
  >([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const query = createMemo(() => new URLSearchParams(location.search));
  const priceRange = createMemo(() => ({
    min: parseQueryNumber(query().get("min")),
    max: parseQueryNumber(query().get("max")),
  }));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 15));
  const filteredProducts = createMemo(() => {
    const range = priceRange();

    return products().filter((product) => {
      if (range.min && product.price < range.min) {
        return false;
      }

      if (range.max && product.price > range.max) {
        return false;
      }

      return true;
    });
  });
  const paginatedProducts = createMemo(() => {
    const rows = filteredProducts();
    const page = Math.min(
      currentPage(),
      Math.max(1, Math.ceil(rows.length / first())),
    );
    const start = (page - 1) * first();

    return rows.slice(start, start + first());
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

  createEffect(() => {
    let isCurrent = true;

    void (async () => {
      try {
        const categoriesResponse =
          await getStoreListCategoriesWithAttributesAction();

        if (isCurrent) {
          setSidebarCategories(
            mapStoreCategoriesToCategoryFilter(categoriesResponse ?? []),
          );
        }
      } catch {
        if (isCurrent) {
          setSidebarCategories([]);
        }
      }
    })();

    onCleanup(() => {
      isCurrent = false;
    });
  });

  createEffect(() => {
    const collectionId = params.id;
    let isCurrent = true;

    setCollection(null);
    setProducts([]);
    setError(null);

    if (!collectionId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const nextCollection = await getStoreCollectionAction({
          collectionId,
          includeUnpublished: false,
        });

        if (!isCurrent) {
          return;
        }

        if (
          nextCollection &&
          (nextCollection.status !== "active" ||
            nextCollection.visibility !== "public")
        ) {
          setCollection(null);
          setProducts([]);
          return;
        }

        setCollection(nextCollection);

        const productIds = Array.from(
          new Set(
            (nextCollection?.selectedProductIds ?? []).map(extractProductId),
          ),
        ).filter((id): id is string => Boolean(id));
        const productResponses = await Promise.all(
          productIds.map((productId) =>
            getStoreProductByIdAction({ productId }),
          ),
        );

        if (!isCurrent) {
          return;
        }

        setProducts(
          productResponses
            .filter((product): product is StoreProduct => Boolean(product))
            .map(mapProduct),
        );
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t("collection.loadError"),
          );
          setCollection(null);
          setProducts([]);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    })();

    onCleanup(() => {
      isCurrent = false;
    });
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class="bg-[#f3f4f8] pb-[60px] pt-0 sm:px-0 sm:pt-4 md:pt-0">
        <Show when={!loading()} fallback={<LoadingState />}>
          <Show
            when={collection()}
            keyed
            fallback={
              <div class="flex min-h-[60vh] items-center justify-center bg-white px-6 text-center">
                <div>
                  <h1 class="text-2xl font-bold text-slate-900">
                    {error()
                      ? t("collection.unableToLoad")
                      : t("collection.notFound")}
                  </h1>
                  <Show when={error()}>
                    {(message) => (
                      <p class="mt-3 max-w-xl text-sm text-slate-500">
                        {message()}
                      </p>
                    )}
                  </Show>
                  <A
                    href="/collections"
                    class="mt-6 inline-flex rounded-sm bg-[#8e208c] px-5 py-2.5 text-sm font-semibold !text-white"
                  >
                    {t("collection.browseCollections")}
                  </A>
                </div>
              </div>
            }
          >
            {(currentCollection) => (
              <div class="mx-auto grid max-w-screen-2xl gap-5 pb-5 sm:px-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <CategoryLongSidebar
                  categories={sidebarCategories()}
                  context={sidebarContext}
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
                <div class="flex min-w-0 w-full gap-3">
                  <div class="min-h-[calc(100vh-94px)] w-full p-4 sm:rounded-sm md:mt-4 md:min-h-[calc(100vh-99px)] md:overflow-hidden lg:min-h-[calc(100vh-136px)]">
                    <Show when={currentCollection.mediaUrl?.trim()}>
                      {(image) => (
                        <div class="mb-8 overflow-hidden rounded-sm">
                          <img
                            src={image()}
                            alt={currentCollection.title}
                            class="h-full max-h-[150px] w-full object-cover md:max-h-[300px]"
                          />
                        </div>
                      )}
                    </Show>

                    <Show
                      when={filteredProducts().length > 0}
                      fallback={
                        <div class="mt-4 bg-white px-6 py-16 text-center">
                          <h2 class="text-2xl font-bold text-gray-800">
                            {t("brand.noProducts")}
                          </h2>
                          <p class="mt-2 text-gray-500">
                            {t("collection.noProductsDescription")}
                          </p>
                        </div>
                      }
                    >
                      <div class="relative grid grid-cols-2 gap-3 pb-8 sm:grid-cols-3 lg:grid-cols-5">
                        <For each={paginatedProducts()}>
                          {(product) => <ProductCard product={product} />}
                        </For>
                      </div>
                    </Show>
                    <Show
                      when={filteredProducts().length > PRODUCT_GRID_TWO_ROWS}
                    >
                      <PaginationControls
                        total={filteredProducts().length}
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
                  </div>
                </div>
              </div>
            )}
          </Show>
        </Show>
      </main>

      <Footer />
    </div>
  );
}
