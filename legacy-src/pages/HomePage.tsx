import { For, createSignal, onMount } from "solid-js";
import {
  loadBrandNames,
  loadDynamicHomeSections,
  loadFlashSaleProducts,
  loadFeaturedProducts,
  loadHeroData,
  loadHomeSections,
  loadMenuData,
} from "../lib/home";
import { theme } from "../lib/theme";
import { Footer } from "../widgets/footer/Footer";
import { BrandStrip } from "../widgets/home/BrandStrip";
import { CategorySidebar } from "../widgets/home/CategorySidebar";
import { FeatureHighlights } from "../widgets/home/FeatureHighlights";
import { FeaturedProductsSection } from "../widgets/home/FeaturedProductsSection";
import { FlashSaleSection } from "../widgets/home/FlashSaleSection";
import { HeroBanner } from "../widgets/home/HeroBanner";
import { ProductSection } from "../widgets/home/ProductSection";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const hero = loadHeroData();
const flashSaleProducts = loadFlashSaleProducts();
const featuredProducts = loadFeaturedProducts();
const brands = loadBrandNames();
const initialSections = loadHomeSections();

export function HomePage() {
  const [sections, setSections] = createSignal(initialSections);

  onMount(() => {
    void loadDynamicHomeSections().then((nextSections) => {
      setSections(nextSections);
    });
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class={`${theme.container} py-5 sm:py-6`}>
        <div class="flex flex-col gap-5">
          <div class="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <CategorySidebar categories={menu.sidebarCategories} />
            <HeroBanner slides={hero.slides} />
          </div>

          <FeatureHighlights items={hero.highlights} />
          <FlashSaleSection deals={flashSaleProducts} />
          <FeaturedProductsSection products={featuredProducts} />
          <BrandStrip brands={brands} />

          <For each={sections()}>{(section) => <ProductSection section={section} />}</For>
        </div>
      </main>

      <Footer />
    </div>
  );
}
