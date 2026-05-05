import { For } from "solid-js";
import { theme } from "../../lib/theme";
import { SectionHeader } from "./SectionHeader";

type BrandStripProps = {
  brands: string[];
};

export function BrandStrip(props: BrandStripProps) {
  return (
    <section class={theme.card}>
      <SectionHeader title="Top Brands" copy="Trusted picks across electronics, lifestyle, and home." />
      <div class="flex flex-wrap gap-3 p-4">
        <For each={props.brands}>
          {(brand) => (
            <a
              href="#"
              class="inline-flex min-w-[112px] items-center justify-center rounded-xl border border-[#efe8f5] bg-[#fbf8fe] px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#dcbde8] hover:text-[#8e208c]"
            >
              {brand}
            </a>
          )}
        </For>
      </div>
    </section>
  );
}
