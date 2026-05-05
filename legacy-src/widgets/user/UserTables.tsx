import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import type { JSX } from "solid-js";
import { getAuthMeAction, getStoreSearchOrdersAction } from "@repo/graphql";
import { Icon } from "solid-heroicons";
import { arrowPath } from "solid-heroicons/outline";
import { formatPrice } from "../../lib/theme";
import { loadUserResellerOrders } from "../../lib/user-reseller-orders";
import type { loadUserDashboardData } from "../../lib/user-dashboard";
import { authStore } from "../../stores/auth-store";
import type { AuthUser } from "../../stores/auth-store";

type DashboardData = ReturnType<typeof loadUserDashboardData>;
type StoreOrdersResult = Awaited<ReturnType<typeof getStoreSearchOrdersAction>>;
type StoreOrder = NonNullable<StoreOrdersResult>[number];
type SelectValue = string | "All" | null;

const orderTabs = [
  { id: 0, name: "All", status: null },
  { id: 1, name: "Pending Payment", status: "Pending Payment" },
  { id: 2, name: "Confirmed", status: "Confirmed" },
  { id: 3, name: "Delivered", status: "Delivered" },
  { id: 4, name: "Paid", status: "Paid" },
  { id: 5, name: "Packed", status: "Packed" },
  { id: 6, name: "Shipped", status: "Shipped" },
  { id: 7, name: "Cancelled", status: "Cancelled" },
] as const;

const tableTabs = ["All", "Pending", "Placed", "Confirmed", "Completed"];
const ORDER_BATCH_SIZE = 100;
const ORDER_MAX_BATCHES = 5;
const LOGIN_FIRST_MESSAGE = "Login first to see your orders";
const resellerOrders = loadUserResellerOrders();

