import resellerOrdersRaw from "../data/user-orders-reseller.json";

export type ResellerOrderStatusOption = {
  id: string;
  name: string;
};

export type ResellerOrderReportRow = {
  orderDate: string;
  orderRef?: string | null;
  orderStatus: string;
  productName?: string | null;
  salesAmount: number;
  salesQty: number;
  commission: number;
  extraProfitLogistics: number;
  advanceCollect: number;
  totalCommission: number;
  paymentStatus: string;
  image?: string;
};

type ResellerOrdersData = {
  orderStatusOptions: ResellerOrderStatusOption[];
  paymentStatusOptions: ResellerOrderStatusOption[];
  rows: ResellerOrderReportRow[];
};

const resellerOrders = resellerOrdersRaw as ResellerOrdersData;

export function loadUserResellerOrders() {
  return resellerOrders;
}
