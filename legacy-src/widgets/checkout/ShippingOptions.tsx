import { createEffect } from "solid-js";
import { Icon } from "solid-heroicons";
import { truck } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import { formatPrice } from "../../lib/theme";
import { shippingOptions } from "../../lib/checkout";
import { useI18n } from "../../lib/i18n";
import { useCheckoutStore } from "../../stores/checkout-store";

export function ShippingOptions() {
  const { t } = useI18n();
  const shipping = useCheckoutStore((state) => state.shipping);
  const setShipping = useCheckoutStore((state) => state.setShipping);
  const handleSelect = (option: (typeof shippingOptions)[number]) => {
    const isChanged = shipping()?.id !== option.id;
    setShipping()(option);

    if (isChanged) {
      toast.info(t("checkout.shippingSelected", { title: translateShippingTitle(option.title, t) }));
    }
  };

  createEffect(() => {
    if (!shipping() && shippingOptions.length > 0) {
      setShipping()(shippingOptions[0]);
    }
  });

  return (
    <div class="rounded-none border border-slate-200 bg-white p-4 sm:p-5">
      <div class="flex items-center gap-2 border-b border-dashed border-slate-200 pb-3">
        <Icon path={truck} class="h-5 w-5 text-[#8e208c]" aria-hidden="true" />
        <div>
          <h2 class="text-lg font-medium text-slate-900">{t("checkout.shipping")}</h2>
          <p class="text-xs text-slate-500">{t("checkout.shippingHint")}</p>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        {shippingOptions.map((option) => {
          const active = () => shipping()?.id === option.id;
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
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-semibold text-slate-900">{translateShippingTitle(option.title, t)}</p>
                    <span class="rounded-none bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8e208c] ring-1 ring-[#eadcf1]">
                      {translateEtaLabel(option.etaLabel, t)}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-slate-500">
                    {translateShippingDescription(option.description, t)}
                  </p>
                </div>
                <span class="text-sm font-semibold text-slate-900">
                  {formatPrice(option.charge)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function translateShippingTitle(title: string, t: (key: string) => string) {
  if (title === "Standard Delivery") return t("checkout.standardDelivery");
  if (title === "Express Delivery") return t("checkout.expressDelivery");
  return title;
}

function translateShippingDescription(description: string, t: (key: string) => string) {
  if (description === "Delivered within 2-3 working days inside major cities.") {
    return t("checkout.standardDeliveryDescription");
  }
  if (description === "Priority handling for urgent household and gadget orders.") {
    return t("checkout.expressDeliveryDescription");
  }
  return description;
}

function translateEtaLabel(label: string, t: (key: string) => string) {
  if (label === "2-3 days") return t("checkout.etaTwoThreeDays");
  if (label === "24 hours") return t("checkout.etaTwentyFourHours");
  return label;
}
