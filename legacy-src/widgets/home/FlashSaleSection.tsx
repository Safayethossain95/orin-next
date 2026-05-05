import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import type { ProductCardData } from "../../lib/home";
import { theme } from "../../lib/theme";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";

type FlashSaleSectionProps = {
  deals: ProductCardData[];
};

const FLASH_ENDS_AT_KEY = "orin_flash_sale_ends_at";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatCountdownValue(value: number) {
  return value.toString().padStart(2, "0");
}

export function FlashSaleSection(props: FlashSaleSectionProps) {
  let viewportRef: HTMLDivElement | undefined;
  let emblaApi: EmblaCarouselType | undefined;
  const [remainingMs, setRemainingMs] = createSignal(ONE_DAY_MS);

  const countdownLabel = createMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(remainingMs() / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      { value: days, label: "days" },
      { value: hours, label: "hours" },
      { value: minutes, label: "minutes" },
      { value: seconds, label: "seconds" },
    ];
  });

  onMount(() => {
    if (!viewportRef) {
      return;
    }

    emblaApi = EmblaCarousel(viewportRef, {
      loop: false,
      align: "start",
      dragFree: true,
    });

    const storageValue = window.localStorage.getItem(FLASH_ENDS_AT_KEY);
    const now = Date.now();
    let endsAt = storageValue ? Number(storageValue) : NaN;

    if (!Number.isFinite(endsAt) || endsAt <= now) {
      endsAt = now + ONE_DAY_MS;
      window.localStorage.setItem(FLASH_ENDS_AT_KEY, String(endsAt));
    }

    const updateCountdown = () => {
      const nextRemainingMs = Math.max(0, endsAt - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        window.localStorage.removeItem(FLASH_ENDS_AT_KEY);
        window.location.reload();
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    onCleanup(() => {
      window.clearInterval(intervalId);
      emblaApi?.destroy();
    });
  });

  return (
    <section class={theme.card}>
      <SectionHeader
        title="Flash Sale"
        copy="Fast moving handpicked deals from today’s campaign."
        actionHref="/product/flash"
        centerContent={
          <div class="flex items-center gap-2 rounded-full  px-3 py-2 ">
            
            <div class="flex items-center gap-1.5">
              <For each={countdownLabel()}>
                {(item) => (
                  <div class="flex min-w-14 flex-col items-center rounded-xl border border-[#ffd8c8] bg-white px-2 py-1.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <span class="text-lg font-black leading-none text-[#8e208c]">
                      {formatCountdownValue(item.value)}
                    </span>
                    <span class="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#f15d22]">
                      {item.label}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </div>
        }
      />
      <div class="px-4 pb-4">
        <div class="mb-3 flex justify-end gap-2">
          <SliderArrow label="Previous flash products" onClick={() => emblaApi?.scrollPrev()}>
            ‹
          </SliderArrow>
          <SliderArrow label="Next flash products" onClick={() => emblaApi?.scrollNext()}>
            ›
          </SliderArrow>
        </div>
        <div class="overflow-hidden" ref={viewportRef}>
          <div class="flex gap-3">
            <For each={props.deals}>
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
