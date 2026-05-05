import { getStoreBrandsAction } from "@repo/graphql";
import { A, useLocation, useNavigate } from "@solidjs/router";
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
import { loadMenuData } from "../lib/home";
import { useI18n } from "../lib/i18n";
import { theme } from "../lib/theme";
import { ApiLoader } from "../components/common/ApiLoader";
import { CategoryLongSidebar } from "../widgets/category-filter/CategoryLongSidebar";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const filterTheme = theme.categoryFilter;
const FIRST_OPTIONS = [10, 15, 30, 50];
const BRAND_GRID_TWO_ROWS = 10;

const brandsContext: CategoryFilterContext = {
  kind: "category",
  title: "Brands",
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

type StoreBrand = NonNullable<
  Awaited<ReturnType<typeof getStoreBrandsAction>>
>["items"][number];

type BrandCard = {
  id: string;
  name: string;
  image: string;
  detailPath: string;
};

function slugifyBrand(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createBrandPlaceholder(name: string) {
  const label = escapeXml(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" role="img" aria-label="${label}">
    <rect width="360" height="160" fill="#f7f6f4" />
    <text x="180" y="86" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="800" fill="#8e208c">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mapStoreBrand(brand: StoreBrand): BrandCard {
  const id = String(brand.id);
  const name = brand.name?.trim() || "Untitled Brand";
  const slug = brand.slug?.trim() || slugifyBrand(name) || id;

  return {
    id,
    name,
    image: brand.logoUrl?.trim() || createBrandPlaceholder(name),
    detailPath: `/brand/${slug}/${id}/`,
  };
}

export function BrandsPage() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [brands, setBrands] = createSignal<BrandCard[]>([]);
  const [sidebarCategories, setSidebarCategories] = createSignal<
    CategoryFilterCategory[]
  >([]);
  const [isLoadingBrands, setIsLoadingBrands] = createSignal(true);
  const [brandsMessage, setBrandsMessage] = createSignal("");

  const query = createMemo(() => new URLSearchParams(location.search));
  const priceRange = createMemo(() => ({
    min: parseQueryNumber(query().get("min")),
    max: parseQueryNumber(query().get("max")),
  }));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 10));
  const paginatedBrands = createMemo(() => {
    const rows = brands();
    const page = Math.min(
      currentPage(),
      Math.max(1, Math.ceil(rows.length / first())),
    );
    const start = (page - 1) * first();

    return rows.slice(start, start + first());
  });

  onMount(() => {
    let isMounted = true;

    const loadBrands = async () => {
      try {
        setIsLoadingBrands(true);
        setBrandsMessage("");

        const response = await getStoreBrandsAction({
          isActive: true,
          isPrivate: false,
          limit: 100,
          offset: 0,
        });
        const nextBrands = response?.items.map(mapStoreBrand) ?? [];

        if (!isMounted) {
          return;
        }

        setBrands(nextBrands);
        setBrandsMessage(
          nextBrands.length > 0 ? "" : t("brand.empty"),
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setBrands([]);
        setBrandsMessage(t("brand.loadError"));
      } finally {
        if (isMounted) {
          setIsLoadingBrands(false);
        }
      }
    };

    void loadBrands();

    onCleanup(() => {
      isMounted = false;
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
        <div class="mx-auto flex w-full px-0 pb-5 sm:px-4">
          <div class={filterTheme.wrap}>
            <CategoryLongSidebar
              categories={sidebarCategories()}
              context={brandsContext}
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
              <section class="bg-white p-4">
                <h1 class="text-2xl font-bold text-slate-950">{t("brand.title")}</h1>
              </section>

              <Show
                when={!isLoadingBrands() && !brandsMessage()}
                fallback={
                  <Show
                    when={!isLoadingBrands()}
                    fallback={
                      <ApiLoader
                        title={t("brand.loadingTitle")}
                        copy={t("brand.loadingCopy")}
                      />
                    }
                  >
                    <div class="flex min-h-[320px] items-center justify-center bg-white px-6 text-center text-sm font-medium text-slate-500">
                      {brandsMessage()}
                    </div>
                  </Show>
                }
              >
                <section class="mt-4 grid grid-cols-2 gap-3 pb-10 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  <For each={paginatedBrands()}>
                    {(brand) => (
                      <A
                        href={brand.detailPath}
                        class="block border border-gray-100 bg-white p-2 transition hover:border-gray-200 hover:shadow-sm"
                      >
                        <div class="flex aspect-[2.15/1] items-center justify-center bg-[#f7f6f4] p-2">
                          <img
                            src={brand.image}
                            alt={brand.name}
                            class="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <h2 class="truncate px-2 py-2 text-center text-sm font-normal text-slate-800">
                          {brand.name}
                        </h2>
                      </A>
                    )}
                  </For>
                </section>
                <Show when={brands().length > BRAND_GRID_TWO_ROWS}>
                  <PaginationControls
                    total={brands().length}
                    page={currentPage()}
                    first={first()}
                    firstOptions={FIRST_OPTIONS}
                    onPageChange={(page) => updateQuery({ page: String(page) })}
                    onFirstChange={(nextFirst) =>
                      updateQuery({ first: String(nextFirst), page: undefined })
                    }
                  />
                </Show>
              </Show>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
