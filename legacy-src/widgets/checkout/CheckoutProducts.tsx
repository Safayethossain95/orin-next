import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Icon } from "solid-heroicons";
import { minus, plus, shoppingCart, trash } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import { useI18n } from "../../lib/i18n";
import { formatPrice } from "../../lib/theme";
import type { CartItem } from "../../stores/cart-store";
import { useCartStore } from "../../stores/cart-store";

function resolveProductPath(item: CartItem) {
  if (item.detailPath?.trim()) {
    return item.detailPath;
  }

  const slug = item.slug?.trim() || item.id;
  const id = item.backendProductId?.trim() || item.id;

  return `/product/${encodeURIComponent(slug)}/${encodeURIComponent(id)}/`;
}

export function CheckoutProducts() {
  const { t } = useI18n();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);

  const count = () => items().reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = () =>
    items().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const handleClear = () => {
    clear()();
    toast.success(t("checkout.cartCleared"));
  };
  const handleQuantityChange = (item: CartItem, quantity: number) => {
    setItemQuantity()(item.id, quantity);
    toast.info(
      quantity <= 0
        ? t("checkout.removedFromCart", { name: item.name })
        : t("checkout.cartQuantityUpdated"),
    );
  };
  const handleRemove = (item: CartItem) => {
    removeItem()(item.id);
    toast.success(t("checkout.removedFromCart", { name: item.name }));
  };

  if (!items().length) {
    return (
      <div class="rounded-none border border-slate-200 bg-white px-6 py-14 text-center">
        <Icon
          path={shoppingCart}
          class="mx-auto h-16 w-16 text-slate-300"
          aria-hidden="true"
        />
        <h3 class="mt-4 text-lg font-semibold text-slate-900">{t("checkout.emptyCart")}</h3>
        <p class="mt-2 text-sm text-slate-500">
          {t("checkout.productsAppearHere")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div class="mb-4 flex justify-between rounded-none border border-slate-300 bg-white p-3 text-slate-900 md:mb-6 md:text-lg lg:text-xl">
        <h3>{t("checkout.shoppingBag", { count: count() })}</h3>
        <h3 class="text-right">{t("checkout.total", { amount: formatPrice(subtotal()) })}</h3>
      </div>

      <div class="overflow-hidden rounded-none border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 md:text-base">{t("checkout.cartProducts")}</h3>
            <p class="text-xs text-slate-500">
              {t("checkout.cartProductsHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            class="rounded-none border border-[#d9c2e7] px-3 py-1 text-xs font-medium text-[#8e208c] transition hover:bg-[#faf7fd]"
          >
            {t("checkout.clearAll")}
          </button>
        </div>

        <div class="max-h-[500px] overflow-y-auto bg-white">
          <For each={items()}>
            {(item) => {
              const productPath = () => resolveProductPath(item);

              return (
                <div class="border-b border-slate-200 px-3 py-3 last:border-b-0 md:px-4">
                  <div class="flex items-start gap-3">
                    <A href={productPath()} class="shrink-0">
                      <img
                        class="h-24 w-20 rounded-none object-cover"
                        src={item.image}
                        alt={item.name}
                      />
                    </A>
                    <div class="min-w-0 flex-1">
                      <A href={productPath()}>
                        <h2 class="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-[#8e208c] md:text-base">
                          {item.name}
                        </h2>
                      </A>
                      <p class="mt-1 text-xs text-slate-500 md:text-sm">
                        {t("checkout.sku", { id: item.id })}
                      </p>

                      <div class="mt-2 flex flex-wrap items-center gap-2">
                        <span class="text-base font-semibold text-[#8e208c]">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice > item.price ? (
                          <span class="text-sm text-slate-400 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        ) : null}
                      </div>

                      <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div class="inline-flex items-center rounded-none border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            class="px-3 py-2 text-slate-700 transition hover:text-[#8e208c]"
                          >
                            <Icon path={minus} class="h-4 w-4" aria-hidden="true" />
                          </button>
                          <span class="min-w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            class="px-3 py-2 text-slate-700 transition hover:text-[#8e208c]"
                          >
                            <Icon path={plus} class="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div class="flex items-center gap-3">
                          <p class="text-sm font-semibold text-slate-900 md:text-base">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            class="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-[#8e208c]"
                          >
                            <Icon path={trash} class="h-4 w-4" aria-hidden="true" />
                            {t("checkout.remove")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </>
  );
}
