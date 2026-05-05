import { Icon } from "solid-heroicons";
import {
  arrowPath,
  currencyBangladeshi,
  gift,
  giftTop,
  scale,
  shoppingCart,
} from "solid-heroicons/outline";
import { formatPrice } from "../../lib/theme";
import type { loadUserDashboardData } from "../../lib/user-dashboard";

type DashboardData = ReturnType<typeof loadUserDashboardData>;

const statCards = [
  {
    label: "Purchase",
    key: "totalPurchase",
    icon: shoppingCart,
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-600",
  },
  {
    label: "Balance",
    key: "totalBalance",
    icon: scale,
    iconWrap: "bg-indigo-100",
    iconColor: "text-indigo-600",
    valueColor: "text-indigo-600",
  },
  {
    label: "Cashback",
    key: "totalCashbackBalance",
    icon: currencyBangladeshi,
    iconWrap: "bg-purple-100",
    iconColor: "text-purple-600",
    valueColor: "text-purple-600",
  },
  {
    label: "Gift Card",
    key: "totalGiftCardBalance",
    icon: gift,
    iconWrap: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-600",
  },
  {
    label: "Reward Point",
    key: "totalRewardPoints",
    icon: giftTop,
    iconWrap: "bg-green-100",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
] as const;

export function UserDashboard(props: { data: DashboardData }) {
  const customer = props.data.customer;
  const processing =
    customer.ordersPlaced +
    customer.ordersConfirmed +
    customer.ordersShipment +
    customer.ordersPackaging;

  return (
    <div>
      <div class="mb-8 flex items-end justify-between gap-3 border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            Welcome, {customer.title}!
          </h1>
          <p class="text-gray-500">Your wholesale dashboard is active.</p>
          <p class="text-sm text-gray-500">phone: {customer.phone}</p>
        </div>
        <span class="inline-flex items-center rounded-full border border-green-300 bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
          <Icon path={arrowPath} class="mr-1.5 h-5 w-5 text-green-600" />
          Reload
        </span>
      </div>

      <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
        {statCards.map((card) => (
          <div class="rounded-sm border border-gray-200 bg-white p-3 shadow-sm lg:p-6">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-medium text-gray-500">{card.label}</h3>
              <div class={`flex h-8 w-8 items-center justify-center rounded-sm lg:h-10 lg:w-10 ${card.iconWrap}`}>
                <Icon path={card.icon} class={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p class={`text-xl font-semibold md:text-xl lg:font-bold ${card.valueColor}`}>
              {formatPrice(customer[card.key])}
            </p>
          </div>
        ))}
      </div>

      <h3 class="mb-6 border-b pb-3 text-lg font-semibold text-gray-900">
        Order Status
      </h3>
      <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
        <OrderStatus
          label="Pending"
          value={customer.ordersPending}
          className="border-blue-200 bg-blue-50 text-blue-600"
          labelClassName="text-blue-800"
        />
        <OrderStatus
          label="Processing"
          value={processing}
          className="border-indigo-200 bg-indigo-50 text-indigo-600"
          labelClassName="text-indigo-800"
        />
        <OrderStatus
          label="Delivered"
          value={customer.ordersDelivered}
          className="border-green-300 bg-green-50 text-green-600"
          labelClassName="text-green-700"
        />
        <OrderStatus
          label="Return"
          value={customer.ordersReturned}
          className="border-yellow-300 bg-yellow-50 text-yellow-600"
          labelClassName="text-yellow-700"
        />
        <OrderStatus
          label="Cancel"
          value={customer.ordersCancelled}
          className="border-red-200 bg-red-50 text-red-600"
          labelClassName="text-red-700"
        />
      </div>
    </div>
  );
}

function OrderStatus(props: {
  label: string;
  value: number;
  className: string;
  labelClassName: string;
}) {
  return (
    <div class={`rounded-sm border p-3 text-center lg:p-6 ${props.className}`}>
      <p class={`mb-1 font-medium ${props.labelClassName}`}>{props.label}</p>
      <h2 class="text-xl font-semibold md:text-2xl lg:text-3xl lg:font-bold">
        {props.value}
      </h2>
    </div>
  );
}
