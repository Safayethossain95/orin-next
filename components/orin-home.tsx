"use client";

import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/providers";
import {
  brandNames,
  categorySidebarImages,
  featuredProducts,
  flashSaleProducts,
  formatOrinPrice,
  heroData,
  homeSections,
  menuData,
  orinTheme,
  type HomeSectionData,
  type ProductCardData,
  type SidebarCategory,
  type SidebarCategoryGroup,
  type SidebarCategoryLeaf,
} from "@/lib/orin-home-data";

function useEmbla(options: Parameters<typeof EmblaCarousel>[1], intervalMs?: number) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const emblaRef = useRef<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!viewportRef.current) return;
    const embla = EmblaCarousel(viewportRef.current, options);
    emblaRef.current = embla;
    const onSelect = () => setSelectedIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    const intervalId = intervalMs ? window.setInterval(() => embla.scrollNext(), intervalMs) : undefined;

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      embla.destroy();
      emblaRef.current = null;
    };
  }, [intervalMs, options]);

  return { viewportRef, emblaRef, selectedIndex };
}

function categoryPath(category: SidebarCategory | SidebarCategoryGroup | SidebarCategoryLeaf) {
  return `/categories?category=${encodeURIComponent(category.id)}`;
}

function categoryImage(id: string) {
  return categorySidebarImages[id] ?? categorySidebarImages["mobiles-tablets"];
}

