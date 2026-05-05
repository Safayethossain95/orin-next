import Link from "next/link";
import { PageTitle } from "@/components/section";
import { data } from "@/lib/data";

export default function CollectionsPage() {
  return (
    <main>
      <PageTitle title="Collections" description="Curated collection cards from data/catalog-collections.json." />
      <section className="container grid gap-4 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {data.collections.map((collection) => (
          <Link key={collection.id} href={`/collection/${collection.slug}/${collection.id}`} className="p-5" style={{ background: collection.background, color: collection.foreground }}>
            <p className="text-sm font-black uppercase opacity-80">{collection.subtitle}</p>
            <h2 className="mt-3 text-2xl font-black">{collection.title}</h2>
            <p className="mt-4 font-bold">{collection.offer}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
