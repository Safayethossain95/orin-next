import { getStoreListCategoriesWithAttributesAction } from "@repo/graphql";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import {
  loadCategoryBrowserData,
  type CategoryFilterCategory,
  type CategoryFilterSubCategory,
  type CategoryFilterSubSubCategory,
} from "../lib/categories";
import { createProductImage, loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const categoryTheme = theme.categoryPage;
const fallbackCategories = loadCategoryBrowserData();
const FIRST_OPTIONS = [12, 24, 36, 60];
const CATEGORY_TILE_TWO_ROWS = 12;
const categoryPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
  { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
];

type StoreCategory = NonNullable<
  Awaited<ReturnType<typeof getStoreListCategoriesWithAttributesAction>>
>[number];
type CategoryBrowserTile =
  | {
      kind: "seeAll";
      category: CategoryFilterCategory;
    }
  | {
      kind: "category";
      category: CategoryFilterSubCategory | CategoryFilterSubSubCategory;
    };

function toId(value: unknown) {
  return String(value ?? "");
}

function toNumericId(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function toTitle(category: StoreCategory) {
  return category.name?.trim() || "Untitled Category";
}

function toSlug(category: StoreCategory) {
  return (
    category.slug?.trim() ||
    toTitle(category)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function categoryImage(category: StoreCategory, index: number) {
  const image = category.categoryImageUrl?.trim();

  if (image) {
    return image;
  }

  return createProductImage(
    toTitle(category),
    categoryPalettes[index % categoryPalettes.length],
  );
}

function categoryHref(category: StoreCategory) {
  const slug = toSlug(category);
  const id = toId(category.id);

  if (category.depth <= 0 || !category.parentId) {
    return `/category/${slug}/${id}/`;
  }

  if (category.depth === 1) {
    return `/sub-category/${slug}/${id}/`;
  }

  return `/sub-sub-category/${slug}/${id}/`;
}

function sortStoreCategories(categories: StoreCategory[]) {
  return [...categories].sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return toTitle(first).localeCompare(toTitle(second));
  });
}

function mapNestedChild(
  category: StoreCategory,
  index: number,
  parent: StoreCategory,
): CategoryFilterSubSubCategory {
  const title = toTitle(category);
  const parentNumericId = toNumericId(parent.id, index + 1);

  return {
    id: toNumericId(category.id, index + 1),
    hid: toId(category.id),
    slug: toSlug(category),
    title,
    translation: title,
    label: title,
    image: categoryImage(category, index),
    cover: categoryImage(category, index),
    description: "",
    href: categoryHref(category),
    categoryId: toNumericId(parent.parentId, parentNumericId),
    subCategoryId: parentNumericId,
  };
}

function mapChildCategory(
  category: StoreCategory,
  index: number,
  childrenByParent: Map<string, StoreCategory[]>,
): CategoryFilterSubCategory {
  const title = toTitle(category);
  const currentNumericId = toNumericId(category.id, index + 1);
  const nestedChildren = sortStoreCategories(
    childrenByParent.get(toId(category.id)) ?? [],
  ).map((child, childIndex) => mapNestedChild(child, childIndex, category));

  return {
    id: currentNumericId,
    hid: toId(category.id),
    slug: toSlug(category),
    title,
    translation: title,
    label: title,
    image: categoryImage(category, index),
    cover: categoryImage(category, index),
    description: "",
    href: categoryHref(category),
    categoryId: toNumericId(category.parentId, currentNumericId),
    children: nestedChildren,
    leafCount: nestedChildren.length,
  };
}

function mapStoreCategories(
  categories: StoreCategory[],
): CategoryFilterCategory[] {
  const categoryIds = new Set(categories.map((category) => toId(category.id)));
  const childrenByParent = new Map<string, StoreCategory[]>();

  for (const category of categories) {
    const parentId = category.parentId ? toId(category.parentId) : "";

    if (!parentId) {
      continue;
    }

    childrenByParent.set(parentId, [
      ...(childrenByParent.get(parentId) ?? []),
      category,
    ]);
  }

  const browserCategories = sortStoreCategories(
    categories.filter(
      (category) =>
        category.depth <= 0 ||
        !category.parentId ||
        !categoryIds.has(toId(category.parentId)),
    ),
  );

  return browserCategories.map((category, index) => {
    const title = toTitle(category);
    const children = sortStoreCategories(
      childrenByParent.get(toId(category.id)) ?? [],
    ).map((child, childIndex) =>
      mapChildCategory(child, childIndex, childrenByParent),
    );

    return {
      id: toNumericId(category.id, index + 1),
      hid: toId(category.id),
      slug: toSlug(category),
      title,
      translation: title,
      label: title,
      image: categoryImage(category, index),
      cover: categoryImage(category, index),
      description: "",
      href: categoryHref(category),
      children,
      childCount: children.length,
    };
  });
}

function parseQueryInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback;
}

export function CategoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<CategoryFilterCategory[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal("");
  const query = createMemo(() => new URLSearchParams(location.search));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 12));

  const selectedCategory = createMemo(
    () =>
      categories().find((category) => category.hid === selectedCategoryKey()) ??
      categories()[0],
  );
  const currentCategoryTiles = createMemo<CategoryBrowserTile[]>(() => {
    const category = selectedCategory();

    if (!category) {
      return [];
    }

    return [
      { kind: "seeAll", category },
      ...category.children.flatMap((subCategory) => [
        { kind: "category" as const, category: subCategory },
        ...subCategory.children.map((nestedCategory) => ({
          kind: "category" as const,
          category: nestedCategory,
        })),
      ]),
    ];
  });
  const paginatedCategoryTiles = createMemo(() => {
    const rows = currentCategoryTiles();
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

  onMount(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getStoreListCategoriesWithAttributesAction();
        const nextCategories = response ? mapStoreCategories(response) : [];
        const resolvedCategories =
          nextCategories.length > 0 ? nextCategories : fallbackCategories;

        if (!isMounted) {
          return;
        }

        setCategories(resolvedCategories);
        setSelectedCategoryKey(resolvedCategories[0]?.hid ?? "");
      } catch {
        if (!isMounted) {
          return;
        }

        setCategories(fallbackCategories);
        setSelectedCategoryKey(fallbackCategories[0]?.hid ?? "");
        setError(
          "Live categories could not be loaded. Showing preview categories.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class={`${theme.container} pb-[60px] sm:py-4 md:pt-0`}>
        <div class={categoryTheme.surface}>
          <div class={categoryTheme.titleWrap}>
            <h1 class={categoryTheme.title}>All Categories</h1>
          </div>

          <Show when={isLoading()}>
            <div class="px-4 py-4 text-sm font-medium text-slate-500">
              Loading categories...
            </div>
          </Show>

          <Show when={error()}>
            <div class="mx-4 mb-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {error()}
            </div>
          </Show>

          <Show
            when={selectedCategory()}
            fallback={
              <div class="px-4 py-12 text-center text-sm font-medium text-slate-500">
                No categories are available.
              </div>
            }
          >
            <div class={categoryTheme.browserGrid}>
              <div class={categoryTheme.railWrap}>
                <div class={categoryTheme.rail}>
                  <For each={categories()}>
                    {(category) => {
                      const isSelected = () =>
                        selectedCategoryKey() === category.hid;

                      return (
                        <button
                          type="button"
                          class={categoryTheme.railButton}
                          aria-pressed={isSelected()}
                          onClick={() => {
                            setSelectedCategoryKey(category.hid);
                            updateQuery({ page: undefined });
                          }}
                        >
                          <div
                            class={`${categoryTheme.railCard} ${
                              isSelected()
                                ? categoryTheme.railCardActive
                                : categoryTheme.railCardInactive
                            }`}
                          >
                            <img
                              src={category.image}
                              alt={category.label}
                              class={categoryTheme.railImage}
                            />
                            <h2 class={categoryTheme.railLabel}>
                              {category.label}
                            </h2>
                          </div>
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>

              <div class={categoryTheme.content}>
                <div class={categoryTheme.tileGrid}>
                  <For each={paginatedCategoryTiles()}>
                    {(tile) =>
                      tile.kind === "seeAll" ? (
                        <A
                          href={tile.category.href}
                          class={categoryTheme.tileLink}
                        >
                          <div class={categoryTheme.tileImageFrame}>
                            <img
                              src={tile.category.image}
                              alt={tile.category.label}
                              class={categoryTheme.tileImage}
                            />
                          </div>
                          <h2 class={categoryTheme.tileLabel}>See All</h2>
                        </A>
                      ) : (
                        <CategoryTile category={tile.category} />
                      )
                    }
                  </For>
                </div>
                <Show
                  when={currentCategoryTiles().length > CATEGORY_TILE_TWO_ROWS}
                >
                  <PaginationControls
                    total={currentCategoryTiles().length}
                    page={currentPage()}
                    first={first()}
                    firstOptions={FIRST_OPTIONS}
                    onPageChange={(page) => updateQuery({ page: String(page) })}
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
          </Show>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CategoryTile(props: {
  category: CategoryFilterSubCategory | CategoryFilterSubSubCategory;
}) {
  return (
    <A href={props.category.href} class={categoryTheme.tileLink}>
      <div class={categoryTheme.tileImageFrame}>
        <img
          src={props.category.image}
          alt={props.category.label}
          class={categoryTheme.tileImage}
        />
      </div>
      <h2 class={categoryTheme.tileLabel}>{props.category.label}</h2>
    </A>
  );
}
