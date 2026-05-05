import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { allProducts, data } from "@/lib/data";

export default async function CollectionDetailsPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id, slug } = await params;
  const collection = data.collections.find((item) => item.id === id || item.slug === slug);
  return (
    <main>
      <PageTitle title={collection?.title ?? "Collection"} description={collection?.offer ?? "Collection products from local dummy data."} />
      <section className="container pb-10">
        <ProductGrid products={(collection?.products.length ? collection.products : allProducts().slice(0, 10))} />
      </section>
    </main>
  );
}
