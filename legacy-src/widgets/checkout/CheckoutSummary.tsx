import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal } from "solid-js";
import { Icon } from "solid-heroicons";
import { arrowLeft } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import { submitCheckout } from "../../lib/guest-checkout";
import { useI18n } from "../../lib/i18n";
import { formatPrice } from "../../lib/theme";
import { useCartStore } from "../../stores/cart-store";
import { checkoutStore, useCheckoutStore } from "../../stores/checkout-store";
import { useSiteConfigStore } from "../../stores/site-config-store";

export function CheckoutSummary() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const step = useCheckoutStore((state) => state.step);
  const setStep = useCheckoutStore((state) => state.setStep);
  const address = useCheckoutStore((state) => state.address);
  const shipping = useCheckoutStore((state) => state.shipping);
  const payment = useCheckoutStore((state) => state.payment);
  const discount = useCheckoutStore((state) => state.discount);
  const siteName = useSiteConfigStore((state) => state.siteName);
  const setSubmitAttempted = useCheckoutStore((state) => state.setSubmitAttempted);
  const isAddressValid = useCheckoutStore((state) => state.isAddressValid);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [acceptedTerms, setAcceptedTerms] = createSignal(true);

  const subtotal = createMemo(() =>
    items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const shippingCharge = createMemo(() => shipping()?.charge ?? 0);
  const payable = createMemo(() =>
    Math.max(0, subtotal() + shippingCharge() - discount()),
  );
  const savedAmount = createMemo(() =>
    items().reduce(
      (sum, item) =>
        sum + Math.max(0, item.originalPrice - item.price) * item.quantity,
      0,
    ),
  );

  const validateStepOne = () => items().length > 0 && isAddressValid();
  const validateStepTwo = () => Boolean(shipping() && payment());

  const handlePrimaryAction = async () => {
    setErrorMessage("");

    if (step() === 1) {
      if (!validateStepOne()) {
        setSubmitAttempted()(true);
        setErrorMessage(t("checkout.requiredAddress"));
        toast.error(t("checkout.requiredAddress"));
        return;
      }
      setSubmitAttempted()(false);
      setStep()(2);
      toast.info(t("checkout.optionsReady"));
      return;
    }

    if (!validateStepTwo()) {
      setErrorMessage(t("checkout.shippingPaymentRequired"));
      toast.error(t("checkout.shippingPaymentRequired"));
      return;
    }

    const selectedShipping = shipping();
    const selectedPayment = payment();

    if (!selectedShipping || !selectedPayment) {
      setErrorMessage(t("checkout.shippingPaymentRequired"));
      toast.error(t("checkout.shippingPaymentRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitCheckout({
        cart: items(),
        address: address(),
        shipping: selectedShipping,
        payment: selectedPayment,
        promoCode: checkoutStore.getState().promoCode,
        discount: discount(),
      });

      if (!response?.success || !response.checkout) {
        throw new Error(response?.message || t("checkout.submitFailed"));
      }

      if (response.checkout.nextActionUrl && typeof window !== "undefined") {
        window.location.assign(response.checkout.nextActionUrl);
        return;
      }

      clearCart()();
      checkoutStore.getState().resetForCheckout();
      toast.success(t("checkout.orderSubmitted"));
      void navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("checkout.submitFailed");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="sticky top-6 mb-5 rounded-none border border-slate-200 bg-white p-4 md:mb-0">
      <div class="rounded-none border border-slate-200 bg-slate-50/80 p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-900">{t("checkout.summary")}</p>
          <span class="rounded-none bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            {t("checkout.step", { step: step() })}
          </span>
        </div>
      </div>

      <div class="mt-4 space-y-3 text-sm">
        <div class="flex items-center justify-between text-slate-600">
          <span>{t("checkout.subTotal")}</span>
          <span class="font-medium text-slate-900">{formatPrice(subtotal())}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span>{t("checkout.deliveryCharge")}</span>
          <span class="font-medium text-slate-900">
            {shipping() ? formatPrice(shippingCharge()) : t("checkout.selectShipping")}
          </span>
        </div>
        {discount() > 0 ? (
          <div class="flex items-center justify-between text-emerald-700">
            <span>{t("checkout.discount")}</span>
            <span class="font-medium">- {formatPrice(discount())}</span>
          </div>
        ) : null}
        <div class="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-base font-semibold text-slate-900">
          <span>{t("checkout.payable")}</span>
          <span>{formatPrice(payable())}</span>
        </div>
      </div>

      {savedAmount() > 0 ? (
        <div class="mt-4 rounded-none bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {t("checkout.saving", { amount: formatPrice(savedAmount()) })}
        </div>
      ) : null}

      {step() === 2 ? (
        <div class="mt-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep()(1)}
              class="flex h-10 w-14 items-center justify-center rounded-none bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label={t("checkout.goBackAddress")}
            >
              <Icon path={arrowLeft} class="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={isSubmitting() || !acceptedTerms()}
              onClick={() => void handlePrimaryAction()}
              class="flex h-10 flex-1 items-center justify-center rounded-none bg-[#8e208c] text-sm font-medium text-white transition hover:bg-[#741972] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting()
                ? t("checkout.submitting")
                : t("checkout.confirm", { amount: formatPrice(payable()) })}
            </button>
          </div>
          <label class="mt-3 flex items-start gap-2 text-sm leading-5 text-slate-700">
            <input
              type="checkbox"
              checked={acceptedTerms()}
              onChange={(event) => setAcceptedTerms(event.currentTarget.checked)}
              class="mt-0.5 h-4 w-4 flex-none accent-[#5d4ee7]"
              aria-label={t("checkout.terms")}
            />
            <span>
              {t("checkout.termsAgreement", { siteName: siteName() })}{" "}
              <a
                href="/page/terms-conditions"
                class="font-medium text-sky-500 transition hover:text-sky-600"
              >
                {t("checkout.terms")}
              </a>
            </span>
          </label>
        </div>
      ) : (
        <button
          type="button"
          disabled={isSubmitting()}
          onClick={() => void handlePrimaryAction()}
          class="mt-4 w-full rounded-none bg-[#8e208c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#741972] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("checkout.continueShipping")}
        </button>
      )}

      {step() === 1 ? (
        <p class="mt-3 text-xs text-slate-500">
          {t("checkout.nextStepHint")}
        </p>
      ) : null}

      {errorMessage() ? (
        <p class="mt-2 text-xs text-rose-500">{errorMessage()}</p>
      ) : null}
    </div>
  );
}
