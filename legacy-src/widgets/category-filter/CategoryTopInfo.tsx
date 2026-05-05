import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { CategoryFilterContext } from "../../lib/categories";
import { theme } from "../../lib/theme";

type CategoryTopInfoProps = {
  context: CategoryFilterContext;
};

const filterTheme = theme.categoryFilter;

export function CategoryTopInfo(props: CategoryTopInfoProps) {
  const childItems = () => {
    if (props.context.category && !props.context.subCategory) {
      return props.context.category.children;
    }

    if (props.context.subCategory && !props.context.subSubCategory) {
      return props.context.subCategory.children;
    }

    return [];
  };

  const allHref = () => {
    if (props.context.subSubCategory && props.context.subCategory) {
      return props.context.subCategory.href;
    }

    if (props.context.subCategory) {
      return props.context.subCategory.href;
    }

    return props.context.category?.href ?? "/categories";
  };

  const headingPrefix = () => {
    if (props.context.subSubCategory) {
      return "Products of ";
    }

    if (props.context.subCategory) {
      return "Sub Child Categories of ";
    }

    return "Sub Categories of ";
  };

  return (
    <div class={filterTheme.topPanel}>
      <Show when={props.context.cover}>
        <img
          class={filterTheme.cover}
          src={props.context.cover}
          alt={`${props.context.title} cover`}
          loading="lazy"
        />
      </Show>

      <h2 class={filterTheme.topTitle}>
        <span>{headingPrefix()}</span>
        <span class="text-[#8e208c]">{props.context.title}</span>
      </h2>

      <div class={filterTheme.chipStrip}>
        <button
          type="button"
          onClick={() => window.history.back()}
          class={filterTheme.chip}
        >
          back
        </button>
        <A
          href={allHref()}
          class={`${filterTheme.chip} ${
            props.context.subSubCategory ? "" : filterTheme.chipActive
          }`}
        >
          All
        </A>

        <For each={childItems()}>
          {(item) => (
            <A href={item.href} class={`${filterTheme.chip} bg-white`}>
              {item.title}
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
