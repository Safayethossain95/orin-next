import { createEffect } from "solid-js";
import { Icon } from "solid-heroicons";
import { creditCard } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import { paymentOptions } from "../../lib/checkout";
import { useI18n } from "../../lib/i18n";
import { useCheckoutStore } from "../../stores/checkout-store";

export function PaymentOptions() {
  const { t } = useI18n();
  const payment = useCheckoutStore((state) => state.payment);
  const setPayment = useCheckoutStore((state) => state.setPayment);
  const handleSelect = (option: (typeof paymentOptions)[number]) => {
    const isChanged = payment()?.id !== option.id;
    setPayment()(option);

    if (isChanged) {
      toast.info(t("checkout.paymentSelected", { title: translatePaymentTitle(option.title, t) }));
    }
  };

  createEffect(() => {
    if (!payment() && paymentOptions.length > 0) {
      setPayment()(paymentOptions[0]);
    }
  });

  return (
    <div class="rounded-none border border-slate-200 bg-white p-4 sm:p-5">
      <div class="flex items-center gap-2 border-b border-dashed border-slate-200 pb-3">
        <Icon
          path={creditCard}
          class="h-5 w-5 text-[#8e208c]"
          aria-hidden="true"
        />
        <div>
          <h2 class="text-lg font-medium text-slate-900">{t("checkout.payment")}</h2>
          <p class="text-xs text-slate-500">{t("checkout.paymentHint")}</p>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        {paymentOptions.map((option) => {
          const active = () => payment()?.id === option.id;
          return (
            <button
              type="button"
              onClick={() => handleSelect(option)}
              class={`w-full rounded-none border p-4 text-left transition ${
                active()
                  ? "border-[#d9c2e7] bg-[#fbf8ff] ring-1 ring-[#d9c2e7]"
                  : "border-slate-200 bg-white hover:border-[#d9c2e7]"
              }`}
            >
              <p class="font-semibold text-slate-900">{translatePaymentTitle(option.title, t)}</p>
              <p class="mt-1 text-sm text-slate-500">{translatePaymentNote(option.note, t)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function translatePaymentTitle(title: string, t: (key: string) => string) {
  if (title === "Cash on Delivery") return t("checkout.cashOnDelivery");
  if (title === "Online Payment") return t("checkout.onlinePayment");
  return title;
}

function translatePaymentNote(note: string, t: (key: string) => string) {
  if (note === "Pay in cash after the parcel reaches your doorstep.") {
    return t("checkout.cashOnDeliveryNote");
  }
  if (note === "Cards, mobile banking and wallet checkout supported.") {
    return t("checkout.onlinePaymentNote");
  }
  return note;
}
