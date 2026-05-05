import { createSignal, For } from "solid-js";
import { Icon } from "solid-heroicons";
import { chevronDown } from "solid-heroicons/outline";
import type { CategorySortKey } from "../../lib/categories";
import { theme } from "../../lib/theme";

type SortItem = {
  name: string;
  href: CategorySortKey;
};

type CategorySortBarProps = {
  title: string;
  queryType: CategorySortKey;
  onChange: (queryType: CategorySortKey) => void;
};

const filterTheme = theme.categoryFilter;

const sortItems: SortItem[] = [
  { name: "Newest Products", href: "latest" },
  { name: "Most Popular", href: "highest_sold" },
  { name: "Highest Rating", href: "highest_rating" },
  { name: "Lowest Price", href: "lowest_price" },
  { name: "Highest Price", href: "highest_price" },
];

export function getSortLabel(queryType: CategorySortKey) {
  return sortItems.find((item) => item.href === queryType)?.name ?? "Default";
}

export function CategorySortBar(props: CategorySortBarProps) {
  const [open, setOpen] = createSignal(false);

  return (
    <div class={filterTheme.sortBar}>
      <div class={filterTheme.sortTitle}>{props.title}</div>
      <div class="flex justify-end">
        <div class="relative -ml-px flex items-center gap-1 sm:gap-2">
          <div class="flex items-center gap-2">
            <p class="hidden sm:block">Sort by:</p>
          </div>
          <button
            type="button"
            class={filterTheme.sortButton}
            onClick={() => setOpen((value) => !value)}
          >
            {getSortLabel(props.queryType)}
            <Icon path={chevronDown} class="h-4 w-4 md:h-5 md:w-5" />
          </button>

          {open() ? (
            <div class={filterTheme.sortMenu}>
              <For each={sortItems}>
                {(item) => (
                  <button
                    type="button"
                    class={`${filterTheme.sortItem} ${
                      item.href === props.queryType
                        ? filterTheme.sortItemActive
                        : ""
                    }`}
                    onClick={() => {
                      props.onChange(item.href);
                      setOpen(false);
                    }}
                  >
                    {item.name}
                  </button>
                )}
              </For>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
