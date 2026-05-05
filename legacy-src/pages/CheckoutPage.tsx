import { A } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { shoppingCart } from "solid-heroicons/outline";
import { loadMenuData } from "../lib/home";
import { useI18n } from "../lib/i18n";
import { theme } from "../lib/theme";
import { useCartStore } from "../stores/cart-store";
import { checkoutStore, useCheckoutStore } from "../stores/checkout-store";
import { Footer } from "../widgets/footer/Footer";
import { AddressForm } from "../widgets/checkout/AddressForm";
import { CheckoutProducts } from "../widgets/checkout/CheckoutProducts";
import { CheckoutSummary } from "../widgets/checkout/CheckoutSummary";
import { CouponCard } from "../widgets/checkout/CouponCard";
import { PaymentOptions } from "../widgets/checkout/PaymentOptions";
import { ShippingOptions } from "../widgets/checkout/ShippingOptions";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();

export function CheckoutPage() {
  const { t } = useI18n();
  const items = useCartStore((state) => state.items);
  const step = useCheckoutStore((state) => state.step);
  const submitAttempted = useCheckoutStore((state) => state.submitAttempted);

  onMount(() => {
    checkoutStore.getState().resetForCheckout();
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class={`${theme.container} py-4 pb-16 md:py-6`}>
        <Show
          when={items().length > 0}
          fallback={
            <div class="rounded-none border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <Icon
                path={shoppingCart}
                class="mx-auto h-14 w-14 text-slate-300"
                aria-hidden="true"
              />
              <h2 class="mt-4 text-2xl font-semibold text-slate-900">
                {t("checkout.emptyCart")}
              </h2>
              <p class="mt-3 text-sm text-slate-500">
                {t("checkout.emptyCartDescription")}
              </p>
              <A
                href="/"
                class="mt-6 inline-flex items-center justify-center rounded-none bg-[#8e208c] px-5 py-2.5 text-sm font-semibold text-white! transition hover:bg-[#741972] hover:!text-white"
              >
                {t("checkout.browseProducts")}
              </A>
            </div>
          }
        >
          <div class="flex flex-col gap-4 md:gap-6 lg:flex-row">
            <div class="lg:w-3/5">
              {step() === 1 ? (
                <CheckoutProducts />
              ) : (
                <>
                  <ShippingOptions />
                  <div class="mt-4">
                    <PaymentOptions />
                  </div>
                </>
              )}
            </div>

            <div class="lg:w-2/5">
              {step() === 2 ? (
                <CouponCard />
              ) : (
                <AddressForm submitAttempted={submitAttempted()} />
              )}

              <CheckoutSummary />
            </div>
          </div>
        </Show>
      </main>

      <Footer />
    </div>
  );
}
