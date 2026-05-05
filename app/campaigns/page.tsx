import Link from "next/link";
import { PageTitle } from "@/components/section";
import { data } from "@/lib/data";

export default function CampaignsPage() {
  return (
    <main>
      <PageTitle title="Campaigns" description="Active campaign cards from data/catalog-campaigns.json." />
      <section className="container grid gap-4 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {data.campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaign/${campaign.slug}/${campaign.id}`} className="p-5" style={{ background: campaign.background, color: campaign.foreground }}>
            <p className="text-sm font-black uppercase opacity-80">{campaign.subtitle}</p>
            <h2 className="mt-3 text-2xl font-black">{campaign.title}</h2>
            <p className="mt-4 font-bold">{campaign.offer}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
