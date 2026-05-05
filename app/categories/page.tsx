import Link from "next/link";
import { PageTitle } from "@/components/section";
import { data } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <main>
      <PageTitle title="All Categories" description="Browse every category, subcategory and child category from local dummy data." />
      <section className="container grid gap-4 pb-10 md:grid-cols-2 lg:grid-cols-3">
        {data.categories.categories.map((category) => {
          const children = data.categories.sub_categories.filter((item) => item.category_id === category.id);
          return (
            <article key={category.id} className="surface bg-white p-5">
              <Link href={`/category/${category.slug}/${category.id}`} className="text-lg font-black text-slate-950 hover:text-[var(--brand)]">
                {category.title}
              </Link>
              <div className="mt-4 grid gap-2">
                {children.map((child) => (
                  <Link key={child.id} href={`/sub-category/${child.slug}/${child.id}`} className="text-sm font-semibold text-slate-600 hover:text-[var(--brand)]">
                    {child.title}
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
