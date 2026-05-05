import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { For, createSignal, onCleanup, onMount } from "solid-js";
import type { HeroData } from "../../lib/home";

type HeroBannerProps = {
  slides: HeroData["slides"];
};

export function HeroBanner(props: HeroBannerProps) {
  let viewportRef: HTMLDivElement | undefined;
  let emblaApi: EmblaCarouselType | undefined;
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  onMount(() => {
    if (!viewportRef) {
      return;
    }

    emblaApi = EmblaCarousel(viewportRef, { loop: true, align: "start" });

    const onSelect = () => {
      setSelectedIndex(emblaApi?.selectedScrollSnap() ?? 0);
    };

    emblaApi.on("select", onSelect);
    onSelect();

    const intervalId = window.setInterval(() => {
      emblaApi?.scrollNext();
    }, 5000);

    onCleanup(() => {
      window.clearInterval(intervalId);
      emblaApi?.destroy();
    });
  });

  return (
    <section class={` relative overflow-hidden`}>
      <div class="overflow-hidden" ref={viewportRef}>
        <div class="flex">
          <For each={props.slides}>
            {(slide) => (
              <div class="min-w-0 flex-[0_0_100%]">
                <a
                  href={slide.href}
                  class="block h-100 bg-[#f8ecf8] "
                >
                  <img
                    src={slide.image}
                    alt=""
                    class="block h-full w-full object-cover"
                  />
                </a>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3">
        <div class="pointer-events-auto flex gap-2">
          <For each={props.slides}>
            {(_, index) => (
              <button
                type="button"
                aria-label={`Go to slide ${index() + 1}`}
                onClick={() => emblaApi?.scrollTo(index())}
                class={`h-2.5 rounded-full transition ${
                  selectedIndex() === index()
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            )}
          </For>
        </div>

        <div class="pointer-events-auto hidden gap-2 sm:flex">
          <SliderArrow label="Previous slide" onClick={() => emblaApi?.scrollPrev()}>
            ‹
          </SliderArrow>
          <SliderArrow label="Next slide" onClick={() => emblaApi?.scrollNext()}>
            ›
          </SliderArrow>
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
      class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/85 text-xl font-semibold text-[#8e208c] backdrop-blur transition hover:bg-white"
    >
      {props.children}
    </button>
  );
}