type OrderItem = {
  id: number;
  orderId: string;
  total: number;
  currency?: string;
  status: string | null;
  updatedAtRelative: string;
  updatedAtLabel: string;
  customerName: string;
  lines: {
    id: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
};

type PaginationItem = number | "left-ellipsis" | "right-ellipsis";

const statusRowClass: Record<string, string> = {
  delivered: "bg-green-100",
  cancelled: "bg-red-100",
  "pending payment": "bg-yellow-100",
  confirmed: "bg-blue-100",
  paid: "bg-emerald-100",
  packed: "bg-orange-100",
  shipped: "bg-cyan-100",
};

const statusPillClass: Record<string, string> = {
  delivered: "border-green-200 bg-green-50",
  cancelled: "border-red-200 bg-red-50",
  "pending payment": "border-yellow-200 bg-yellow-50",
  confirmed: "border-blue-200 bg-blue-50",
  paid: "border-emerald-200 bg-emerald-50",
  packed: "border-orange-200 bg-orange-50",
  shipped: "border-cyan-200 bg-cyan-50",
};

function normalizeStatus(value?: string | null) {
  const normalized = value
    ?.trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  if (!normalized) {
    return null;
  }

  if (normalized === "Pending") {
    return "Pending Payment";
  }

  if (normalized === "Processing") {
    return "Confirmed";
  }

  if (normalized === "Fulfilled") {
    return "Delivered";
  }

  if (normalized === "Cancel") {
    return "Cancelled";
  }

  return normalized;
}

function formatStatusLabel(value?: string | null) {
  const normalized = normalizeStatus(value);

  if (!normalized) {
    return "Checked";
  }

  return normalized
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getStatusKey(value?: string | null) {
  return normalizeStatus(value)?.toLowerCase() ?? null;
}

function getStatusRowClass(value?: string | null) {
  const key = getStatusKey(value);

  return key ? statusRowClass[key] : undefined;
}

function getStatusPillClass(value?: string | null) {
  const key = getStatusKey(value);

  return key ? statusPillClass[key] : undefined;
}

function badgeClass(status: string) {
  const normalized = status.toLowerCase();

  if (["paid", "delivered", "confirmed"].includes(normalized)) {
    return "border-green-300 bg-green-50 text-green-800";
  }

  if (
    ["rejected", "returned", "cancelled", "not_responding", "not_paid"].includes(
      normalized,
    )
  ) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (
    [
      "processing",
      "packaging",
      "shipment",
      "on_the_way",
      "station",
      "placed",
    ].includes(normalized)
  ) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  return "border-gray-200 bg-gray-50 text-gray-700";
}

function mapOrder(
  order: StoreOrder,
  index: number,
): OrderItem {
  const total = Number(order.total ?? order.grandTotal ?? 0);
  const lines = order.lines ?? [];

  return {
    id: index + 1,
    orderId: order.orderNumber || String(order.orderId),
    total,
    currency: order.currency ?? "BDT",
    status: normalizeStatus(order.status),
    updatedAtRelative: formatRelativeTime(order.placedAt),
    updatedAtLabel: formatDateLabel(order.placedAt),
    customerName:
      order.customerName ??
      order.customerEmail ??
      order.customerPhone ??
      "Customer",
    lines:
      lines.length > 0
        ? lines.map((line, lineIndex) => ({
            id: lineIndex + 1,
            productName: line.title ?? "Item",
            quantity: Number(line.qty ?? 0),
            price: Number(line.unitPrice ?? 0),
          }))
        : [
            {
              id: 1,
              productName: order.productTitle ?? order.orderNumber ?? "Order item",
              quantity: Number(order.items ?? 1),
              price: total,
            },
          ],
  };
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / (1000 * 60));

  if (minutes < 1) return future ? "in moments" : "just now";
  if (minutes < 60) return future ? `in ${minutes} min` : `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return future
      ? `in ${hours} hour${hours > 1 ? "s" : ""}`
      : `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.round(hours / 24);
  if (days < 30) {
    return future
      ? `in ${days} day${days > 1 ? "s" : ""}`
      : `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.round(days / 30);
  if (months < 12) {
    return future
      ? `in ${months} month${months > 1 ? "s" : ""}`
      : `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.round(months / 12);

  return future
    ? `in ${years} year${years > 1 ? "s" : ""}`
    : `${years} year${years > 1 ? "s" : ""} ago`;
}

type OrderLookupInput = {
  customerEmail?: string;
  customerPhone?: string;
};

function getOrderLookupInput(user: AuthUser): OrderLookupInput | null {
  const phone = user.phone?.trim();

  if (phone) {
    return { customerPhone: phone };
  }

  const email = user.email?.trim();

  if (email) {
    return { customerEmail: email };
  }

  return null;
}

async function fetchAuthMe() {
  const currentUser = authStore.getState().user;

  if (currentUser) {
    return currentUser;
  }

  const nextUser = await getAuthMeAction().catch(() => null);

  if (nextUser) {
    authStore.getState().signIn(nextUser);
  }

  return nextUser;
}

async function fetchStoreOrders(lookupInput: OrderLookupInput) {
  const orders: StoreOrder[] = [];

  for (let batchIndex = 0; batchIndex < ORDER_MAX_BATCHES; batchIndex += 1) {
    const response = await getStoreSearchOrdersAction({
      input: {
        ...lookupInput,
        limit: ORDER_BATCH_SIZE,
        offset: batchIndex * ORDER_BATCH_SIZE,
      },
    });
    const batch = response ?? [];

    orders.push(...batch);

    if (batch.length < ORDER_BATCH_SIZE) {
      break;
    }
  }

  return orders;
}

export function UserOrderList() {
  const [selectedTab, setSelectedTab] = createSignal("All");
  const [expandedOrderId, setExpandedOrderId] = createSignal<number | null>(
    null,
  );
  const [page, setPage] = createSignal(1);
  const [first, setFirst] = createSignal(15);
  const [orders, setOrders] = createSignal<OrderItem[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal("");
  const selectedTabStatus = createMemo(
    () => orderTabs.find((tab) => tab.name === selectedTab())?.status ?? null,
  );
  const filteredOrders = createMemo(() => {
    const status = selectedTabStatus();

    return status === null
      ? orders()
      : orders().filter(
          (order) => order.status?.toLowerCase() === status.toLowerCase(),
        );
  });
  const totalOrders = createMemo(() => filteredOrders().length);
  const visibleOrders = createMemo(() =>
    filteredOrders().slice((page() - 1) * first(), page() * first()),
  );
  const toggleOrderInvoice = (orderId: number) => {
    setExpandedOrderId((previous) => (previous === orderId ? null : orderId));
  };

  onMount(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const me = await fetchAuthMe();

        if (!isMounted) {
          return;
        }

        if (!me) {
          setOrders([]);
          setPage(1);
          setExpandedOrderId(null);
          setError(LOGIN_FIRST_MESSAGE);
          return;
        }

        const lookupInput = getOrderLookupInput(me);

        if (!lookupInput) {
          setOrders([]);
          setPage(1);
          setExpandedOrderId(null);
          setError("No customer phone or email found for this account.");
          return;
        }

        const response = await fetchStoreOrders(lookupInput);

        if (!isMounted) {
          return;
        }

        setOrders(response.map(mapOrder));
        setPage(1);
        setExpandedOrderId(null);
      } catch (nextError) {
        if (!isMounted) {
          return;
        }

        setOrders([]);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Failed to load orders.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  });

  return (
    <div>
      <SectionHeader
        title="Order"
        copy="Efficient order oversight: names, details, emails, roles-all in your comprehensive Order Dashboard"
      />

      <OrderListBase
        total={totalOrders()}
        page={page()}
        first={first()}
        firstOptions={[15, 30, 100, 200]}
        isEmpty={isLoading() || Boolean(error()) || visibleOrders().length === 0}
        onPageChange={(value) => {
          setPage(value);
          setExpandedOrderId(null);
        }}
        onFirstChange={(value) => {
          setFirst(value);
          setPage(1);
          setExpandedOrderId(null);
        }}
        header={
          <nav class="my-6 flex space-x-4 overflow-x-auto border-b border-gray-200">
            <For each={orderTabs}>
              {(tab) => (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab(tab.name);
                    setPage(1);
                    setExpandedOrderId(null);
                  }}
                  class={`whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium ${
                    selectedTab() === tab.name
                      ? "border-[#8e208c] text-[#8e208c]"
                      : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.name}
                </button>
              )}
            </For>
          </nav>
        }
        thead={
          <tr>
            <th scope="col" class="px-2 py-3">
              SL
            </th>
            <th scope="col" class="px-2 py-3">
              ID
            </th>
            <th scope="col" class="px-2 py-3">
              Status
            </th>
            <th scope="col" class="px-2 py-3">
              Update
            </th>
            <th scope="col" class="px-2 py-3">
              Name
            </th>
            <th scope="col" class="px-2 py-3">
              Action
            </th>
          </tr>
        }
        empty={
          <tr>
            <td
              colSpan={6}
              class="border px-4 py-8 text-center font-medium text-gray-500"
            >
              <Show
                when={!isLoading()}
                fallback="Loading orders from API..."
              >
                {error() || "No orders found."}
              </Show>
            </td>
          </tr>
        }
        tbody={
          <>
            <For each={visibleOrders()}>
              {(order, index) => (
                <Show
                  when={expandedOrderId() !== order.id}
                  fallback={
                    <tr>
                      <td colSpan={6} class="border bg-white p-4">
                        <OrderInvoiceInline
                          order={order}
                          onClose={() => setExpandedOrderId(null)}
                        />
                      </td>
                    </tr>
                  }
                >
                  <tr class={getStatusRowClass(order.status)}>
                    <td class="bg-yellow-100 p-2">
                      {(page() - 1) * first() + index() + 1}
                    </td>
                    <td class="p-2">
                      <p class="whitespace-nowrap">ID: {order.orderId}</p>
                      <p class="text-xs text-gray-500">
                        {formatPrice(order.total)}
                      </p>
                    </td>
                    <td class="p-2">
                      <span
                        class={`rounded-full border px-2 text-xs font-medium text-gray-700 ${
                          getStatusPillClass(order.status) ??
                          "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td class="whitespace-nowrap p-2">
                      <div class="text-gray-900">{order.updatedAtRelative}</div>
                      <div class="text-xs text-gray-500">
                        {order.updatedAtLabel}
                      </div>
                    </td>
                    <td class="whitespace-nowrap p-2">
                      <div class="text-gray-900">{order.customerName}</div>
                    </td>
                    <td class="p-2">
                      <button
                        type="button"
                        class="rounded bg-[#8e208c] px-3 py-1 text-white transition hover:opacity-90"
                        onClick={() => toggleOrderInvoice(order.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                </Show>
              )}
            </For>
          </>
        }
      />
    </div>
  );
}

export function UserResellerOrderList() {
  const [startDate, setStartDate] = createSignal("");
  const [endDate, setEndDate] = createSignal("");
  const [selectedOrderStatus, setSelectedOrderStatus] =
    createSignal<SelectValue>("All");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    createSignal<SelectValue>("All");
  const [page, setPage] = createSignal(1);
  const [first, setFirst] = createSignal(15);
  const rows = () => resellerOrders.rows;
  const filteredRows = createMemo(() =>
    rows().filter((row) => {
      const orderStatusMatches =
        selectedOrderStatus() === "All" ||
        row.orderStatus === selectedOrderStatus();
      const paymentStatusMatches =
        selectedPaymentStatus() === "All" ||
        row.paymentStatus === selectedPaymentStatus();
      const dateMatches =
        (!startDate() || row.orderDate >= startDate()) &&
        (!endDate() || row.orderDate <= endDate());

      return orderStatusMatches && paymentStatusMatches && dateMatches;
    }),
  );
  const pagedRows = createMemo(() =>
    filteredRows().slice((page() - 1) * first(), page() * first()),
  );
  const totalSales = createMemo(() =>
    filteredRows().reduce(
      (sum, row) => sum + Number(row.salesAmount ?? 0),
      0,
    ),
  );
  const totalQty = createMemo(() =>
    filteredRows().reduce((sum, row) => sum + Number(row.salesQty ?? 0), 0),
  );
  const totalCommission = createMemo(() =>
    filteredRows().reduce(
      (sum, row) => sum + Number(row.commission ?? 0),
      0,
    ),
  );
  const totalExtra = createMemo(() =>
    filteredRows().reduce(
      (sum, row) => sum + Number(row.extraProfitLogistics ?? 0),
      0,
    ),
  );
  const totalAdvance = createMemo(() =>
    filteredRows().reduce(
      (sum, row) => sum + Number(row.advanceCollect ?? 0),
      0,
    ),
  );
  const isFilterDisabled = createMemo(
    () => (Boolean(startDate()) && !endDate()) || (!startDate() && Boolean(endDate())),
  );

  return (
    <div>
      <SectionHeader
        title="Reseller"
        copy="Track attributed reseller orders, payment status, commission, logistics profit, and advance collections."
      />

      <OrderListBase
        total={filteredRows().length}
        page={page()}
        first={first()}
        firstOptions={[15, 30, 100, 200]}
        isEmpty={!pagedRows().length}
        onPageChange={setPage}
        onFirstChange={(value) => {
          setFirst(value);
          setPage(1);
        }}
        header={
          <div class="my-6 justify-between gap-2 lg:flex lg:items-center">
            <div class="grid w-full grid-cols-1 items-center justify-start gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label class="mb-1 block text-sm text-gray-600">
                  Order Status
                </label>
                <select
                  value={String(selectedOrderStatus())}
                  onChange={(event) => {
                    setSelectedOrderStatus(
                      event.currentTarget.value === "All"
                        ? "All"
                        : event.currentTarget.value,
                    );
                    setPage(1);
                  }}
                  class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
                >
                  <For each={resellerOrders.orderStatusOptions}>
                    {(item) => (
                      <option value={String(item.id ?? "All")}>
                        {item.name}
                      </option>
                    )}
                  </For>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-600">
                  Payment Status
                </label>
                <select
                  value={String(selectedPaymentStatus())}
                  onChange={(event) => {
                    setSelectedPaymentStatus(
                      event.currentTarget.value === "All"
                        ? "All"
                        : event.currentTarget.value,
                    );
                    setPage(1);
                  }}
                  class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
                >
                  <For each={resellerOrders.paymentStatusOptions}>
                    {(item) => (
                      <option value={String(item.id ?? "All")}>
                        {item.name}
                      </option>
                    )}
                  </For>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-600">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate()}
                  onInput={(event) => {
                    setStartDate(event.currentTarget.value);
                    setPage(1);
                  }}
                  class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-600">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate()}
                  onInput={(event) => {
                    setEndDate(event.currentTarget.value);
                    setPage(1);
                  }}
                  class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-600">&nbsp;</label>
                <button
                  type="button"
                  disabled={isFilterDisabled()}
                  class="w-full rounded-md bg-[#8e208c] py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Filter now
                </button>
              </div>
            </div>
          </div>
        }
        thead={
          <tr>
            <th class="border p-2">Date</th>
            <th class="border p-2">Order Id</th>
            <th class="border p-2">Order Status</th>
            <th class="border p-2">Product Name</th>
            <th class="border p-2">Sales Amount</th>
            <th class="border p-2">Sales Qty</th>
            <th class="border p-2">Commission</th>
            <th class="border p-2">Extra Profit (Logistics)</th>
            <th class="border p-2">Advance Collect</th>
            <th class="border p-2">Total Commission</th>
            <th class="border p-2">Payment Status</th>
          </tr>
        }
        empty={
          <tr>
            <td
              colSpan={11}
              class="border px-4 py-8 text-center font-medium text-gray-500"
            >
              No reseller commission orders found.
            </td>
          </tr>
        }
        tbody={
          <>
            <For each={pagedRows()}>
              {(row) => (
                <tr>
                  <td class="border p-2">{row.orderDate}</td>
                  <td class="border p-2">
                    <p class="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      {row.orderRef}
                    </p>
                  </td>
                  <td class="border p-2">
                    <p
                      class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass(
                        row.orderStatus,
                      )}`}
                    >
                      {row.orderStatus}
                    </p>
                  </td>
                  <td class="border px-4 py-2">{row.productName || "-"}</td>
                  <td class="border px-4 py-2">
                    {formatPrice(row.salesAmount)}
                  </td>
                  <td class="border px-4 py-2">{row.salesQty}</td>
                  <td class="border px-4 py-2">
                    {formatPrice(row.commission)}
                  </td>
                  <td class="border px-4 py-2">
                    {formatPrice(row.extraProfitLogistics)}
                  </td>
                  <td class="border px-4 py-2">
                    {formatPrice(row.advanceCollect)}
                  </td>
                  <td class="border px-4 py-2">
                    {formatPrice(row.totalCommission)}
                  </td>
                  <td class="border px-4 py-2">
                    <p
                      class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass(
                        row.paymentStatus,
                      )}`}
                    >
                      {row.paymentStatus}
                    </p>
                  </td>
                </tr>
              )}
            </For>
            <Show when={filteredRows().length}>
              <tr class="bg-gray-50 font-bold">
                <td colSpan={4} class="border p-2 text-right">
                  Total =
                </td>
                <td class="border p-2">{formatPrice(totalSales())}</td>
                <td class="border p-2">{totalQty()}</td>
                <td class="border p-2">{formatPrice(totalCommission())}</td>
                <td class="border p-2">{formatPrice(totalExtra())}</td>
                <td class="border p-2">{formatPrice(totalAdvance())}</td>
                <td class="border p-2" colSpan={2} />
              </tr>
            </Show>
          </>
        }
      />
    </div>
  );
}

export function UserPaymentList(props: { data: DashboardData }) {
  return (
    <div>
      <SectionHeader
        title="Payments"
        copy="Track payments: amounts, dates, tx - your complete Reseller Dashboard."
      />
      <TabStrip active="Orders" items={["Orders", "Received", "Processing", "Receivable"]} />
      <DataTable
        columns={["SL", "", "ID", "Status", "Update", "Method", "Action"]}
        rows={props.data.payments.map((payment, index) => [
          String(index + 1),
          "□",
          `ID: ${payment.payment_id}\n${formatPrice(payment.amount)}`,
          payment.status,
          payment.updated_at,
          payment.method,
          "Details",
        ])}
      />
    </div>
  );
}

export function UserTeamList(props: {
  data: DashboardData;
  title: string;
  copy: string;
}) {
  return (
    <div>
      <SectionHeader title={props.title} copy={props.copy} />
      <DataTable
        columns={["SL", "Name", "Phone", "Role", "Sales", "Action"]}
        rows={props.data.team.map((member, index) => [
          String(index + 1),
          member.name,
          member.phone,
          member.role,
          formatPrice(member.sales),
          "Details",
        ])}
      />
    </div>
  );
}

function SectionHeader(props: { title: string; copy: string }) {
  return (
    <div class="flex w-full items-center justify-between">
      <div class="w-full sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">{props.title}</h1>
        <p class="mt-2 text-sm text-gray-700">{props.copy}</p>
      </div>
      <Icon path={arrowPath} class="ml-2 h-6 w-6 cursor-pointer" aria-hidden="true" />
    </div>
  );
}

function TabStrip(props: { active: string; items?: string[] }) {
  const items = () => props.items ?? tableTabs;

  return (
    <div class="mx-auto mt-4 w-full">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-4 overflow-x-auto">
          <For each={items()}>
            {(tab) => (
              <div
                class={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  props.active === tab
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
                {props.active === tab ? " (4)" : ""}
              </div>
            )}
          </For>
        </nav>
      </div>
    </div>
  );
}

function DataTable(props: { columns: string[]; rows: string[][] }) {
  return (
    <div class="mt-4 flex flex-col">
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full py-1 align-middle md:px-6 lg:px-8">
          <div class="relative overflow-hidden rounded-sm shadow ring-1 ring-black ring-opacity-5">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <For each={props.columns}>
                    {(column) => (
                      <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {column}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-300 bg-white">
                <For each={props.rows}>
                  {(row) => (
                    <tr class="cursor-pointer">
                      <For each={row}>
                        {(cell, index) => (
                          <td
                            class={`whitespace-pre-line px-3 py-2 text-sm ${
                              index() === 0
                                ? "bg-yellow-100 text-center"
                                : "text-gray-600"
                            }`}
                          >
                            {index() === row.length - 1 ? (
                              <button
                                type="button"
                                class="rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                              >
                                {cell}
                              </button>
                            ) : (
                              cell
                            )}
                          </td>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <nav class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to{" "}
                <span class="font-medium">{props.rows.length}</span>
              </p>
              <button
                type="button"
                class="rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderListBase(props: {
  total: number;
  page: number;
  first: number;
  firstOptions: number[];
  isEmpty?: boolean;
  header?: JSX.Element;
  thead?: JSX.Element;
  tbody?: JSX.Element;
  empty?: JSX.Element;
  onPageChange: (value: number) => void;
  onFirstChange: (value: number) => void;
}) {
  const showPagination = () => props.total > props.first;

  return (
    <div class="my-4 sm:px-4">
      {props.header}
      <div class="overflow-x-auto bg-white">
        <table class="w-full rounded border text-center text-sm">
          <thead class="bg-gray-50">{props.thead}</thead>
          <tbody>{props.isEmpty ? props.empty : props.tbody}</tbody>
        </table>
        <Show when={showPagination()}>
          <PaginationControls
            total={props.total}
            page={props.page}
            first={props.first}
            firstOptions={props.firstOptions}
            onPageChange={props.onPageChange}
            onFirstChange={props.onFirstChange}
          />
        </Show>
      </div>
    </div>
  );
}

function PaginationControls(props: {
  total?: number;
  page?: number;
  first?: number;
  firstOptions?: number[];
  disabled?: boolean;
  onPageChange: (value: number) => void;
  onFirstChange: (value: number) => void;
}) {
  const [pageInput, setPageInput] = createSignal(String(props.page ?? 1));
  const totalPages = createMemo(() => {
    const first = props.first ?? 12;

    if (!first || first <= 0) {
      return 1;
    }

    const pages = Math.ceil((props.total ?? 0) / first);

    return pages > 0 ? pages : 1;
  });
  const currentPage = createMemo(() => {
    const safePage = Math.max(1, props.page ?? 1);

    return Math.min(safePage, totalPages());
  });
  const displayFrom = createMemo(() =>
    props.total ? (currentPage() - 1) * (props.first ?? 12) + 1 : 0,
  );
  const displayTo = createMemo(() =>
    props.total
      ? Math.min(props.total, currentPage() * (props.first ?? 12))
      : 0,
  );
  const canGoPrev = createMemo(() => currentPage() > 1);
  const canGoNext = createMemo(() => currentPage() < totalPages());
  const pageItems = createMemo<PaginationItem[]>(() => {
    if (totalPages() <= 5) {
      return Array.from({ length: totalPages() }, (_, index) => index + 1);
    }

    const items: PaginationItem[] = [1];
    const start = Math.max(2, currentPage() - 1);
    const end = Math.min(totalPages() - 1, currentPage() + 1);

    if (start > 2) items.push("left-ellipsis");
    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      items.push(pageNumber);
    }
    if (end < totalPages() - 1) items.push("right-ellipsis");
    items.push(totalPages());

    return items;
  });
  const goToPage = (next: number) => {
    const target = Math.min(Math.max(next, 1), totalPages());

    if (target === props.page) {
      return;
    }

    props.onPageChange(target);
    setPageInput(String(target));
  };
  const handlePageInput = () => {
    const parsed = Number(pageInput());

    if (!Number.isFinite(parsed)) {
      setPageInput(String(currentPage()));
      return;
    }

    goToPage(parsed);
  };

  return (
    <div class="flex flex-col gap-3 border-t border-gray-200 bg-white py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs sm:text-sm">
        Showing <span class="font-semibold text-gray-900">{displayFrom()}</span>{" "}
        - <span class="font-semibold text-gray-900">{displayTo()}</span> of{" "}
        <span class="font-semibold text-gray-900">{props.total ?? 0}</span>{" "}
        items
      </p>
      <div class="flex flex-wrap items-center justify-end gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Items per page</span>
          <select
            class="h-8 rounded-md border border-gray-200 bg-white px-5 text-xs font-medium text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-0"
            disabled={props.disabled}
            value={props.first ?? 12}
            onChange={(event) =>
              props.onFirstChange(Number(event.currentTarget.value))
            }
          >
            <For each={props.firstOptions ?? [15, 30, 50, 100]}>
              {(size) => <option value={size}>{size}</option>}
            </For>
          </select>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="h-8 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={props.disabled || !canGoPrev()}
            onClick={() => goToPage(currentPage() - 1)}
          >
            Prev
          </button>
          <For each={pageItems()}>
            {(item) =>
              typeof item === "number" ? (
                <button
                  type="button"
                  class={`h-8 rounded-md border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    item === currentPage()
                      ? "border-[#8e208c] bg-[#8e208c] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  disabled={props.disabled}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              ) : (
                <span class="select-none px-2 text-xs text-gray-400">...</span>
              )
            }
          </For>
          <button
            type="button"
            class="h-8 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={props.disabled || !canGoNext()}
            onClick={() => goToPage(currentPage() + 1)}
          >
            Next
          </button>
        </div>
        <div class="flex items-center gap-1 text-xs text-gray-600">
          <span>Go to</span>
          <input
            value={pageInput()}
            onInput={(event) => setPageInput(event.currentTarget.value)}
            type="number"
            min={1}
            max={totalPages()}
            disabled={props.disabled || totalPages() <= 1}
            class="h-8 w-16 rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
            onKeyUp={(event) => {
              if (event.key === "Enter") handlePageInput();
            }}
            onBlur={handlePageInput}
          />
          <button
            type="button"
            class="h-8 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={props.disabled || totalPages() <= 1}
            onClick={handlePageInput}
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderInvoiceInline(props: {
  order: Pick<OrderItem, "orderId" | "total" | "currency" | "lines">;
  onClose: () => void;
}) {
  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500">Order</div>
          <div class="text-lg font-semibold">{props.order.orderId}</div>
        </div>
        <button
          type="button"
          onClick={props.onClose}
          class="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
        >
          Close
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full border border-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left">Item</th>
              <th class="px-3 py-2 text-right">Qty</th>
              <th class="px-3 py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.order.lines}>
              {(line) => (
                <tr class="border-t">
                  <td class="px-3 py-2">{line.productName}</td>
                  <td class="px-3 py-2 text-right">{line.quantity}</td>
                  <td class="px-3 py-2 text-right">
                    {formatPrice(line.price * line.quantity)}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td class="px-3 py-2 font-semibold">Total</td>
              <td />
              <td class="px-3 py-2 text-right font-semibold">
                {formatPrice(props.order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
