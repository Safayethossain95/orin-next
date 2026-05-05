import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { allProducts, data, productTitle } from "@/lib/data";

export default async function BrandPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id, slug } = await params;
  const brand = data.brands.brands.find((item) => item.id === id || item.id === slug);
  const products = allProducts().filter((product) => product.brand?.toLowerCase().includes((brand?.name ?? slug).toLowerCase()) || productTitle(product).toLowerCase().includes((brand?.name ?? slug).toLowerCase())).slice(0, 20);
  return (
    <main>
      <PageTitle title={brand?.name ?? "Brand Products"} description={brand ? `Products and offers for ${brand.category}.` : "Brand products from local dummy data."} />
      <section className="container pb-10">
        <ProductGrid products={products.length ? products : allProducts().slice(0, 10)} />
      </section>
    </main>
  );
}
