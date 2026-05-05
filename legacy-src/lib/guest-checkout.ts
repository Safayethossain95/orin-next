import {
  getStoreProductAction,
  storeCreateGuestOrderCheckoutAction,
  type CreateOrderCheckoutMutationInputDto,
} from "@repo/graphql";
import type { CartItem } from "../stores/cart-store";
import type { CheckoutAddress } from "../stores/checkout-store";
import type { PaymentOption, ShippingOption } from "./checkout";

type SubmitCheckoutInput = {
  cart: CartItem[];
  address: CheckoutAddress;
  shipping: ShippingOption;
  payment: PaymentOption;
  promoCode: string;
  discount: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function extractProductSlug(item: CartItem) {
  if (item.slug?.trim()) {
    return item.slug.trim();
  }

  const match = item.detailPath?.match(/\/product\/([^/]+)\//);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function resolveCartItemMetadata(item: CartItem) {
  const existingSku = item.sku?.trim();
  const backendProductId = item.backendProductId?.trim() || item.id.trim();

  if (backendProductId && isUuid(backendProductId) && existingSku) {
    return {
      productId: backendProductId,
      sku: existingSku,
      title: item.name,
    };
  }

  const slug = extractProductSlug(item);

  if (!slug) {
    throw new Error(`Product information is missing for "${item.name}".`);
  }

  const product = await getStoreProductAction({ slug });

  if (!product) {
    throw new Error(`Product information could not be found for "${item.name}".`);
  }

  const sku = product.sku?.trim();

  if (!sku) {
    throw new Error(`SKU is missing for "${item.name}".`);
  }

  return {
    productId: String(product.id),
    sku,
    title: product.title,
  };
}

function resolvePaymentMethodCode(payment: PaymentOption) {
  const normalizedTitle = payment.title.trim().toLowerCase();

  if (normalizedTitle === "cash on delivery") {
    return "cod";
  }

  if (normalizedTitle.includes("bkash") || normalizedTitle.includes("nagad")) {
    return "bkash";
  }

  if (normalizedTitle.includes("card") || normalizedTitle.includes("wallet")) {
    return "online";
  }

  return normalizedTitle;
}

async function buildCheckoutPayload(input: SubmitCheckoutInput): Promise<CreateOrderCheckoutMutationInputDto> {
  const merchant = input.shipping.title.trim();
  const lines = await Promise.all(
    input.cart.map(async (item) => {
      const metadata = await resolveCartItemMetadata(item);

      return {
        productId: metadata.productId,
        sku: metadata.sku,
        title: metadata.title,
        qty: item.quantity,
        unitPrice: item.price,
        unitCost: item.price,
        meta: {
          themeProductId: item.id,
          slug: item.slug ?? null,
          detailPath: item.detailPath ?? null,
          image: item.image,
        },
      };
    }),
  );

  const addressName = input.address.name.trim();
  const phone = input.address.phone.trim();
  const addressLine = input.address.address.trim();

  return {
    paymentMethod: resolvePaymentMethodCode(input.payment),
    order: {
      customerPhone: phone,
      shippingFee: input.shipping.charge,
      lines,
      billingAddress: {
        name: addressName,
        phone,
        address: addressLine,
      },
      shippingAddress: {
        name: addressName,
        phone,
        address: addressLine,
        merchant,
        merchantName: merchant,
        carrier: merchant,
        shippingMethod: input.shipping.title,
        deliveryEta: input.shipping.etaLabel,
      },
      meta: {
        source: "orin-checkout",
        merchant,
        shippingOptionId: input.shipping.id,
        shippingOptionTitle: input.shipping.title,
        paymentOptionId: input.payment.id,
        paymentOptionTitle: input.payment.title,
        promoCode: input.promoCode || null,
        discount: input.discount,
      },
    },
  };
}

export async function submitCheckout(input: SubmitCheckoutInput) {
  const payload = await buildCheckoutPayload(input);

  return storeCreateGuestOrderCheckoutAction({ input: payload });
}
