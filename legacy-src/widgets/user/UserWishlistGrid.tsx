import { A, useNavigate } from "@solidjs/router";
import { For, onMount, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { plus, xMark } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import { formatPrice } from "../../lib/theme";
import type { loadUserDashboardData } from "../../lib/user-dashboard";
import {
  ensureWishlistLoaded,
  toggleWishlistProduct,
  wishlistProducts,
} from "../../lib/user-wishlist";
import { cartStore } from "../../stores/cart-store";

type DashboardData = ReturnType<typeof loadUserDashboardData>;

function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function UserWishlistGrid(props: { data: DashboardData }) {
  const navigate = useNavigate();
  const savedWishlistProducts = wishlistProducts(props.data.wishlist);

  onMount(() => {
    ensureWishlistLoaded(props.data.wishlist);
  });

  const productPath = (product: DashboardData["wishlist"][number]) => {
    if (product.detailPath?.trim()) {
      return product.detailPath;
    }

    const slug = product.slug?.trim() || slugifyProductName(product.name) || product.id;
    const productId = product.backendProductId || product.product_id || product.id;

    return `/product/${slug}/${productId}/`;
  };

  const addToCart = (product: DashboardData["wishlist"][number]) => {
    cartStore.getState().addItem({
      id: product.backendProductId || product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.original_price,
      slug: product.slug,
      detailPath: productPath(product),
      backendProductId: product.backendProductId,
    });
    toast.success(`${product.name} added to cart.`);
  };

  const removeFromWishlist = (product: DashboardData["wishlist"][number]) => {
    toggleWishlistProduct(product.id, props.data.wishlist);
    toast.success(`${product.name} removed from wishlist.`);
  };

  return (
    <div>
      <div class="flex w-full items-center justify-between">
        <div class="w-full sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Wishlist</h1>
          <p class="mt-2 text-sm text-gray-700">
            Manage payments: receiveable, received, processing in your Reseller Dashboard.
          </p>
        </div>
      </div>

      <div class="mx-auto mt-4 w-full">
        <div class="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
          <For each={savedWishlistProducts()}>
            {(product) => (
              <article class="relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-sm bg-white border border-gray-100">
                <A
                  href={productPath(product)}
                  aria-label={product.name}
                  class="absolute inset-0 z-10"
                />
                <button
                  type="button"
                  class="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-[#8e208c]"
                  aria-label="Remove from wishlist"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFromWishlist(product);
                  }}
                >
                  <Icon path={xMark} class="h-5 w-5" aria-hidden="true" />
                </button>
                <div class="p-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    class="aspect-square w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div class="px-3">
                  <div class="py-1">
                    <span class="text-base font-semibold text-[#fc5230]">
                      {formatPrice(product.price)}
                    </span>
                    <span class="relative ml-2 text-xs text-gray-900 after:absolute after:right-0 after:top-[7px] after:block after:h-px after:w-full after:-rotate-3 after:bg-[#fc5230]">
                      {formatPrice(product.original_price)}
                    </span>
                  </div>
                  <h2 class="line-clamp-2 min-h-10 text-sm font-normal leading-5 text-gray-900">
                    {product.name}
                  </h2>
                </div>
                <div class="mx-3 mb-3 mt-2 flex items-center rounded-sm border border-gray-50 bg-[#8e208c]/10 text-gray-700">
                  <button
                    type="button"
                    class="relative z-20 flex h-10 w-12 items-center justify-center border-r border-gray-50"
                    aria-label="Add to cart"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    <Icon path={plus} class="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="relative z-20 flex-1 py-2 text-center text-sm font-medium"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(product);
                      void navigate("/checkout");
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </article>
            )}
          </For>
        </div>
        <Show when={savedWishlistProducts().length === 0}>
          <div class="mt-5 rounded-sm border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <h2 class="text-lg font-semibold text-gray-900">Your wishlist is empty</h2>
            <p class="mt-2 text-sm text-gray-600">Save products to keep them available here.</p>
            <A
              href="/"
              class="mt-5 inline-flex rounded-sm bg-[#8e208c] px-5 py-2 text-sm font-semibold text-white!"
            >
              Browse products
            </A>
          </div>
        </Show>
      </div>
    </div>
  );
}
