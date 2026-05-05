import { For } from "solid-js";
import type { HeroData } from "../../lib/home";
import { theme } from "../../lib/theme";

type FeatureHighlightsProps = {
  items: HeroData["highlights"];
};

export function FeatureHighlights(props: FeatureHighlightsProps) {
  return (
    <div class="grid gap-4 md:grid-cols-3">
      <For each={props.items}>
        {(item) => (
          <div class={`${theme.card} px-4 py-4`}>
            <div class="text-xs font-bold uppercase tracking-[0.16em] text-[#8e208c]">
              {item.title}
            </div>
            <p class="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        )}
      </For>
    </div>
  );
}
