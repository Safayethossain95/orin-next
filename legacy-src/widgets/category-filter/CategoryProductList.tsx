import { A, useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { plus } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import type { CategoryFilterProduct } from "../../lib/categories";
import { formatPrice, theme } from "../../lib/theme";
import { cartStore } from "../../stores/cart-store";

type CategoryProductListProps = {
  products: CategoryFilterProduct[];
  gridClass?: string;
};

const filterTheme = theme.categoryFilter;

function getDiscount(product: CategoryFilterProduct) {
  if (product.comparePrice <= product.price || product.comparePrice <= 0) {
    return 0;
  }

  return ((product.comparePrice - product.price) / product.comparePrice) * 100;
}

export function CategoryProductList(props: CategoryProductListProps) {
  return (
    <Show
      when={props.products.length > 0}
      fallback={
        <div class={filterTheme.empty}>
          <div class="mb-4 h-16 w-16 rounded-sm border border-gray-200 bg-gray-100" />
          <h2 class="text-2xl font-bold text-gray-800">
            No Products Available
          </h2>
          <p class="mt-2 max-w-md text-gray-500">
            It looks like we do not have any items listed yet. Check back later
            or explore other categories.
          </p>
          <A
            href="/"
            class="mt-6 rounded-sm bg-[#8e208c] px-5 py-2.5 text-sm font-medium !text-white transition hover:opacity-90"
          >
            Go Back to Home
          </A>
        </div>
      }
    >
      <div class={props.gridClass ?? filterTheme.productGrid}>
        <For each={props.products}>
          {(product) => <CategoryProductCard product={product} />}
        </For>
      </div>
    </Show>
  );
}

function CategoryProductCard(props: { product: CategoryFilterProduct }) {
  const navigate = useNavigate();
  const discount = () => getDiscount(props.product);

  const addToCart = () => {
    cartStore.getState().addItem({
      id: props.product.hid,
      name: props.product.title,
      image: props.product.thumbnail,
      price: props.product.price,
      originalPrice: props.product.comparePrice,
      slug: props.product.slug,
      detailPath: props.product.detailPath,
      backendProductId: props.product.hid,
    });
    toast.success(`${props.product.title} added to cart.`);
  };

  return (
    <article class={filterTheme.productCard}>
      <A href={props.product.detailPath} class="overflow-hidden">
        <div class={filterTheme.productImageWrap}>
          <div class="flex justify-center">
            <img
              src={props.product.thumbnail}
              alt={props.product.title}
              class={filterTheme.productImage}
              loading="lazy"
            />
          </div>
          <Show when={discount() > 0}>
            <span class="absolute bottom-2 left-2 -rotate-3 rounded bg-[#fc5230] px-1 py-[1px] text-xs font-semibold text-white">
              {discount().toFixed(1)}%
            </span>
          </Show>
        </div>

        <div class="px-3">
          <div class="py-1">
            <span class={filterTheme.productPrice}>
              {formatPrice(props.product.price)}
            </span>
            <Show when={props.product.comparePrice > props.product.price}>
              <span class={filterTheme.productCompare}>
                {formatPrice(props.product.comparePrice)}
              </span>
            </Show>
          </div>
          <h2 class={filterTheme.productTitle}>{props.product.title}</h2>
          <Show when={props.product.rating > 2}>
            <div class="mb-2 mt-1 flex items-center text-xs md:mt-2">
              <span class="rounded-sm bg-yellow-100 px-1.5 py-0.5 font-semibold text-yellow-700">
                {props.product.rating.toFixed(1)}
              </span>
              <p class="ms-1 text-xs font-medium text-gray-900">
                ({props.product.ratingTotal})
              </p>
            </div>
          </Show>
        </div>
      </A>

      <div>
        <Show
          when={props.product.quantity > 0 || props.product.isContinueSelling}
          fallback={
            <div class="mx-3 mb-3 mt-2 flex items-center rounded-sm bg-white text-gray-700 shadow-sm">
              <button
                type="button"
                disabled
                class="w-full cursor-not-allowed truncate rounded-sm px-3 py-2 text-xs font-normal text-[#fc5230] opacity-75"
              >
                Stock Out
              </button>
            </div>
          }
        >
          <div class="mx-2.5 mb-2.5 mt-2 sm:mx-3 sm:mb-3">
            <div class={filterTheme.productActions}>
              <button
                type="button"
                aria-label="Add to cart"
                class={`${filterTheme.productIconButton} border-r`}
                onClick={addToCart}
              >
                <Icon path={plus} class="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                type="button"
                class={filterTheme.productBuyButton}
                onClick={() => {
                  addToCart();
                  void navigate("/checkout");
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </Show>
      </div>
    </article>
  );
}
