import { getStoreListCategoriesWithAttributesAction } from "@repo/graphql";
import categoryFilterRaw from "../data/category-filter.json";
import { createProductImage } from "./home";

type CategoryPalette = {
  background: string;
  foreground: string;
  accent: string;
};

type RawCategory = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  description: string;
  image?: string;
  cover?: string;
};

type RawSubCategory = RawCategory & {
  category_id: number;
};

type RawSubSubCategory = RawSubCategory & {
  sub_category_id: number;
};

type RawCategoryProduct = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  thumbnail?: string;
  category_id: number;
  sub_category_id: number;
  sub_sub_category_id?: number;
  price: number;
  compare_price: number;
  currency: string;
  rating: number;
  rating_total: number;
  quantity: number;
  is_continue_selling: boolean;
  sold_count: number;
  created_at: string;
};

export type CategoryFilterKind = "category" | "subCategory" | "subSubCategory";

export type CategoryFilterSubSubCategory = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  label: string;
  image: string;
  cover: string;
  description: string;
  href: string;
  categoryId: number;
  subCategoryId: number;
};

export type CategoryFilterSubCategory = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  label: string;
  image: string;
  cover: string;
  description: string;
  href: string;
  categoryId: number;
  children: CategoryFilterSubSubCategory[];
  leafCount: number;
};

export type CategoryFilterCategory = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  label: string;
  image: string;
  cover: string;
  description: string;
  href: string;
  children: CategoryFilterSubCategory[];
  childCount: number;
};

export type CategoryFilterProduct = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  translation: string;
  thumbnail: string;
  categoryId: number;
  subCategoryId: number;
  subSubCategoryId?: number;
  price: number;
  comparePrice: number;
  currency: string;
  rating: number;
  ratingTotal: number;
  quantity: number;
  isContinueSelling: boolean;
  soldCount: number;
  createdAt: string;
  detailPath: string;
};

export type CategoryFilterContext = {
  kind: CategoryFilterKind;
  title: string;
  cover: string;
  description: string;
  category: CategoryFilterCategory | null;
  subCategory: CategoryFilterSubCategory | null;
  subSubCategory: CategoryFilterSubSubCategory | null;
};

export type CategorySortKey =
  | "latest"
  | "highest_sold"
  | "highest_rating"
  | "lowest_price"
  | "highest_price";

export type StoreCategory = NonNullable<
  Awaited<ReturnType<typeof getStoreListCategoriesWithAttributesAction>>
>[number];

const categoryPalettes: CategoryPalette[] = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
  { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
  { background: "#f1f5f9", foreground: "#0f172a", accent: "#334155" },
  { background: "#ecfeff", foreground: "#0891b2", accent: "#164e63" },
];

const categoryData = categoryFilterRaw as {
  categories: RawCategory[];
  sub_categories: RawSubCategory[];
  sub_sub_categories: RawSubSubCategory[];
  products: RawCategoryProduct[];
};

function getPalette(index: number) {
  return categoryPalettes[index % categoryPalettes.length];
}

function getImage(title: string, palette: CategoryPalette, image?: string) {
  return image?.trim() || createProductImage(title, palette);
}

function getCategoryHref(category: Pick<RawCategory, "slug" | "hid">) {
  return `/category/${category.slug}/${category.hid}/`;
}

function getSubCategoryHref(subCategory: Pick<RawSubCategory, "slug" | "hid">) {
  return `/sub-category/${subCategory.slug}/${subCategory.hid}/`;
}

function getSubSubCategoryHref(
  subSubCategory: Pick<RawSubSubCategory, "slug" | "hid">,
) {
  return `/sub-sub-category/${subSubCategory.slug}/${subSubCategory.hid}/`;
}

function getLiveCategoryTitle(category: StoreCategory) {
  return category.name?.trim() || "Untitled Category";
}

