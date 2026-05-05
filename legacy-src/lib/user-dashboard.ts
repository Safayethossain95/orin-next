import userDashboardRaw from "../data/user-dashboard.json";
import { createProductImage } from "./home";

type RawUserDashboard = typeof userDashboardRaw;

export type UserSection =
  | "dashboard"
  | "order"
  | "reseller"
  | "wholesale"
  | "affiliate"
  | "wishlist"
  | "setting"
  | "password";

const data = userDashboardRaw as RawUserDashboard;

const productPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
  { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
];

function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function loadUserDashboardData() {
  return {
    customer: {
      title: data.customer.title,
      phone: data.customer.phone,
      address: data.customer.address,
      isActive: data.customer.is_active,
      totalPurchase: data.customer.total_purchase,
      totalBalance: data.customer.total_balance,
      totalCashbackBalance: data.customer.total_cashback_balance,
      totalGiftCardBalance: data.customer.total_gift_card_balance,
      totalRewardPoints: data.customer.total_reward_points,
      ordersPending: data.customer.orders_pending,
      ordersPlaced: data.customer.orders_placed,
      ordersConfirmed: data.customer.orders_confirmed,
      ordersShipment: data.customer.orders_shipment,
      ordersPackaging: data.customer.orders_packaging,
      ordersDelivered: data.customer.orders_delivered,
      ordersReturned: data.customer.orders_returned,
      ordersCancelled: data.customer.orders_cancelled,
      paymentTitle: data.customer.payment_title,
      paymentNo: data.customer.payment_no,
      referCode: data.customer.refer_code,
      note: data.customer.note,
    },
    orders: data.orders,
    payments: data.payments,
    wishlist: data.wishlist.map((product, index) => {
      const slug = product.slug || slugifyProductName(product.name) || product.id;
      const productId = product.product_id || product.id;

      return {
        ...product,
        slug,
        backendProductId: productId,
        detailPath: `/product/${slug}/${productId}/`,
        image:
          product.image ||
          createProductImage(product.name, productPalettes[index % productPalettes.length]),
      };
    }),
    team: data.team,
  };
}

export function resolveUserSection(pathname: string): UserSection {
  if (pathname.startsWith("/user/order")) return "order";
  if (pathname.startsWith("/user/reseller")) return "reseller";
  if (pathname.startsWith("/user/wholesale")) return "wholesale";
  if (pathname.startsWith("/user/affiliate")) return "affiliate";
  if (pathname.startsWith("/user/wishlist") || pathname.startsWith("/user/withlist")) {
    return "wishlist";
  }
  if (pathname.startsWith("/user/setting")) return "setting";
  if (pathname.startsWith("/user/password")) return "password";

  return "dashboard";
}
