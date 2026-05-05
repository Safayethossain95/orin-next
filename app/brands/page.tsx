import Link from "next/link";
import { PageTitle } from "@/components/section";
import { data } from "@/lib/data";

export default function BrandsPage() {
  return (
    <main>
      <PageTitle title="Brands" description="Brand directory rendered from data/catalog-brands.json." />
      <section className="container grid grid-cols-2 gap-3 pb-10 md:grid-cols-4 lg:grid-cols-6">
        {data.brands.brands.map((brand) => (
          <Link key={brand.id} href={`/brand/${brand.id}/${brand.id}`} className="surface flex h-28 flex-col items-center justify-center p-3 text-center font-black" style={{ background: brand.background, color: brand.foreground }}>
            <span>{brand.name}</span>
            <span className="mt-2 text-xs opacity-75">{brand.category}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