function getLiveCategorySlug(category: StoreCategory) {
  return (
    category.slug?.trim() ||
    getLiveCategoryTitle(category)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function getLiveNumericId(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getLiveCategoryImage(category: StoreCategory, index: number) {
  const image = category.categoryImageUrl?.trim();

  if (image) {
    return image;
  }

  return createProductImage(getLiveCategoryTitle(category), getPalette(index));
}

function getLiveCategoryHref(category: StoreCategory) {
  const slug = getLiveCategorySlug(category);
  const id = String(category.id);

  if (category.depth <= 0 || !category.parentId) {
    return `/category/${slug}/${id}/`;
  }

  if (category.depth === 1) {
    return `/sub-category/${slug}/${id}/`;
  }

  return `/sub-sub-category/${slug}/${id}/`;
}

function createLiveCategoryBase(category: StoreCategory, index: number) {
  const title = getLiveCategoryTitle(category);
  const image = getLiveCategoryImage(category, index);

  return {
    id: getLiveNumericId(category.id, index + 1),
    hid: String(category.id),
    slug: getLiveCategorySlug(category),
    title,
    translation: title,
    label: title,
    image,
    cover: image,
    description: "",
    href: getLiveCategoryHref(category),
  };
}

function sortLiveCategories(categories: StoreCategory[]) {
  return [...categories].sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return getLiveCategoryTitle(first).localeCompare(
      getLiveCategoryTitle(second),
    );
  });
}

function mapLiveSubSubCategory(
  category: StoreCategory,
  index: number,
  parent: StoreCategory,
): CategoryFilterSubSubCategory {
  const base = createLiveCategoryBase(category, index);
  const parentNumericId = getLiveNumericId(parent.id, index + 1);

  return {
    ...base,
    categoryId: getLiveNumericId(parent.parentId, parentNumericId),
    subCategoryId: parentNumericId,
  };
}

function mapLiveSubCategory(
  category: StoreCategory,
  index: number,
  childrenByParent: Map<string, StoreCategory[]>,
): CategoryFilterSubCategory {
  const base = createLiveCategoryBase(category, index);
  const nestedChildren = sortLiveCategories(
    childrenByParent.get(String(category.id)) ?? [],
  ).map((child, childIndex) =>
    mapLiveSubSubCategory(child, childIndex, category),
  );

  return {
    ...base,
    categoryId: getLiveNumericId(category.parentId, base.id),
    children: nestedChildren,
    leafCount: nestedChildren.length,
  };
}

export function mapStoreCategoriesToCategoryFilter(
  liveCategories: StoreCategory[],
): CategoryFilterCategory[] {
  const categoryIds = new Set(
    liveCategories.map((category) => String(category.id)),
  );
  const childrenByParent = new Map<string, StoreCategory[]>();

  for (const category of liveCategories) {
    const parentId = category.parentId ? String(category.parentId) : "";

    if (!parentId) {
      continue;
    }

    childrenByParent.set(parentId, [
      ...(childrenByParent.get(parentId) ?? []),
      category,
    ]);
  }

  const rootCategories = sortLiveCategories(
    liveCategories.filter(
      (category) =>
        category.depth <= 0 ||
        !category.parentId ||
        !categoryIds.has(String(category.parentId)),
    ),
  );

  return rootCategories.map((category, index) => {
    const base = createLiveCategoryBase(category, index);
    const children = sortLiveCategories(
      childrenByParent.get(String(category.id)) ?? [],
    ).map((child, childIndex) =>
      mapLiveSubCategory(child, childIndex, childrenByParent),
    );

    return {
      ...base,
      children,
      childCount: children.length,
    };
  });
}

export async function loadLiveCategoryFilterCategories() {
  const response = await getStoreListCategoriesWithAttributesAction();

  return mapStoreCategoriesToCategoryFilter(response ?? []);
}

export function resolveLiveCategoryFilterContext(
  kind: CategoryFilterKind,
  category: StoreCategory,
  liveCategories: StoreCategory[],
): CategoryFilterContext {
  const categoryIndex = liveCategories.findIndex(
    (item) => String(item.id) === String(category.id),
  );
  const base = createLiveCategoryBase(category, Math.max(categoryIndex, 0));
  const parent = category.parentId
    ? (liveCategories.find(
        (item) => String(item.id) === String(category.parentId),
      ) ?? null)
    : null;
  const parentIndex = parent
    ? liveCategories.findIndex((item) => String(item.id) === String(parent.id))
    : -1;

  if (kind === "subSubCategory") {
    const subCategory = parent;
    const rootCategory = subCategory?.parentId
      ? (liveCategories.find(
          (item) => String(item.id) === String(subCategory.parentId),
        ) ?? null)
      : null;
    const categoryItem: CategoryFilterCategory | null = rootCategory
      ? {
          ...createLiveCategoryBase(rootCategory, Math.max(parentIndex, 0)),
          children: [],
          childCount: 0,
        }
      : null;
    const subCategoryItem: CategoryFilterSubCategory | null = subCategory
      ? {
          ...createLiveCategoryBase(subCategory, Math.max(parentIndex, 0)),
          categoryId: getLiveNumericId(
            subCategory.parentId,
            getLiveNumericId(subCategory.id, 0),
          ),
          children: [],
          leafCount: 0,
        }
      : null;
    const subSubCategoryItem: CategoryFilterSubSubCategory = {
      ...base,
      categoryId: getLiveNumericId(
        subCategory?.parentId,
        getLiveNumericId(category.parentId, base.id),
      ),
      subCategoryId: getLiveNumericId(category.parentId, base.id),
    };

    return {
      kind,
      title: base.title,
      cover: base.cover,
      description: base.description,
      category: categoryItem,
      subCategory: subCategoryItem,
      subSubCategory: subSubCategoryItem,
    };
  }

  if (kind === "subCategory") {
    const parentItem: CategoryFilterCategory | null = parent
      ? {
          ...createLiveCategoryBase(parent, Math.max(parentIndex, 0)),
          children: [],
          childCount: 0,
        }
      : null;
    const subCategory: CategoryFilterSubCategory = {
      ...base,
      categoryId: getLiveNumericId(category.parentId, base.id),
      children: [],
      leafCount: 0,
    };

    return {
      kind,
      title: base.title,
      cover: base.cover,
      description: base.description,
      category: parentItem,
      subCategory,
      subSubCategory: null,
    };
  }

  return {
    kind,
    title: base.title,
    cover: base.cover,
    description: base.description,
    category: {
      ...base,
      children: [],
      childCount: 0,
    },
    subCategory: null,
    subSubCategory: null,
  };
}

export function getCategoryAndDescendantIds(
  categoryId: string,
  liveCategories: StoreCategory[],
) {
  const childrenByParent = new Map<string, StoreCategory[]>();

  for (const category of liveCategories) {
    const parentId = category.parentId ? String(category.parentId) : "";

    if (!parentId) {
      continue;
    }

    childrenByParent.set(parentId, [
      ...(childrenByParent.get(parentId) ?? []),
      category,
    ]);
  }

  const ids = new Set([categoryId]);
  const queue = [...(childrenByParent.get(categoryId) ?? [])];

  while (queue.length > 0) {
    const category = queue.shift();

    if (!category) {
      continue;
    }

    const id = String(category.id);

    if (ids.has(id)) {
      continue;
    }

    ids.add(id);
    queue.push(...(childrenByParent.get(id) ?? []));
  }

  return [...ids];
}

function matchesRoute(
  entity: { hid: string; slug: string },
  id: string | undefined,
  slug: string | undefined,
) {
  return entity.hid === id || entity.slug === slug;
}

function adaptSubSubCategory(
  raw: RawSubSubCategory,
  index: number,
): CategoryFilterSubSubCategory {
  const palette = getPalette(index);

  return {
    id: raw.id,
    hid: raw.hid,
    slug: raw.slug,
    title: raw.title,
    translation: raw.translation,
    label: raw.title,
    image: getImage(raw.title, palette, raw.image),
    cover: getImage(`${raw.title} Collection`, palette, raw.cover),
    description: raw.description,
    href: getSubSubCategoryHref(raw),
    categoryId: raw.category_id,
    subCategoryId: raw.sub_category_id,
  };
}

const subSubCategories =
  categoryData.sub_sub_categories.map(adaptSubSubCategory);

function adaptSubCategory(
  raw: RawSubCategory,
  index: number,
): CategoryFilterSubCategory {
  const palette = getPalette(index);
  const children = subSubCategories.filter(
    (child) => child.subCategoryId === raw.id,
  );

  return {
    id: raw.id,
    hid: raw.hid,
    slug: raw.slug,
    title: raw.title,
    translation: raw.translation,
    label: raw.title,
    image: getImage(raw.title, palette, raw.image),
    cover: getImage(`${raw.title} Collection`, palette, raw.cover),
    description: raw.description,
    href: getSubCategoryHref(raw),
    categoryId: raw.category_id,
    children,
    leafCount: children.length,
  };
}

const subCategories = categoryData.sub_categories.map(adaptSubCategory);

function adaptCategory(
  raw: RawCategory,
  index: number,
): CategoryFilterCategory {
  const palette = getPalette(index);
  const children = subCategories.filter((child) => child.categoryId === raw.id);

  return {
    id: raw.id,
    hid: raw.hid,
    slug: raw.slug,
    title: raw.title,
    translation: raw.translation,
    label: raw.title,
    image: getImage(raw.title, palette, raw.image),
    cover: getImage(`${raw.title} Collection`, palette, raw.cover),
    description: raw.description,
    href: getCategoryHref(raw),
    children,
    childCount: children.length,
  };
}

const categories = categoryData.categories.map(adaptCategory);

function adaptProduct(
  raw: RawCategoryProduct,
  index: number,
): CategoryFilterProduct {
  const palette = getPalette(index);

  return {
    id: raw.id,
    hid: raw.hid,
    slug: raw.slug,
    title: raw.title,
    translation: raw.translation,
    thumbnail: getImage(raw.title, palette, raw.thumbnail),
    categoryId: raw.category_id,
    subCategoryId: raw.sub_category_id,
    subSubCategoryId: raw.sub_sub_category_id,
    price: raw.price,
    comparePrice: raw.compare_price,
    currency: raw.currency,
    rating: raw.rating,
    ratingTotal: raw.rating_total,
    quantity: raw.quantity,
    isContinueSelling: raw.is_continue_selling,
    soldCount: raw.sold_count,
    createdAt: raw.created_at,
    detailPath: `/product/${raw.slug}/${raw.hid}/`,
  };
}

const products = categoryData.products.map(adaptProduct);

export function loadCategoryBrowserData(): CategoryFilterCategory[] {
  return categories;
}

export function loadCategoryFilterData() {
  return {
    categories,
    subCategories,
    subSubCategories,
    products,
  };
}

export function resolveCategoryFilterContext(
  kind: CategoryFilterKind,
  params: { id?: string; slug?: string },
): CategoryFilterContext | null {
  if (kind === "category") {
    const category = categories.find((item) =>
      matchesRoute(item, params.id, params.slug),
    );

    return category
      ? {
          kind,
          title: category.title,
          cover: category.cover,
          description: category.description,
          category,
          subCategory: null,
          subSubCategory: null,
        }
      : null;
  }

  if (kind === "subCategory") {
    const subCategory = subCategories.find((item) =>
      matchesRoute(item, params.id, params.slug),
    );
    const category = subCategory
      ? (categories.find((item) => item.id === subCategory.categoryId) ?? null)
      : null;

    return subCategory
      ? {
          kind,
          title: subCategory.title,
          cover: subCategory.cover,
          description: subCategory.description,
          category,
          subCategory,
          subSubCategory: null,
        }
      : null;
  }

  const subSubCategory = subSubCategories.find((item) =>
    matchesRoute(item, params.id, params.slug),
  );
  const subCategory = subSubCategory
    ? (subCategories.find((item) => item.id === subSubCategory.subCategoryId) ??
      null)
    : null;
  const category = subSubCategory
    ? (categories.find((item) => item.id === subSubCategory.categoryId) ?? null)
    : null;

  return subSubCategory
    ? {
        kind,
        title: subSubCategory.title,
        cover: subSubCategory.cover,
        description: subSubCategory.description,
        category,
        subCategory,
        subSubCategory,
      }
    : null;
}

export function getProductsForContext(
  context: CategoryFilterContext,
  sortKey: CategorySortKey,
  priceRange: { min?: number; max?: number },
) {
  const filteredProducts = products.filter((product) => {
    if (priceRange.min !== undefined && product.price < priceRange.min) {
      return false;
    }

    if (priceRange.max !== undefined && product.price > priceRange.max) {
      return false;
    }

    if (context.subSubCategory) {
      return product.subSubCategoryId === context.subSubCategory.id;
    }

    if (context.subCategory) {
      return product.subCategoryId === context.subCategory.id;
    }

    return context.category
      ? product.categoryId === context.category.id
      : false;
  });

  return [...filteredProducts].sort((left, right) => {
    if (sortKey === "highest_sold") {
      return right.soldCount - left.soldCount;
    }

    if (sortKey === "highest_rating") {
      return right.rating - left.rating;
    }

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
