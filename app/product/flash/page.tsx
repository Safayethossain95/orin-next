import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { data } from "@/lib/data";

export default function FlashProductPage() {
  return (
    <main>
      <PageTitle title="Flash Sale" description="Limited-time products rendered from data/flash-sale-products.json." />
      <section className="container pb-10">
        <ProductGrid products={data.flashProducts} />
      </section>
    </main>
  );
}
