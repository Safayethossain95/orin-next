import userWholesaleRaw from "../data/user-wholesale.json";

type RawUserWholesale = typeof userWholesaleRaw;

const data = userWholesaleRaw as RawUserWholesale;

export type WholesaleNoteField = {
  key: string;
  type: string;
  title: string;
  value: string;
  placeholder: string;
};

export type WholesalePackage = {
  id: number;
  title: string;
  translation?: string;
  description?: string;
  subTitle?: string;
  price: number;
  currency: string;
  features: {
    key: string;
    value: string;
  }[];
  image?: string;
};

export function loadUserWholesaleData() {
  return {
    page: {
      title: data.page.title,
      description: data.page.description,
      loadingText: data.page.loading_text,
    },
    state: {
      isLoading: data.state.is_loading,
      isActive: data.state.is_active,
      isWholesale: data.state.is_wholesale,
      hasRequestedWholesale: data.state.has_requested_wholesale,
      showRequest: data.state.show_request,
      saving: data.state.saving,
    },
    customer: {
      id: data.customer.id,
      title: data.customer.title,
      customerTypes: data.customer.customer_types,
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
      ordersCancelled: data.customer.orders_cancelled,
      ordersReturned: data.customer.orders_returned,
      ordersDelivered: data.customer.orders_delivered,
    },
    note: data.note,
    packages: data.packages.map((item) => ({
      id: item.id,
      title: item.title,
      translation: item.translation,
      description: item.description,
      subTitle: item.sub_title,
      price: item.price,
      currency: item.currency,
      features: item.features,
      image: item.image,
    })),
  };
}
