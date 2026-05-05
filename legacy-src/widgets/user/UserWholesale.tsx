import { createSignal, For, Show } from "solid-js";
import { Icon } from "solid-heroicons";
import { check, checkCircle, exclamationCircle } from "solid-heroicons/outline";
import { formatPrice } from "../../lib/theme";
import {
  loadUserWholesaleData,
  type WholesaleNoteField,
  type WholesalePackage,
} from "../../lib/user-wholesale";

type WholesaleData = ReturnType<typeof loadUserWholesaleData>;

const metricCards = [
  { title: "Purchase", key: "totalPurchase", tone: "text-[#8e208c]" },
  { title: "Balance", key: "totalBalance", tone: "text-red-500" },
  { title: "Cashback", key: "totalCashbackBalance", tone: "text-[#8e208c]" },
  { title: "Gift Card", key: "totalGiftCardBalance", tone: "text-[#8e208c]" },
  { title: "Reward Point", key: "totalRewardPoints", tone: "text-[#8e208c]" },
] as const;

export function UserWholesale(props: { data: WholesaleData }) {
  const [showRequest] = createSignal(props.data.state.showRequest);
  const [note, setNote] = createSignal<WholesaleNoteField[]>(props.data.note);
  const customer = () => props.data.customer;
  const processing = () =>
    customer().ordersPlaced +
    customer().ordersConfirmed +
    customer().ordersShipment +
    customer().ordersPackaging;
  const hasRequested = () =>
    customer().customerTypes.includes(3) && !props.data.state.isWholesale;

  return (
    <div>
      <PageHeading title={props.data.page.title} copy={props.data.page.description} />

      <Show
        when={!props.data.state.isLoading}
        fallback={<p class="text-sm text-gray-500">{props.data.page.loadingText}</p>}
      >
        <Show
          when={props.data.state.isActive && props.data.state.isWholesale}
          fallback={
            <div>
              <ProductPackageList items={props.data.packages} />

              <Show when={showRequest()}>
                <div class="mt-4 space-y-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm">
                  <WholesaleDetailsForm note={note()} onChange={setNote} />
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={props.data.state.saving}
                      class="h-10 rounded-sm bg-[#8e208c] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {hasRequested() ? "Requested" : "Request for wholesale"}
                    </button>
                    <Show when={hasRequested()}>
                      <button
                        type="button"
                        disabled={props.data.state.saving}
                        class="h-10 rounded-sm bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </Show>
                  </div>
                </div>
              </Show>
            </div>
          }
        >
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-5">
              <For each={metricCards}>
                {(card) => (
                  <MetricCard
                    title={card.title}
                    value={formatPrice(customer()[card.key])}
                    tone={card.tone}
                  />
                )}
              </For>
              <MetricCard title="Order pending" value={String(customer().ordersPending)} />
              <MetricCard title="Processing" value={String(processing())} />
              <MetricCard title="Cancel" value={String(customer().ordersCancelled)} />
              <MetricCard title="Returned" value={String(customer().ordersReturned)} tone="text-red-500" />
              <MetricCard title="Delivered" value={String(customer().ordersDelivered)} tone="text-green-500" />
            </div>

            <WholesaleDetailsForm note={note()} onChange={setNote} />

            <div class="flex justify-end">
              <button
                type="button"
                disabled={props.data.state.saving}
                class="rounded-sm bg-[#8e208c] px-6 py-3 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {props.data.state.saving ? "Saving..." : "Update wholesale profile"}
              </button>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}

function PageHeading(props: { title: string; copy: string }) {
  return (
    <div class="mb-8 flex w-full items-center justify-between">
      <div class="w-full sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">{props.title}</h1>
        <p class="mt-2 text-sm text-gray-700">{props.copy}</p>
      </div>
    </div>
  );
}

function MetricCard(props: { title: string; value: string; tone?: string }) {
  return (
    <div class="rounded-sm border border-gray-200 bg-white px-3 py-3 text-center shadow-sm">
      <p class="text-sm text-gray-900">{props.title}</p>
      <p class={`mt-1 text-sm font-semibold ${props.tone ?? "text-[#8e208c]"}`}>
        {props.value}
      </p>
    </div>
  );
}

function WholesaleDetailsForm(props: {
  note: WholesaleNoteField[];
  onChange: (next: WholesaleNoteField[]) => void;
}) {
  return (
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">User Details</h3>
        <p class="text-sm text-gray-600">
          Provide valid information to process your wholesale request.
        </p>
      </div>
      <For each={props.note}>
        {(item) => (
          <div class="relative rounded-sm border border-gray-300 px-3 py-3 focus-within:border-[#8e208c] focus-within:ring-1 focus-within:ring-[#8e208c]">
            <label class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">
              {item.title}
            </label>
            <input
              value={item.value}
              type={item.type}
              name={item.key}
              placeholder={item.placeholder}
              autocomplete="off"
              onInput={(event) => {
                const value = event.currentTarget.value.trimStart();
                props.onChange(
                  props.note.map((entry) =>
                    entry.key === item.key ? { ...entry, value } : entry,
                  ),
                );
              }}
              class="block w-full border-0 bg-transparent p-0 pr-8 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-0"
            />
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <Icon
                path={item.value.trim().length < 4 ? exclamationCircle : checkCircle}
                class={`h-5 w-5 ${
                  item.value.trim().length < 4 ? "text-red-500" : "text-green-500"
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

function ProductPackageList(props: { items: WholesalePackage[] }) {
  return (
    <Show when={props.items.length > 0}>
      <div class="w-full">
        <div class="py-2 text-sm font-bold text-gray-900">
          Purchase any of the following products to continue
        </div>
        <div>
          <For each={props.items}>
            {(product) => (
              <div class="cursor-pointer">
                <div class="mx-auto mt-4 max-w-2xl rounded-sm border border-gray-200 bg-white shadow-sm lg:mx-0 lg:flex lg:max-w-none">
                  <div class="p-6 lg:flex-auto">
                    <h3 class="text-2xl font-bold text-gray-900">{product.title}</h3>
                    <p class="mt-6 text-base leading-7 text-gray-600">
                      {product.translation ?? product.description}
                    </p>
                    <div class="mt-10 flex items-center gap-x-4">
                      <h4 class="flex-none text-sm font-semibold leading-6 text-[#8e208c]">
                        What's included
                      </h4>
                      <div class="h-px flex-auto bg-gray-100" />
                    </div>
                    <ul class="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600">
                      <For each={product.features}>
                        {(item) => (
                          <li class="flex gap-x-3">
                            <Icon path={check} class="h-6 w-5 flex-none text-[#8e208c]" />
                            <span>
                              {item.key}: {item.value}
                            </span>
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>
                  <div class="flex justify-end p-2 lg:w-full lg:max-w-md lg:flex-shrink-0">
                    <div class="ml-auto w-full rounded-sm bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                      <div class="mx-auto max-w-xs px-8">
                        <p class="text-base font-semibold text-gray-600">
                          {product.subTitle ?? ""}
                        </p>
                        <p class="mt-6 flex items-baseline justify-center gap-x-2">
                          <span class="text-5xl font-bold text-gray-900">
                            {product.price}
                          </span>
                          <span class="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                            {product.currency}
                          </span>
                        </p>
                        <button
                          type="button"
                          class="mt-10 block w-full rounded-sm bg-[#8e208c] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Get access
                        </button>
                        <p class="mt-6 text-xs leading-5 text-gray-600">
                          Invoices and receipts available for easy company reimbursement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
