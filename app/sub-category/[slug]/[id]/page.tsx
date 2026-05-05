import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { data, productsForCategory } from "@/lib/data";

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id, slug } = await params;
  const category = data.categories.sub_categories.find((item) => String(item.id) === id || item.slug === slug);
  return (
    <main>
      <PageTitle title={category?.title ?? "Sub Category Products"} description={category?.description?.replace(/<[^>]*>/g, "") ?? "Products loaded from local data."} />
      <section className="container pb-10">
        <ProductGrid products={productsForCategory(id)} />
      </section>
    </main>
  );
}
