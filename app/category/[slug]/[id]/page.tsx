import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { data, productsForCategory } from "@/lib/data";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id, slug } = await params;
  const category = data.categories.categories.find((item) => String(item.id) === id || item.slug === slug);
  const products = productsForCategory(id);
  return (
    <main>
      <PageTitle title={category?.title ?? "Category Products"} description={category?.description?.replace(/<[^>]*>/g, "") ?? "Products loaded from local category data."} />
      <section className="container pb-10">
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
