import Link from "next/link";
import { data } from "@/lib/data";

export function Footer() {
  const footer = data.footer;

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div>
          <h2 className="text-xl font-black uppercase text-[var(--brand)]">{footer.brand.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{footer.brand.description}</p>
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Popular</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            {footer.popular_links.map((item) => (
              <Link key={item.id} href={item.href}>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Important</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            {footer.important_links.map((item) => (
              <Link key={item.id} href={item.href}>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Contact</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{footer.contact.head_office}</p>
          <p className="text-sm text-slate-600">{footer.contact.phone}</p>
          <p className="text-sm text-slate-600">{footer.contact.email}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs font-semibold text-slate-500">
        Copyright {new Date().getFullYear()} {footer.bottom_bar.copyright_name}
      </div>
    </footer>
  );
}
