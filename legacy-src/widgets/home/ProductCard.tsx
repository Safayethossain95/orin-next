import { A, useNavigate } from "@solidjs/router";
import { toast } from "../../components/common/Toast";
import type { ProductCardData } from "../../lib/home";
import { formatPrice } from "../../lib/theme";
import { cartStore } from "../../stores/cart-store";

type ProductCardProps = {
  product: ProductCardData;
};

export function ProductCard(props: ProductCardProps) {
  const navigate = useNavigate();
  const productPath = () =>
    props.product.detailPath ||
    `/product/${props.product.slug || props.product.id}/${props.product.backendProductId || props.product.id}/`;

  const addToCart = () => {
    cartStore.getState().addItem({
      id: props.product.backendProductId || props.product.id,
      name: props.product.name,
      image: props.product.image,
      price: props.product.price,
      originalPrice: props.product.originalPrice,
      slug: props.product.slug,
      detailPath: productPath(),
      backendProductId: props.product.backendProductId,
      sku: props.product.sku,
    });
    toast.success(`${props.product.name} added to cart.`);
  };

  return (
    <article class="group relative flex h-full min-w-0 flex-col overflow-hidden border border-[#efe8f5] bg-white p-2 transition hover:-translate-y-0.5 hover:border-[#dcbde8] hover:shadow-[0_12px_24px_rgba(71,17,92,0.08)] sm:p-3">
      <A
        href={productPath()}
        aria-label={props.product.name}
        class="absolute inset-0 z-10"
      />
      <div class="relative mt-2 aspect-square overflow-hidden lg:mt-3 lg:h-[160px] lg:aspect-auto">
        <span class="absolute left-1.5 top-1.5 z-20 rounded-full bg-[#ffefe8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#f15d22] sm:left-2 sm:top-2 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.12em]">
          {props.product.badge}
        </span>
        <img
          src={props.product.image}
          alt={props.product.name}
          class="h-full w-full object-contain"
        />
      </div>

      <div class="mt-3 flex min-w-0 flex-1 flex-col sm:mt-4">
        {props.product.subtitle ? (
          <div class="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#8e208c]">
            {props.product.subtitle}
          </div>
        ) : null}
        <h3 class="mt-1 truncate text-sm font-semibold leading-6 text-slate-700">
          {props.product.name}
        </h3>
        <div class="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:mt-3 sm:gap-2">
          <span class="text-sm font-black text-[#f15d22] sm:text-base">{formatPrice(props.product.price)}</span>
          <span class="text-[11px] text-slate-400 line-through sm:text-xs">
            {formatPrice(props.product.originalPrice)}
          </span>
        </div>
        <div class="mt-3 flex min-w-0 overflow-hidden rounded-full border border-[#eadcf1]">
          <button
            type="button"
            aria-label="Add to cart"
            tabindex="-1"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              addToCart();
            }}
            class="relative z-20 inline-flex h-9 w-9 shrink-0 items-center justify-center border-r border-[#eadcf1] text-lg font-bold text-[#8e208c] transition hover:bg-[#fbf8fe] sm:h-10 sm:w-10"
          >
            +
          </button>
          <button
            type="button"
            tabindex="-1"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              addToCart();
              void navigate("/checkout");
            }}
            class="relative z-20 min-w-0 flex-1 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8e208c] transition hover:bg-[#fbf8fe] sm:px-4 sm:text-xs sm:tracking-[0.12em]"
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}
