import { ProductCard } from "@/components/product-card";
import { PageTitle } from "@/components/section";
import { allProducts, findProduct, formatMoney, productComparePrice, productImage, productTitle } from "@/lib/data";
import { AddToCartButton } from "./product-actions";

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = await params;
  const product = findProduct(id);
  const compareAt = productComparePrice(product);
  const related = allProducts().filter((item) => item.id !== product.id).slice(0, 5);

  return (
    <main>
      <PageTitle title={productTitle(product)} description="Product details are rendered from local dummy data. Cart is client-side only." />
      <section className="container grid gap-6 pb-10 lg:grid-cols-2">
        <div className="surface bg-white p-6">
          <img src={productImage(product)} alt={productTitle(product)} className="aspect-square w-full object-contain" />
        </div>
        <div className="surface bg-white p-6">
          <p className="text-sm font-black uppercase text-[var(--brand)]">{product.brand ?? product.badge ?? "Orin"}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{productTitle(product)}</h1>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-black">{formatMoney(product.price, product.currency)}</span>
            {compareAt ? <span className="text-lg font-semibold text-slate-400 line-through">{formatMoney(compareAt, product.currency)}</span> : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Stock: {product.quantity && product.quantity > 0 ? `${product.quantity} available` : product.is_continue_selling ? "Available on backorder" : "Limited availability"}
          </p>
          <AddToCartButton product={product} />
        </div>
      </section>
      <section className="container pb-10">
        <h2 className="mb-3 text-xl font-black">Related Products</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
