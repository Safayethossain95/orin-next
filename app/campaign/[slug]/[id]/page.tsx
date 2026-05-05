import { ProductGrid } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { allProducts, data } from "@/lib/data";

export default async function CampaignDetailsPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id, slug } = await params;
  const campaign = data.campaigns.find((item) => item.id === id || item.slug === slug);
  return (
    <main>
      <PageTitle title={campaign?.title ?? "Campaign"} description={campaign?.offer ?? "Campaign products from local dummy data."} />
      <section className="container pb-10">
        <ProductGrid products={(campaign?.products.length ? campaign.products : allProducts().slice(0, 10))} />
      </section>
    </main>
  );
}
