import checkoutGiftWrapRaw from "../data/checkout-gift-wrap.json";
import checkoutOptionsRaw from "../data/checkout-options.json";

type ShippingOptionSeed = {
  id: number;
  title: string;
  description: string;
  eta_label: string;
  charge: number;
};

type PaymentOptionSeed = {
  id: number;
  title: string;
  note: string;
  fee: number;
};

type PromoCodeSeed = {
  code: string;
  title: string;
  discount_amount: number;
};

export type ShippingOption = {
  id: number;
  title: string;
  description: string;
  etaLabel: string;
  charge: number;
};

export type PaymentOption = {
  id: number;
  title: string;
  note: string;
  fee: number;
};

export type PromoCode = {
  code: string;
  title: string;
  discountAmount: number;
};

export type GiftWrapContent = {
  title: string;
  fee: number;
  enabledLabel: string;
  specialDeliveryLabel: string;
};

const seeds = checkoutOptionsRaw as {
  shipping_options: ShippingOptionSeed[];
  payment_options: PaymentOptionSeed[];
  promo_codes: PromoCodeSeed[];
};

export const shippingOptions: ShippingOption[] = seeds.shipping_options.map((option) => ({
  id: option.id,
  title: option.title,
  description: option.description,
  etaLabel: option.eta_label,
  charge: option.charge,
}));

export const paymentOptions: PaymentOption[] = seeds.payment_options.map((option) => ({
  id: option.id,
  title: option.title,
  note: option.note,
  fee: option.fee,
}));

export const promoCodes: PromoCode[] = seeds.promo_codes.map((promo) => ({
  code: promo.code,
  title: promo.title,
  discountAmount: promo.discount_amount,
}));

export const giftWrapContent: GiftWrapContent = {
  title: checkoutGiftWrapRaw.title,
  fee: checkoutGiftWrapRaw.fee,
  enabledLabel: checkoutGiftWrapRaw.enabled_label,
  specialDeliveryLabel: checkoutGiftWrapRaw.special_delivery_label,
};

export function findPromoCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return promoCodes.find((promo) => promo.code === normalized) ?? null;
}
