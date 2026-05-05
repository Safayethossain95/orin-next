import { A, useNavigate, useParams } from "@solidjs/router";
import { Icon } from "solid-heroicons";
import {
  chevronRight,
  clock,
  heart,
  share,
  shoppingCart,
} from "solid-heroicons/outline";
import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import { ApiLoader } from "../components/common/ApiLoader";
import { toast } from "../components/common/Toast";
import { loadMenuData } from "../lib/home";
import {
  loadProductDetails,
  pushRecentlyViewedProduct,
  readRecentlyViewedProducts,
  type ProductDetailsData,
} from "../lib/product";
import { formatPrice, theme } from "../lib/theme";
import { loadUserDashboardData } from "../lib/user-dashboard";
import {
  ensureWishlistLoaded,
  toggleWishlistProduct,
  wishlistProductIds,
  type WishlistProduct,
} from "../lib/user-wishlist";
import { cartStore } from "../stores/cart-store";
import { Footer } from "../widgets/footer/Footer";
import { ProductCard } from "../widgets/home/ProductCard";
import { NavBar } from "../widgets/navbar/NavBar";
import { ProductReviews } from "../widgets/product/ProductReviews";

const menu = loadMenuData();
const dashboardData = loadUserDashboardData();

export function ProductDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const wishlistIds = wishlistProductIds(dashboardData.wishlist);
  const [product, setProduct] = createSignal<ProductDetailsData | null>(null);
  const [selectedImage, setSelectedImage] = createSignal(0);
  const [selectedQuantity, setSelectedQuantity] = createSignal(1);
  const [recentlyViewed, setRecentlyViewed] = createSignal(
    readRecentlyViewedProducts(),
  );
  const [loading, setLoading] = createSignal(true);
  const [showReviews, setShowReviews] = createSignal(false);

  const primaryImage = createMemo(
    () => product()?.gallery[selectedImage()] ?? product()?.gallery[0],
  );

  const discountPercent = createMemo(() => {
    const current = product();
    if (!current || current.originalPrice <= current.price || current.originalPrice <= 0) {
      return 0;
    }

    return Math.round(
      ((current.originalPrice - current.price) / current.originalPrice) * 100,
    );
  });
  const isFavorite = createMemo(() => {
    const current = product();

    return current ? wishlistIds().includes(current.id) : false;
  });
  const maxQuantity = createMemo(() => Math.max(1, product()?.stock ?? 1));

  const decreaseQuantity = () => {
    setSelectedQuantity((quantity) => Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    setSelectedQuantity((quantity) => Math.min(maxQuantity(), quantity + 1));
  };

  const addToCart = () => {
    const current = product();
    if (!current) {
      return;
    }

    const cart = cartStore.getState();
    const cartItem = {
      id: current.id,
      name: current.title,
      image: current.gallery[0]?.url || "",
      price: current.price,
      originalPrice: current.originalPrice,
      slug: current.slug,
      detailPath: `/product/${current.slug}/${current.id}/`,
      backendProductId: current.id,
      sku: current.sku,
    };

    for (let count = 0; count < selectedQuantity(); count += 1) {
      cart.addItem(cartItem);
    }

    toast.success(`${selectedQuantity()} ${current.title} added to cart.`);
  };

  const toggleFavorite = () => {
    const current = product();

    if (!current) {
      return;
    }

    const wishlistProduct: WishlistProduct = {
      id: current.id,
      product_id: current.id,
      slug: current.slug,
      backendProductId: current.id,
      detailPath: `/product/${current.slug}/${current.id}/`,
      name: current.title,
      price: current.price,
      original_price: current.originalPrice,
      image: current.gallery[0]?.url || "",
    };
    const wasFavorite = isFavorite();

    toggleWishlistProduct(current.id, dashboardData.wishlist, wishlistProduct);
    toast.success(
      wasFavorite
        ? `${current.title} removed from wishlist.`
        : `${current.title} added to wishlist.`,
    );
  };

  ensureWishlistLoaded(dashboardData.wishlist);

  createEffect(() => {
    const slug = params.slug;
    const id = params.id;

    void (async () => {
      setLoading(true);
      const nextProduct = await loadProductDetails(slug, id);
      setProduct(nextProduct);
      setSelectedImage(0);
      setSelectedQuantity(1);
      setShowReviews(false);
      setLoading(false);
    })();
  });

  createEffect(() => {
    const current = product();
    if (!current) {
      return;
    }

    pushRecentlyViewedProduct(current);
    setRecentlyViewed(readRecentlyViewedProducts(current.id));
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class={`${theme.container} py-4 pb-16 md:py-6`}>
        <Show
          when={!loading() && product()}
          fallback={
            <Show
              when={!loading()}
              fallback={
                <ApiLoader
                  title="Loading product..."
                  copy="Fetching the latest product details."
                />
              }
            >
              <div class="border border-slate-200 bg-white px-6 py-16 text-center">
                <p class="text-base font-medium text-slate-900">
                  Product not found
                </p>
                <A
                  href="/"
                  class="mt-5 inline-flex items-center justify-center bg-[#8e208c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741972]"
                >
                  Back to homepage
                </A>
              </div>
            </Show>
          }
        >
          {(item) => (
            <div class="space-y-6">
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <A href="/" class="transition hover:text-[#8e208c]">
                  Home
                </A>
                <Icon path={chevronRight} class="h-3.5 w-3.5" aria-hidden="true" />
                <span>{item().categoryName}</span>
                <Icon path={chevronRight} class="h-3.5 w-3.5" aria-hidden="true" />
                <span class="text-slate-700">{item().title}</span>
              </div>

              <section class="border border-slate-200 bg-white p-3 sm:p-4 lg:p-5">
                <div class="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_280px]">
                  <div class="space-y-3">
                    <div class="border border-slate-200 bg-[#fbfbfd]">
                      <img
                        src={primaryImage()?.url}
                        alt={primaryImage()?.alt || item().title}
                        class="h-[320px] w-full object-contain sm:h-[420px] lg:h-[520px]"
                      />
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <For each={item().gallery}>
                        {(image, index) => (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(index())}
                            class={`border p-1 transition ${
                              selectedImage() === index()
                                ? "border-[#8e208c] ring-1 ring-[#8e208c]"
                                : "border-slate-200 hover:border-[#d9c2e7]"
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={image.alt}
                              class="h-16 w-16 object-cover sm:h-20 sm:w-20"
                            />
                          </button>
                        )}
                      </For>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <h1 class="text-2xl font-semibold leading-tight text-slate-900">
                        {item().title}
                      </h1>
                      <Show when={item().subtitle}>
                        <p class="mt-2 text-sm text-slate-500">{item().subtitle}</p>
                      </Show>
                    </div>

                    <div class="border-l-2 border-[#ff6b57] pl-4 text-sm text-slate-600">
                      <div class="grid gap-2 sm:grid-cols-2">
                        <p>
                          <span class="text-slate-400">Category:</span>{" "}
                          <span class="text-[#ff6b57]">{item().categoryName}</span>
                        </p>
                        <p>
                          <span class="text-slate-400">Brand:</span>{" "}
                          <span>{item().brandName}</span>
                        </p>
                        <p>
                          <span class="text-slate-400">Stock:</span>{" "}
                          <span
                            class={
                              item().stock > 0 ? "text-[#ff6b57]" : "text-rose-500"
                            }
                          >
                            {item().stock}
                          </span>
                        </p>
                        <p>
                          <span class="text-slate-400">SKU:</span>{" "}
                          <span class="text-[#ff6b57]">{item().sku}</span>
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-end gap-3">
                      <span class="text-3xl font-black text-[#ff5a36]">
                        {formatPrice(item().price)}
                      </span>
                      <Show when={item().originalPrice > item().price}>
                        <span class="text-base text-slate-400 line-through">
                          {formatPrice(item().originalPrice)}
                        </span>
                      </Show>
                      <Show when={discountPercent() > 0}>
                        <span class="bg-[#fff1ec] px-2 py-1 text-xs font-bold text-[#ff5a36]">
                          {discountPercent()}% OFF
                        </span>
                      </Show>
                    </div>

                    <div class="py-3">
                      <div class="inline-flex h-10 overflow-hidden border border-slate-300 bg-white text-sm font-semibold text-slate-800">
                        <button
                          type="button"
                          onClick={decreaseQuantity}
                          disabled={selectedQuantity() <= 1}
                          aria-label="Decrease quantity"
                          class="flex w-11 items-center justify-center border-r border-slate-300 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        >
                          -
                        </button>
                        <span class="flex w-12 items-center justify-center border-r border-slate-300">
                          {selectedQuantity()}
                        </span>
                        <button
                          type="button"
                          onClick={increaseQuantity}
                          disabled={selectedQuantity() >= maxQuantity()}
                          aria-label="Increase quantity"
                          class="flex w-11 items-center justify-center transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={addToCart}
                        class="inline-flex items-center justify-center gap-2 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                      >
                        <Icon path={shoppingCart} class="h-4 w-4" aria-hidden="true" />
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart();
                          void navigate("/checkout");
                        }}
                        class="inline-flex items-center justify-center gap-2 bg-[#8e208c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#741972]"
                      >
                        <Icon path={shoppingCart} class="h-4 w-4" aria-hidden="true" />
                        Buy now
                      </button>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm text-slate-400">
                      <button
                        type="button"
                        aria-pressed={isFavorite()}
                        onClick={toggleFavorite}
                        class={`inline-flex items-center gap-1.5 px-2 py-1 transition ${
                          isFavorite()
                            ? "bg-[#8e208c]/10 text-[#8e208c]"
                            : "hover:text-[#8e208c]"
                        }`}
                      >
                        <Icon
                          path={heart}
                          class={`h-4 w-4 ${isFavorite() ? "fill-current" : ""}`}
                          aria-hidden="true"
                        />
                        {isFavorite() ? "Added to favorite list" : "Add to favorite list"}
                      </button>
                      <div class="inline-flex items-center gap-2">
                        <span>Share:</span>
                        <button
                          type="button"
                          class="transition hover:text-[#8e208c]"
                        >
                          <Icon path={share} class="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div class="border border-slate-200 bg-[#fffef7] px-4 py-3">
                      <div class="flex items-center justify-between gap-3">
                        <div>
                          <p class="text-sm font-medium text-slate-700">
                            Affiliate commission
                          </p>
                          <p class="text-xs text-slate-400">
                            Earn on product referrals
                          </p>
                        </div>
                        <span class="bg-[#fff0a8] px-4 py-1.5 text-sm font-semibold text-slate-700">
                          Earn
                        </span>
                      </div>
                    </div>

                    <div class="space-y-2 text-sm leading-6 text-slate-700">
                      <For each={item().features}>
                        {(feature) => <p>{feature}</p>}
                      </For>
                    </div>
                  </div>

                  <div class="border border-slate-200 bg-[#fbfbfd] p-3">
                    <div class="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <h2 class="text-base font-semibold text-slate-900">
                          Recently Viewed
                        </h2>
                        <p class="text-xs text-slate-400">
                          Items you checked out recently
                        </p>
                      </div>
                      <Icon path={clock} class="h-4 w-4 text-[#8e208c]" aria-hidden="true" />
                    </div>

                    <div class="space-y-3">
                      <Show
                        when={recentlyViewed().length > 0}
                        fallback={
                          <p class="text-sm text-slate-400">
                            No recently viewed products yet.
                          </p>
                        }
                      >
                        <For each={recentlyViewed().slice(0, 4)}>
                          {(recent) => (
                            <A
                              href={recent.detailPath || "#"}
                              class="flex gap-3 border border-slate-200 bg-white p-2 transition hover:border-[#d9c2e7]"
                            >
                              <img
                                src={recent.image}
                                alt={recent.name}
                                class="h-16 w-16 object-cover"
                              />
                              <div class="min-w-0 flex-1">
                                <p class="line-clamp-2 text-sm font-medium text-slate-800">
                                  {recent.name}
                                </p>
                                <p class="mt-1 text-sm font-semibold text-slate-900">
                                  {formatPrice(recent.price)}
                                </p>
                              </div>
                            </A>
                          )}
                        </For>
                      </Show>
                    </div>
                  </div>
                </div>

                <div class="mt-6 border-t border-slate-100 pt-5">
                  <h2 class="text-lg font-semibold text-slate-900">
                    Product overview
                  </h2>
                  <p class="mt-3 max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600">
                    {item().description}
                  </p>
                </div>

                <div class="mt-6 flex justify-center border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowReviews((value) => !value)}
                    class="inline-flex items-center justify-center rounded-sm bg-[#8e208c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741972]"
                  >
                    {showReviews() ? "Hide review" : "Show review"}
                  </button>
                </div>

                <Show when={showReviews()}>
                  <ProductReviews productId={item().id} />
                </Show>
              </section>

              <section class="space-y-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-slate-900">
                    Related Products
                  </h2>
                  <p class="text-sm text-slate-500">
                    More picks from the same product flow
                  </p>
                </div>
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  <For each={item().relatedProducts}>
                    {(related) => <ProductCard product={related} />}
                  </For>
                </div>
              </section>
            </div>
          )}
        </Show>
      </main>

      <Footer />
    </div>
  );
}
