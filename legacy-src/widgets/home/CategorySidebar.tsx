import { A } from "@solidjs/router";
import { For, Show, createMemo, createSignal } from "solid-js";
import { Icon } from "solid-heroicons";
import { chevronRight } from "solid-heroicons/outline";
import type {
  SidebarCategory,
  SidebarCategoryGroup,
  SidebarCategoryLeaf,
} from "../../lib/home";
import categorySidebarImagesRaw from "../../data/category-sidebar-images.json";

type CategorySidebarProps = {
  categories: SidebarCategory[];
};

function categorySearchPath(category: SidebarCategory | SidebarCategoryGroup | SidebarCategoryLeaf) {
  return `/categories?category=${encodeURIComponent(category.id)}`;
}

const categorySidebarImages = categorySidebarImagesRaw as Record<string, string>;

function getCategoryImage(id: string) {
  return (
    categorySidebarImages[id] ??
    categorySidebarImages["mobiles-tablets"]
  );
}

function CategoryTitle(props: { id: string; label: string }) {
  return (
    <span class="flex min-w-0 items-center gap-3">
      <img
        src={getCategoryImage(props.id)}
        alt={props.label}
        class="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
      <span class="min-w-0 truncate">{props.label}</span>
    </span>
  );
}

export function CategorySidebar(props: CategorySidebarProps) {
  const visibleCategories = createMemo(() => props.categories);
  const [selectedCategoryId, setSelectedCategoryId] = createSignal("");
  const [selectedGroupId, setSelectedGroupId] = createSignal("");
  const selectedCategory = createMemo(() => {
    const categories = visibleCategories();

    return (
      categories.find((category) => category.id === selectedCategoryId()) ??
      categories[0]
    );
  });
  const selectedGroup = createMemo(() => {
    const category = selectedCategory();

    if (!category) {
      return undefined;
    }

    return (
      category.children.find((group) => group.id === selectedGroupId()) ??
      category.children[0]
    );
  });

  const selectCategory = (category: SidebarCategory) => {
    setSelectedCategoryId(category.id);
    setSelectedGroupId(category.children[0]?.id ?? "");
  };

  const selectGroup = (group: SidebarCategoryGroup) => {
    setSelectedGroupId(group.id);
  };

  return (
    <aside
      class="group/sidebar relative hidden h-100 flex-col overflow-visible rounded-sm border border-slate-200 bg-white shadow-[0_10px_30px_rgba(58,19,91,0.05)] lg:flex"
      onMouseEnter={() => {
        const firstCategory = visibleCategories()[0];

        if (!selectedCategoryId() && firstCategory) {
          selectCategory(firstCategory);
        }
      }}
    >
      <div class="border-b border-[#f1ecf7] bg-[#fbf7ff] px-4 py-3">
        <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#8e208c]">
          All Categories
        </h2>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <For each={visibleCategories()}>
          {(category) => {
            const isSelected = () => selectedCategory()?.id === category.id;

            return (
              <button
                type="button"
                class={`flex min-h-11 w-full items-center justify-between border-b border-slate-200 px-4 text-left text-sm font-semibold transition hover:bg-[#fbf7fb] hover:text-[#b42363] ${
                  isSelected()
                    ? "bg-[#fbf7fb] text-[#b42363]"
                    : "text-slate-900"
                }`}
                aria-pressed={isSelected()}
                onMouseEnter={() => selectCategory(category)}
                onFocus={() => selectCategory(category)}
                onClick={() => selectCategory(category)}
              >
                <CategoryTitle id={category.id} label={category.label} />
                <Icon
                  path={chevronRight}
                  class="ml-3 h-4 w-4 shrink-0 text-current"
                  aria-hidden="true"
                />
              </button>
            );
          }}
        </For>
      </div>

      <div class="invisible absolute left-full top-0 z-50 hidden h-full w-140 grid-cols-2 overflow-hidden border border-slate-200 bg-white opacity-0 shadow-[0_16px_40px_rgba(58,19,91,0.12)] transition group-hover/sidebar:visible group-hover/sidebar:grid group-hover/sidebar:opacity-100">
        <div class="h-full overflow-y-auto border-r border-slate-200">
          <Show
            when={selectedCategory()}
            keyed
            fallback={
              <div class="border-b border-slate-200 px-4 py-4 text-sm font-medium text-slate-500">
                No subcategories available.
              </div>
            }
          >
            {(category) => (
              <>
                <For each={category.children}>
                  {(group) => {
                    const isSelected = () => selectedGroup()?.id === group.id;

                    return (
                      <button
                        type="button"
                        class={`flex min-h-11 w-full items-center justify-between border-b border-slate-200 px-4 text-left text-sm font-semibold transition hover:bg-[#fbf7fb] hover:text-[#b42363] ${
                          isSelected()
                            ? "bg-[#fbf7fb] text-[#b42363]"
                            : "text-slate-900"
                        }`}
                        aria-pressed={isSelected()}
                        onMouseEnter={() => selectGroup(group)}
                        onFocus={() => selectGroup(group)}
                        onClick={() => selectGroup(group)}
                      >
                        <CategoryTitle id={group.id} label={group.label} />
                        <Icon
                          path={chevronRight}
                          class="ml-3 h-4 w-4 shrink-0 text-current"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  }}
                </For>

                <Show when={category.children.length === 0}>
                  <A
                    href={categorySearchPath(category)}
                    class="flex min-h-11 w-full items-center border-b border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:bg-[#fbf7fb] hover:text-[#b42363]"
                  >
                    <CategoryTitle id={category.id} label={category.label} />
                  </A>
                </Show>
              </>
            )}
          </Show>
        </div>

        <div class="h-full overflow-y-auto">
          <Show
            when={selectedGroup()}
            keyed
            fallback={
              <div class="border-b border-slate-200 px-4 py-4 text-sm font-medium text-slate-500">
                No categories available.
              </div>
            }
          >
            {(group) => (
              <Show
                when={group.children.length > 0}
                fallback={
                  <A
                    href={categorySearchPath(group)}
                    class="flex min-h-11 w-full items-center border-b border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:bg-[#fbf7fb] hover:text-[#b42363]"
                  >
                    <CategoryTitle id={group.id} label={group.label} />
                  </A>
                }
              >
                <For each={group.children}>
                  {(leaf) => (
                    <A
                      href={categorySearchPath(leaf)}
                      class="flex min-h-11 w-full items-center border-b border-slate-200 px-4 text-sm font-semibold text-slate-900 transition hover:bg-[#fbf7fb] hover:text-[#b42363]"
                    >
                      <CategoryTitle id={leaf.id} label={leaf.label} />
                    </A>
                  )}
                </For>
              </Show>
            )}
          </Show>
        </div>
      </div>
    </aside>
  );
}
