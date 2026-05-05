import { createSignal } from "solid-js";
import { toast } from "../../components/common/Toast";
import { findPromoCode, promoCodes } from "../../lib/checkout";
import { useI18n } from "../../lib/i18n";
import { useCheckoutStore } from "../../stores/checkout-store";

export function CouponCard() {
  const { t } = useI18n();
  const appliedCode = useCheckoutStore((state) => state.promoCode);
  const discount = useCheckoutStore((state) => state.discount);
  const discountTitle = useCheckoutStore((state) => state.discountTitle);
  const setPromo = useCheckoutStore((state) => state.setPromo);
  const clearPromo = useCheckoutStore((state) => state.clearPromo);
  const [value, setValue] = createSignal(appliedCode());
  const [message, setMessage] = createSignal("");

  const handleApply = () => {
    const code = value().trim().toUpperCase();

    if (!code) {
      clearPromo()();
      setMessage(t("checkout.enterCouponCode"));
      toast.error(t("checkout.enterCouponCode"));
      return;
    }

    const promo = findPromoCode(code);

    if (!promo) {
      clearPromo()();
      setMessage(t("checkout.invalidCouponCode"));
      toast.error(t("checkout.invalidCouponCode"));
      return;
    }

    setPromo()(promo.code, promo.discountAmount, promo.title);
    setValue(promo.code);
    setMessage(t("checkout.couponApplied"));
    toast.success(t("checkout.couponApplied"));
  };

  return (
    <div class="mb-4 rounded-none border border-slate-200 bg-white p-4 sm:p-5">
      <h2 class="border-b border-dashed border-slate-200 pb-3 text-lg font-medium text-slate-900">
        {t("checkout.promoCode")}
      </h2>

      <div class="mt-4">
        <p class="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          {t("checkout.availableCoupons")}
        </p>
        <div class="flex flex-wrap gap-2">
          {promoCodes.map((promo) => {
            const isSelected = () => value().trim().toUpperCase() === promo.code;
            return (
              <button
                type="button"
                onClick={() => {
                  setValue(promo.code);
                  setMessage("");
                }}
                class={`inline-flex items-center gap-1.5 rounded-none border px-3 py-1.5 text-[11px] font-semibold leading-none transition ${
                  isSelected()
                    ? "border-[#8e208c] bg-[#8e208c] text-white shadow-sm"
                    : "border-[#d9c2e7] bg-[#fbf8ff] text-[#8e208c] hover:border-[#c9addc]"
                }`}
              >
                <span>{promo.code}</span>
                <span
                  class={`rounded-none px-1.5 py-0.5 text-[10px] font-bold tracking-[0.08em] ${
                    isSelected() ? "bg-white/20 text-white" : "bg-white text-[#8e208c]"
                  }`}
                >
                  {promo.title === "Launch voucher"
                    ? t("checkout.launchVoucher")
                    : promo.title === "Free delivery coupon"
                      ? t("checkout.freeDeliveryCoupon")
                      : promo.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <input
          value={value()}
          onInput={(event) => setValue(event.currentTarget.value)}
          placeholder={t("checkout.enterPromoCode")}
          class="w-full rounded-none border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-[#8e208c]"
        />
        <button
          type="button"
          onClick={handleApply}
          class="rounded-none bg-[#8e208c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#741972]"
        >
          {t("checkout.apply")}
        </button>
      </div>

      {message() ? (
        <p
          class={`mt-2 text-xs ${
            discount() > 0 ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {message()}
        </p>
      ) : null}

      {discount() > 0 ? (
        <div class="mt-3 rounded-none bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {discountTitle()}: - ৳{discount().toLocaleString("en-BD")}
        </div>
      ) : null}
    </div>
  );
}