function CategoryTitle({ id, label }: { id: string; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <img src={categoryImage(id)} alt={label} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

function CategorySidebar({ categories }: { categories: SidebarCategory[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? categories[0];
  const selectedGroup = selectedCategory?.children.find((group) => group.id === selectedGroupId) ?? selectedCategory?.children[0];

  function selectCategory(category: SidebarCategory) {
    setSelectedCategoryId(category.id);
    setSelectedGroupId(category.children[0]?.id ?? "");
  }

  return (
    <aside
      className="group/sidebar relative hidden h-100 flex-col overflow-visible rounded-sm border border-slate-200 bg-white shadow-[0_10px_30px_rgba(58,19,91,0.05)] lg:flex"
      onMouseEnter={() => {
        if (!selectedCategoryId && categories[0]) selectCategory(categories[0]);
      }}
    >
      <div className="border-b border-[#f1ecf7] bg-[#fbf7ff] px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8e208c]">All Categories</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {categories.map((category) => {
          const isSelected = selectedCategory?.id === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={`flex min-h-11 w-full items-center justify-between border-b border-slate-200 px-4 text-left text-sm font-semibold transition hover:bg-[#fbf7fb] hover:text-[#b42363] ${isSelected ? "bg-[#fbf7fb] text-[#b42363]" : "text-slate-900"}`}
              onMouseEnter={() => selectCategory(category)}
              onFocus={() => selectCategory(category)}
              onClick={() => selectCategory(category)}
            >
              <CategoryTitle id={category.id} label={category.label} />
              <span className="ml-3 shrink-0 text-current">›</span>
            </button>
          );
        })}
      </div>
      <div className="invisible absolute left-full top-0 z-50 hidden h-full w-140 grid-cols-2 overflow-hidden border border-slate-200 bg-white opacity-0 shadow-[0_16px_40px_rgba(58,19,91,0.12)] transition group-hover/sidebar:visible group-hover/sidebar:grid group-hover/sidebar:opacity-100">
        <div className="h-full overflow-y-auto border-r border-slate-200">
          {selectedCategory?.children.length ? (
            selectedCategory.children.map((group) => {
              const isSelected = selectedGroup?.id === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  className={`flex min-h-11 w-full items-center justify-between border-b border-slate-200 px-4 text-left text-sm font-semibold transition hover:bg-[#fbf7fb] hover:text-[#b42363] ${isSelected ? "bg-[#fbf7fb] text-[#b42363]" : "text-slate-900"}`}
                  onMouseEnter={() => setSelectedGroupId(group.id)}
                  onFocus={() => setSelectedGroupId(group.id)}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <CategoryTitle id={group.id} label={group.label} />
                  <span className="ml-3 shrink-0 text-current">›</span>
                </button>
              );
            })
          ) : (
            <Link href={categoryPath(selectedCategory)} className="flex min-h-11 w-full items-center border-b border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:bg-[#fbf7fb] hover:text-[#b42363]">
              <CategoryTitle id={selectedCategory.id} label={selectedCategory.label} />
            </Link>
          )}
        </div>
        <div className="h-full overflow-y-auto">
          {selectedGroup?.children.length ? (
            selectedGroup.children.map((leaf) => (
              <Link key={leaf.id} href={categoryPath(leaf)} className="flex min-h-11 w-full items-center border-b border-slate-200 px-4 text-sm font-semibold text-slate-900 transition hover:bg-[#fbf7fb] hover:text-[#b42363]">
                <CategoryTitle id={leaf.id} label={leaf.label} />
              </Link>
            ))
          ) : selectedGroup ? (
            <Link href={categoryPath(selectedGroup)} className="flex min-h-11 w-full items-center border-b border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:bg-[#fbf7fb] hover:text-[#b42363]">
              <CategoryTitle id={selectedGroup.id} label={selectedGroup.label} />
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function HeroBanner() {
  const options = useMemo(() => ({ loop: true, align: "start" as const }), []);
  const { viewportRef, emblaRef, selectedIndex } = useEmbla(options, 5000);

  return (
    <section className="relative overflow-hidden">
      <div className="overflow-hidden" ref={viewportRef}>
        <div className="flex">
          {heroData.slides.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
              <a href={slide.href} className="block h-100 bg-[#f8ecf8]">
                <img src={slide.image} alt="" className="block h-full w-full object-cover" />
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3">
        <div className="pointer-events-auto flex gap-2">
          {heroData.slides.map((slide, index) => (
            <button key={slide.id} type="button" aria-label={`Go to slide ${index + 1}`} onClick={() => emblaRef.current?.scrollTo(index)} className={`h-2.5 rounded-full transition ${selectedIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"}`} />
          ))}
        </div>
        <div className="pointer-events-auto hidden gap-2 sm:flex">
          <SliderArrow label="Previous slide" onClick={() => emblaRef.current?.scrollPrev()}>‹</SliderArrow>
          <SliderArrow label="Next slide" onClick={() => emblaRef.current?.scrollNext()}>›</SliderArrow>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, copy, actionHref = "#", centerContent }: { title: string; copy: string; actionHref?: string; centerContent?: React.ReactNode }) {
  return (
    <div className={`${orinTheme.sectionHeader} grid grid-cols-3 justify-between`}>
      <div className="min-w-0">
        <h2 className={orinTheme.sectionTitle}>{title}</h2>
        <p className={orinTheme.sectionCopy}>{copy}</p>
      </div>
      <div>{centerContent ? <div className="hidden items-center justify-center lg:flex">{centerContent}</div> : null}</div>
      <div className="flex items-center justify-end">
        <Link href={actionHref} className={orinTheme.action}>View all</Link>
      </div>
    </div>
  );
}

function SliderArrow({ label, children, onClick }: { label: string; children: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#eadcf1] bg-white text-lg font-semibold text-[#8e208c] transition hover:border-[#8e208c]">
      {children}
    </button>
  );
}

function FeatureHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {heroData.highlights.map((item) => (
        <div key={item.title} className={`${orinTheme.card} px-4 py-4`}>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#8e208c]">{item.title}</div>
          <p className="mt-2 text-sm text-slate-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();

  function addToCart() {
    addItem({
      id: product.backendProductId || product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      original_price: product.originalPrice,
      slug: product.slug,
    });
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden border border-[#efe8f5] bg-white p-2 transition hover:-translate-y-0.5 hover:border-[#dcbde8] hover:shadow-[0_12px_24px_rgba(71,17,92,0.08)] sm:p-3">
      <Link href={product.detailPath || `/product/${product.slug || product.id}/${product.backendProductId || product.id}/`} aria-label={product.name} className="absolute inset-0 z-10" />
      <div className="relative mt-2 aspect-square overflow-hidden lg:mt-3 lg:h-[160px] lg:aspect-auto">
        <span className="absolute left-1.5 top-1.5 z-20 rounded-full bg-[#ffefe8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#f15d22] sm:left-2 sm:top-2 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.12em]">{product.badge}</span>
        <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
      </div>
      <div className="mt-3 flex min-w-0 flex-1 flex-col sm:mt-4">
        {product.subtitle ? <div className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#8e208c]">{product.subtitle}</div> : null}
        <h3 className="mt-1 truncate text-sm font-semibold leading-6 text-slate-700">{product.name}</h3>
        <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:mt-3 sm:gap-2">
          <span className="text-sm font-black text-[#f15d22] sm:text-base">{formatOrinPrice(product.price)}</span>
          <span className="text-[11px] text-slate-400 line-through sm:text-xs">{formatOrinPrice(product.originalPrice)}</span>
        </div>
        <div className="mt-3 flex min-w-0 overflow-hidden rounded-full border border-[#eadcf1]">
          <button type="button" aria-label="Add to cart" onClick={(event) => { event.preventDefault(); addToCart(); }} className="relative z-20 inline-flex h-9 w-9 shrink-0 items-center justify-center border-r border-[#eadcf1] text-lg font-bold text-[#8e208c] transition hover:bg-[#fbf8fe] sm:h-10 sm:w-10">+</button>
          <button type="button" onClick={(event) => { event.preventDefault(); addToCart(); window.location.href = "/checkout"; }} className="relative z-20 min-w-0 flex-1 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8e208c] transition hover:bg-[#fbf8fe] sm:px-4 sm:text-xs sm:tracking-[0.12em]">Buy now</button>
        </div>
      </div>
    </article>
  );
}

function ProductCarouselSection({ title, copy, products, flash }: { title: string; copy: string; products: ProductCardData[]; flash?: boolean }) {
  const options = useMemo(() => ({ loop: !flash, align: "start" as const, dragFree: Boolean(flash) }), [flash]);
  const { viewportRef, emblaRef } = useEmbla(options, flash ? undefined : 3500);
  const [remainingMs, setRemainingMs] = useState(24 * 60 * 60 * 1000);

  useEffect(() => {
    if (!flash) return;
    const key = "orin_flash_sale_ends_at";
    const now = Date.now();
    let endsAt = Number(window.localStorage.getItem(key));
    if (!Number.isFinite(endsAt) || endsAt <= now) {
      endsAt = now + 24 * 60 * 60 * 1000;
      window.localStorage.setItem(key, String(endsAt));
    }
    const tick = () => setRemainingMs(Math.max(0, endsAt - Date.now()));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [flash]);

  const countdown = useMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    return [
      { value: Math.floor(totalSeconds / 86400), label: "days" },
      { value: Math.floor((totalSeconds % 86400) / 3600), label: "hours" },
      { value: Math.floor((totalSeconds % 3600) / 60), label: "minutes" },
      { value: totalSeconds % 60, label: "seconds" },
    ];
  }, [remainingMs]);

  return (
    <section className={orinTheme.card}>
      <SectionHeader
        title={title}
        copy={copy}
        actionHref={flash ? "/product/flash" : "/product/new"}
        centerContent={flash ? (
          <div className="flex items-center gap-1.5">
            {countdown.map((item) => (
              <div key={item.label} className="flex min-w-14 flex-col items-center rounded-xl border border-[#ffd8c8] bg-white px-2 py-1.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <span className="text-lg font-black leading-none text-[#8e208c]">{String(item.value).padStart(2, "0")}</span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#f15d22]">{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      />
      <div className="px-4 pb-4">
        <div className="mb-3 flex justify-end gap-2">
          <SliderArrow label={`Previous ${title}`} onClick={() => emblaRef.current?.scrollPrev()}>‹</SliderArrow>
          <SliderArrow label={`Next ${title}`} onClick={() => emblaRef.current?.scrollNext()}>›</SliderArrow>
        </div>
        <div className="overflow-hidden" ref={viewportRef}>
          <div className="flex gap-3">
            {products.map((product) => (
              <div key={product.id} className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_48%] lg:flex-[0_0_31%] xl:flex-[0_0_15.833%]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  return (
    <section className={orinTheme.card}>
      <SectionHeader title="Top Brands" copy="Trusted picks across electronics, lifestyle, and home." />
      <div className="flex flex-wrap gap-3 p-4">
        {brandNames.map((brand) => (
          <a key={brand} href="#" className="inline-flex min-w-[112px] items-center justify-center rounded-xl border border-[#efe8f5] bg-[#fbf8fe] px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#dcbde8] hover:text-[#8e208c]">{brand}</a>
        ))}
      </div>
    </section>
  );
}

function ProductSection({ section }: { section: HomeSectionData }) {
  return (
    <section className={`${orinTheme.card} overflow-hidden`}>
      <SectionHeader title={section.title} copy={section.accent} />
      <div className="grid min-w-0 grid-cols-1 gap-2 p-2 sm:gap-3 sm:p-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
        {section.products.map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function OrinHomePage() {
  return (
    <main className={`${orinTheme.container} py-5 sm:py-6`}>
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <CategorySidebar categories={menuData.sidebarCategories} />
          <HeroBanner />
        </div>
        <FeatureHighlights />
        <ProductCarouselSection title="Flash Sale" copy="Fast moving handpicked deals from today's campaign." products={flashSaleProducts} flash />
        <ProductCarouselSection title="Featured Products" copy="A compact shelf of recommended products inspired by the reference layout." products={featuredProducts} />
        <BrandStrip />
        {homeSections.map((section) => (
          <ProductSection key={section.id} section={section} />
        ))}
      </div>
    </main>
  );
}
