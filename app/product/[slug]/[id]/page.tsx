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
      <section className="container mx-auto grid gap-8 pb-16 lg:grid-cols-12 lg:items-start lg:pt-10">
  
  {/* Left Column: Image Gallery/Main Image - Taking 7/12 of the width */}
  <div className="lg:col-span-7">
    <div className="relative overflow-hidden rounded-3xl bg-[#f9fafb] p-8 transition-all hover:shadow-inner lg:sticky lg:top-10">
      <img 
        src={productImage(product)} 
        alt={productTitle(product)} 
        className="aspect-square w-full mix-blend-multiply object-contain transition-transform duration-500 hover:scale-105" 
      />
      {/* Decorative Badge if it exists */}
      {product.badge && (
        <span className="absolute left-6 top-6 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-900 backdrop-blur-md shadow-sm border border-slate-100">
          {product.badge}
        </span>
      )}
    </div>
  </div>

  {/* Right Column: Product Info - Taking 5/12 of the width */}
  <div className="flex flex-col lg:col-span-5 lg:pl-4">
    
    {/* Brand & Category */}
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand)] opacity-80">
        {product.brand ?? "Orin"}
      </span>
      <span className="h-px w-8 bg-slate-200"></span>
    </div>

    {/* Title - Reduced from 3xl to 2xl for elegance */}
    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
      {productTitle(product)}
    </h1>

    {/* Price & Discount Section */}
    <div className="mt-6 flex items-center gap-4">
      <span className="text-2xl font-medium tracking-tight text-slate-950">
        {formatMoney(product.price, product.currency)}
      </span>
      {compareAt && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400 line-through">
            {formatMoney(compareAt, product.currency)}
          </span>
          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
            {Math.round(((compareAt - product.price) / compareAt) * 100)}% OFF
          </span>
        </div>
      )}
    </div>

    {/* Stock Indicator - More visual than plain text */}
    <div className="mt-8 flex items-center gap-3 border-y border-slate-100 py-4">
      <div className={`h-2 w-2 rounded-full ${product.quantity > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {product.quantity && product.quantity > 0 
          ? `${product.quantity} units in stock` 
          : product.is_continue_selling 
          ? "Backorder: Ships in 1-2 weeks" 
          : "Limited Availability"}
      </p>
    </div>

    {/* Actions */}
    <div className="mt-8 flex flex-col gap-4">
      <AddToCartButton product={product} className="h-14 rounded-2xl bg-slate-950 text-white transition-all hover:bg-slate-800 active:scale-[0.98]" />
      
      <p className="text-center text-[11px] text-slate-400">
        Free shipping on orders over \$150 • Secure Checkout
      </p>
    </div>

    {/* Optional: Short Micro-Description */}
    <div className="mt-10">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Description</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Experience premium quality with the {productTitle(product)}. Engineered for comfort and designed for the modern lifestyle.
      </p>
    </div>

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
