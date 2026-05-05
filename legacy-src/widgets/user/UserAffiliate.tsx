import { For } from "solid-js";
import type { JSX } from "solid-js";
import { formatPrice } from "../../lib/theme";
import type {
  AffiliateMember,
  AffiliateOrder,
  AffiliatePayout,
  UserAffiliateData,
} from "../../lib/user-affiliate";

type UserAffiliateProps = {
  data: UserAffiliateData;
};

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (["active", "paid", "delivered", "confirmed"].includes(normalized)) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (["pending", "pending review", "pending payment"].includes(normalized)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized === "processing") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-700";
}

function formatStatValue(stat: UserAffiliateData["stats"][number]) {
  if (stat.unit === "money") {
    return formatPrice(stat.value);
  }

  if (stat.unit === "percent") {
    return `${stat.value}%`;
  }

  return String(stat.value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function UserAffiliate(props: UserAffiliateProps) {
  const summary = () => props.data.summary;

  return (
    <div class="space-y-5">
      <section class="rounded-sm border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div class="inline-flex rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-[#8e208c]">
              {summary().status}
            </div>
            <h1 class="mt-3 text-xl font-semibold text-gray-900">
              {summary().title}
            </h1>
            <p class="mt-2 max-w-2xl text-sm text-gray-600">
              {summary().description}
            </p>
          </div>

          <div class="w-full max-w-xl rounded-sm border border-gray-200 bg-gray-50 p-3">
            <p class="text-xs font-semibold uppercase text-gray-500">
              Referral Link
            </p>
            <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code class="min-w-0 flex-1 truncate rounded-sm bg-white px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-200">
                {summary().referralUrl}
              </code>
              <span class="rounded-sm bg-[#8e208c] px-3 py-2 text-center text-xs font-semibold text-white">
                {summary().referralCode}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-3">
          <BalanceCard label="Available Balance" value={summary().availableBalance} />
          <BalanceCard label="Pending Commission" value={summary().pendingCommission} />
          <BalanceCard label="Lifetime Commission" value={summary().lifetimeCommission} />
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <For each={props.data.stats}>
          {(stat) => (
            <div class="rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-medium uppercase text-gray-500">
                {stat.label}
              </p>
              <p class="mt-2 text-2xl font-bold text-gray-900">
                {formatStatValue(stat)}
              </p>
              <p class="mt-1 text-xs text-gray-500">{stat.trend}</p>
            </div>
          )}
        </For>
      </section>

      <AffiliateMembersTable members={props.data.members} />
      <AffiliateOrdersTable orders={props.data.orders} />
      <AffiliatePayoutsTable payouts={props.data.payouts} />
    </div>
  );
}

function BalanceCard(props: { label: string; value: number }) {
  return (
    <div class="rounded-sm border border-purple-100 bg-purple-50/60 p-3">
      <p class="text-xs font-medium uppercase text-gray-500">{props.label}</p>
      <p class="mt-1 text-lg font-bold text-gray-900">
        {formatPrice(props.value)}
      </p>
    </div>
  );
}

function TableShell(props: { title: string; children: JSX.Element }) {
  return (
    <section class="rounded-sm border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-4 py-3">
        <h2 class="text-base font-semibold text-gray-900">{props.title}</h2>
      </div>
      <div class="overflow-x-auto">{props.children}</div>
    </section>
  );
}

function AffiliateMembersTable(props: { members: AffiliateMember[] }) {
  return (
    <TableShell title="Affiliate Members">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Joined</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Orders</th>
            <th class="px-4 py-3 text-right">Sales</th>
            <th class="px-4 py-3 text-right">Commission</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <For each={props.members}>
            {(member) => (
              <tr>
                <td class="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                <td class="px-4 py-3 text-gray-600">{member.phone}</td>
                <td class="px-4 py-3 text-gray-600">{formatDate(member.joinedAt)}</td>
                <td class="px-4 py-3">
                  <span class={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(member.status)}`}>
                    {member.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-600">{member.orders}</td>
                <td class="px-4 py-3 text-right text-gray-600">{formatPrice(member.sales)}</td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(member.commission)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </TableShell>
  );
}

function AffiliateOrdersTable(props: { orders: AffiliateOrder[] }) {
  return (
    <TableShell title="Referred Orders">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">Order</th>
            <th class="px-4 py-3">Affiliate</th>
            <th class="px-4 py-3">Customer</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-right">Commission</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <For each={props.orders}>
            {(order) => (
              <tr>
                <td class="px-4 py-3 font-medium text-gray-900">{order.orderId}</td>
                <td class="px-4 py-3 text-gray-600">{order.memberName}</td>
                <td class="px-4 py-3 text-gray-600">{order.customerName}</td>
                <td class="px-4 py-3 text-gray-600">{formatDate(order.orderedAt)}</td>
                <td class="px-4 py-3">
                  <span class={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-600">{formatPrice(order.total)}</td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(order.commission)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </TableShell>
  );
}

function AffiliatePayoutsTable(props: { payouts: AffiliatePayout[] }) {
  return (
    <TableShell title="Payout Requests">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">Request</th>
            <th class="px-4 py-3">Method</th>
            <th class="px-4 py-3">Account</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <For each={props.payouts}>
            {(payout) => (
              <tr>
                <td class="px-4 py-3 font-medium text-gray-900">{payout.requestId}</td>
                <td class="px-4 py-3 text-gray-600">{payout.method}</td>
                <td class="px-4 py-3 text-gray-600">{payout.account}</td>
                <td class="px-4 py-3 text-gray-600">{formatDate(payout.requestedAt)}</td>
                <td class="px-4 py-3">
                  <span class={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(payout.status)}`}>
                    {payout.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(payout.amount)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </TableShell>
  );
}
