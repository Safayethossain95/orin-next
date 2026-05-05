import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { data } from "@/lib/data";

export default function NewProductPage() {
  return (
    <main>
      <PageTitle title="New Products" description="Fresh local products rendered from data/new-products.json." />
      <section className="container pb-10">
        <ProductGrid products={data.newProducts} />
      </section>
    </main>
  );
}
