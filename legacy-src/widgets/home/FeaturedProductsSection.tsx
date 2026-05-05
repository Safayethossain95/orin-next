import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { For, onCleanup, onMount } from "solid-js";
import type { ProductCardData } from "../../lib/home";
import { theme } from "../../lib/theme";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";

type FeaturedProductsSectionProps = {
  products: ProductCardData[];
};

export function FeaturedProductsSection(props: FeaturedProductsSectionProps) {
  let viewportRef: HTMLDivElement | undefined;
  let emblaApi: EmblaCarouselType | undefined;

  onMount(() => {
    if (!viewportRef) {
      return;
    }

    emblaApi = EmblaCarousel(viewportRef, {
      loop: true,
      align: "start",
      dragFree: false,
    });

    const intervalId = window.setInterval(() => {
      emblaApi?.scrollNext();
    }, 3500);

    onCleanup(() => {
      window.clearInterval(intervalId);
      emblaApi?.destroy();
    });
  });

  return (
    <section class={theme.card}>
      <SectionHeader
        title="Featured Products"
        copy="A compact shelf of recommended products inspired by the reference layout."
      />
      <div class="px-4 pb-4">
        <div class="mb-3 flex justify-end gap-2">
          <SliderArrow label="Previous featured products" onClick={() => emblaApi?.scrollPrev()}>
            ‹
          </SliderArrow>
          <SliderArrow label="Next featured products" onClick={() => emblaApi?.scrollNext()}>
            ›
          </SliderArrow>
        </div>
        <div class="overflow-hidden" ref={viewportRef}>
          <div class="flex gap-3">
            <For each={props.products}>
              {(product) => (
                <div class="min-w-0 flex-[0_0_82%] sm:flex-[0_0_48%] lg:flex-[0_0_31%] xl:flex-[0_0_15.833%]">
                  <ProductCard product={product} />
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderArrow(props: {
  label: string;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={props.onClick}
      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eadcf1] bg-white text-lg font-semibold text-[#8e208c] transition hover:border-[#8e208c]"
    >
      {props.children}
    </button>
  );
}
