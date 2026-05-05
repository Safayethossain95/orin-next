import { createSignal, onCleanup } from "solid-js";
import { createStore } from "zustand/vanilla";
import type { PaymentOption, ShippingOption } from "../lib/checkout";

export type CheckoutAddress = {
  name: string;
  phone: string;
  address: string;
};

export type GiftFrom = {
  name: string;
  address: string;
  message: string;
};

type CheckoutState = {
  step: 1 | 2;
  address: CheckoutAddress;
  shipping: ShippingOption | null;
  payment: PaymentOption | null;
  isGiftOrder: boolean;
  giftFrom: GiftFrom;
  promoCode: string;
  discount: number;
  discountTitle: string;
  submitAttempted: boolean;
  isAddressValid: boolean;
  setStep: (step: 1 | 2) => void;
  setAddress: (value: Partial<CheckoutAddress>) => void;
  setShipping: (value: ShippingOption | null) => void;
  setPayment: (value: PaymentOption | null) => void;
  setIsGiftOrder: (value: boolean) => void;
  setGiftFrom: (value: Partial<GiftFrom>) => void;
  setPromo: (code: string, amount: number, title: string) => void;
  clearPromo: () => void;
  setSubmitAttempted: (value: boolean) => void;
  setIsAddressValid: (value: boolean) => void;
  resetForCheckout: () => void;
};

const defaultAddress: CheckoutAddress = {
  name: "",
  phone: "",
  address: "",
};

const defaultGiftFrom: GiftFrom = {
  name: "",
  address: "",
  message: "",
};

export const checkoutStore = createStore<CheckoutState>((set, get) => ({
  step: 1,
  address: defaultAddress,
  shipping: null,
  payment: null,
  isGiftOrder: false,
  giftFrom: defaultGiftFrom,
  promoCode: "",
  discount: 0,
  discountTitle: "",
  submitAttempted: false,
  isAddressValid: true,
  setStep: (step) => set({ step }),
  setAddress: (value) => set({ address: { ...get().address, ...value } }),
  setShipping: (value) => set({ shipping: value }),
  setPayment: (value) => set({ payment: value }),
  setIsGiftOrder: (value) => set({ isGiftOrder: value }),
  setGiftFrom: (value) => set({ giftFrom: { ...get().giftFrom, ...value } }),
  setPromo: (code, amount, title) =>
    set({ promoCode: code, discount: amount, discountTitle: title }),
  clearPromo: () => set({ promoCode: "", discount: 0, discountTitle: "" }),
  setSubmitAttempted: (value) => set({ submitAttempted: value }),
  setIsAddressValid: (value) => set({ isAddressValid: value }),
  resetForCheckout: () =>
    set({
      step: 1,
      shipping: null,
      payment: null,
      isGiftOrder: false,
      giftFrom: defaultGiftFrom,
      promoCode: "",
      discount: 0,
      discountTitle: "",
      submitAttempted: false,
      isAddressValid: true,
    }),
}));

export function useCheckoutStore<T>(selector: (state: CheckoutState) => T) {
  const [selected, setSelected] = createSignal(selector(checkoutStore.getState()));
  const unsubscribe = checkoutStore.subscribe((state) => {
    setSelected(() => selector(state));
  });

  onCleanup(unsubscribe);

  return selected;
}
