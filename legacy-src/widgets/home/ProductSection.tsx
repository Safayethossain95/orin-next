import { For } from "solid-js";
import type { HomeSectionData } from "../../lib/home";
import { theme } from "../../lib/theme";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";

type ProductSectionProps = {
  section: HomeSectionData;
};

export function ProductSection(props: ProductSectionProps) {
  return (
    <section class={`${theme.card} overflow-hidden`}>
      <SectionHeader title={props.section.title} copy={props.section.accent} />
      <div class="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-4 lg:grid-cols-5 xl:grid-cols-6">
        <For each={props.section.products}>
          {(product) => (
            <div class="min-w-0">
              <ProductCard product={product} />
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
