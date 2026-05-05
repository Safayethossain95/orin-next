import { createEffect, createMemo } from "solid-js";
import { useI18n } from "../../lib/i18n";
import { useCheckoutStore } from "../../stores/checkout-store";

type AddressFormProps = {
  compact?: boolean;
  submitAttempted?: boolean;
};

function validatePhone(phone: string) {
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.trim());
}

export function AddressForm(props: AddressFormProps) {
  const { t } = useI18n();
  const address = useCheckoutStore((state) => state.address);
  const setAddress = useCheckoutStore((state) => state.setAddress);
  const setIsAddressValid = useCheckoutStore((state) => state.setIsAddressValid);

  const errors = createMemo(() => {
    const current = address();
    return {
      phone:
        !current.phone.trim()
          ? t("checkout.phoneRequired")
          : !validatePhone(current.phone)
            ? t("checkout.phoneInvalid")
            : "",
      name:
        !current.name.trim()
          ? t("checkout.nameRequired")
          : current.name.trim().length < 3
            ? t("checkout.nameTooShort")
            : "",
      address:
        !current.address.trim()
          ? t("checkout.addressRequired")
          : current.address.trim().length < 5
            ? t("checkout.addressTooShort")
            : "",
    };
  });

  createEffect(() => {
    const fieldErrors = errors();
    const isValid = Object.values(fieldErrors).every((value) => !value);
    setIsAddressValid()(isValid);
  });

  const getFieldError = (field: keyof ReturnType<typeof errors>) =>
    props.submitAttempted ? errors()[field] : "";

  const inputClass = (field: keyof ReturnType<typeof errors>) =>
    `w-full rounded-none px-3 py-3 text-sm outline-none transition focus:border-[#8e208c] ${
      getFieldError(field) ? "border border-rose-500" : "border border-slate-300"
    }`;

  return (
    <div
      class={`rounded-none border border-slate-200 bg-white ${props.compact ? "p-3" : "p-4 sm:p-5"}`}
    >
      <div class="border-b border-dashed border-slate-200 pb-3">
        <div>
          <h2 class={`${props.compact ? "text-base" : "text-lg md:text-xl"} font-medium text-slate-900`}>
            {t("checkout.shippingAddress")}
          </h2>
          <p class="mt-1 text-xs text-slate-500">
            {t("checkout.shippingAddressHint")}
          </p>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">{t("checkout.phoneNumber")}</span>
          <input
            value={address().phone}
            onInput={(event) => setAddress()({ phone: event.currentTarget.value })}
            placeholder="01XXXXXXXXX"
            class={inputClass("phone")}
          />
          {getFieldError("phone") ? <p class="mt-1 text-xs text-red-500">{getFieldError("phone")}</p> : null}
        </label>

        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">{t("checkout.fullName")}</span>
          <input
            value={address().name}
            onInput={(event) => setAddress()({ name: event.currentTarget.value })}
            placeholder={t("checkout.fullNamePlaceholder")}
            class={inputClass("name")}
          />
          {getFieldError("name") ? <p class="mt-1 text-xs text-red-500">{getFieldError("name")}</p> : null}
        </label>

        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-slate-700">{t("checkout.address")}</span>
          <textarea
            rows={2}
            value={address().address}
            onInput={(event) => setAddress()({ address: event.currentTarget.value })}
            placeholder={t("checkout.addressPlaceholder")}
            class={inputClass("address")}
          />
          {getFieldError("address") ? <p class="mt-1 text-xs text-red-500">{getFieldError("address")}</p> : null}
        </label>
      </div>
    </div>
  );
}
