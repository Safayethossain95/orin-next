import {
  getStoreCampaignAction,
  getStoreProductByIdAction,
  type StoreCampaignQuery,
  type StoreProductByIdQuery,
} from "@repo/graphql";
import { A, useParams } from "@solidjs/router";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import type { CategoryFilterProduct } from "../lib/categories";
import { createProductImage, loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import { CategoryProductList } from "../widgets/category-filter/CategoryProductList";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const productPalettes = [
  { background: "#eef4ff", foreground: "#2563eb", accent: "#172554" },
  { background: "#fff5e8", foreground: "#ea580c", accent: "#7c2d12" },
  { background: "#f8e7ee", foreground: "#b42363", accent: "#5b1132" },
  { background: "#efe9ff", foreground: "#7c3aed", accent: "#312e81" },
  { background: "#edf8f0", foreground: "#16a34a", accent: "#14532d" },
];

type CampaignRecord = NonNullable<StoreCampaignQuery["store_campaign"]>;
type StoreProduct = NonNullable<StoreProductByIdQuery["store_product_by_id"]>;

function formatCountdown(endsAt: string | null | undefined) {
  const endTime = endsAt ? new Date(endsAt).getTime() : NaN;
  const remainingMs = Number.isFinite(endTime)
    ? Math.max(0, endTime - Date.now())
    : 0;
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { value: days, label: "days" },
    { value: hours, label: "hours" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function extractProductId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const id = record.id ?? record.productId ?? record.product_id;

    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }

  return null;
}

function mapProduct(product: StoreProduct, index: number): CategoryFilterProduct {
  const sellPrice = Number(
    product.price?.sellPrice ?? product.price?.basePrice ?? 0,
  );
  const comparePrice = Number(
    product.price?.compareAtPrice ?? product.price?.basePrice ?? sellPrice,
  );
  const stock = product.inventory?.availableStock ?? product.inventory?.stock ?? 0;

  return {
    id: Number.isFinite(Number(product.id)) ? Number(product.id) : index + 1,
    hid: String(product.id),
    slug: product.slug,
    title: product.title,
    translation: product.subtitle?.trim() || product.title,
    thumbnail:
      product.primaryImageUrl?.trim() ||
      createProductImage(
        product.title,
        productPalettes[index % productPalettes.length],
      ),
    categoryId: Number(product.categoryId ?? 0),
    subCategoryId: Number(product.categoryId ?? 0),
    price: sellPrice,
    comparePrice,
    currency: product.price?.currency ?? "BDT",
    rating: 0,
    ratingTotal: 0,
    quantity: stock,
    isContinueSelling: false,
    soldCount: 0,
    createdAt: product.createdAt,
    detailPath: `/product/${product.slug}/${product.id}/`,
  };
}

function LoadingState() {
  return (
    <div class="flex h-[60vh] items-center justify-center space-x-2 bg-white">
      <div class="h-4 w-4 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
      <div class="h-4 w-4 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
      <div class="h-4 w-4 animate-bounce rounded-full bg-gray-300" />
    </div>
  );
}

export function CampaignDetailsPage() {
  const params = useParams();
  const [campaign, setCampaign] = createSignal<CampaignRecord | null>(null);
  const [products, setProducts] = createSignal<CategoryFilterProduct[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [now, setNow] = createSignal(Date.now());
  const countdown = createMemo(() => {
    now();
    return formatCountdown(campaign()?.endsAt);
  });

  createEffect(() => {
    const campaignId = params.id;
    let isCurrent = true;

    setCampaign(null);
    setProducts([]);
    setError(null);

    if (!campaignId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const nextCampaign = await getStoreCampaignAction({ campaignId });

        if (!isCurrent) {
          return;
        }

        setCampaign(nextCampaign);

        const productIds = Array.from(
          new Set((nextCampaign?.targetProducts ?? []).map(extractProductId)),
        ).filter((id): id is string => Boolean(id));
        const productResponses = await Promise.all(
          productIds.map((productId) =>
            getStoreProductByIdAction({ productId }),
          ),
        );

        if (!isCurrent) {
          return;
        }

        setProducts(
          productResponses
            .filter((product): product is StoreProduct => Boolean(product))
            .map(mapProduct),
        );
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load campaign details.",
          );
          setCampaign(null);
          setProducts([]);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    })();

    onCleanup(() => {
      isCurrent = false;
    });
  });

  createEffect(() => {
    if (!campaign()?.endsAt) {
      return;
    }

    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    onCleanup(() => window.clearInterval(intervalId));
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class="bg-[#f3f4f8] pb-[60px] pt-0 sm:px-0 sm:pt-4 md:pt-0">
        <Show
          when={!loading()}
          fallback={<LoadingState />}
        >
          <Show
            when={campaign()}
            keyed
            fallback={
              <div class="flex min-h-[60vh] items-center justify-center bg-white px-6 text-center">
                <div>
                  <h1 class="text-2xl font-bold text-slate-900">
                    {error() ? "Unable to load campaign" : "Campaign not found"}
                  </h1>
                  <Show when={error()}>
                    {(message) => (
                      <p class="mt-3 max-w-xl text-sm text-slate-500">
                        {message()}
                      </p>
                    )}
                  </Show>
                  <A
                    href="/campaigns"
                    class="mt-6 inline-flex rounded-sm bg-[#8e208c] px-5 py-2.5 text-sm font-semibold !text-white"
                  >
                    Browse campaigns
                  </A>
                </div>
              </div>
            }
          >
            {(currentCampaign) => (
              <div class="mx-auto flex max-w-screen-2xl pb-5 sm:px-4">
                <div class="flex w-full gap-3">
                  <div class="min-h-[calc(100vh-94px)] w-full p-4 sm:rounded-sm md:mt-4 md:min-h-[calc(100vh-99px)] md:overflow-hidden lg:min-h-[calc(100vh-136px)]">
                    <div class="flex items-center justify-center gap-3 py-10 md:gap-5">
                      <p class="text-xl font-semibold text-slate-950">Ends in</p>
                      <div class="flex items-center gap-1 md:gap-3">
                        <For each={countdown()}>
                          {(item, index) => (
                            <>
                              <div class="grid h-12 w-12 place-items-center rounded-sm bg-[#8e208c] text-white md:h-20 md:w-20">
                                <p class="font-mono text-2xl leading-none md:pt-2 md:text-5xl">
                                  {padTime(item.value)}
                                </p>
                                <span class="text-sm leading-none">
                                  {item.label}
                                </span>
                              </div>
                              <Show when={index() < countdown().length - 1}>
                                <span class="text-2xl font-bold text-slate-950 md:text-5xl">
                                  :
                                </span>
                              </Show>
                            </>
                          )}
                        </For>
                      </div>
                    </div>

                    <Show when={currentCampaign.heroImageUrl?.trim()}>
                      {(image) => (
                        <div class="mb-8 overflow-hidden rounded-sm">
                          <img
                            src={image()}
                            alt={currentCampaign.title}
                            class="h-full max-h-[150px] w-full object-cover md:max-h-[300px]"
                          />
                        </div>
                      )}
                    </Show>

                    <CategoryProductList
                      products={products()}
                      gridClass="relative grid grid-cols-2 gap-3 pb-8 sm:grid-cols-3 lg:grid-cols-5"
                    />
                  </div>
                </div>
              </div>
            )}
          </Show>
        </Show>
      </main>

      <Footer />
    </div>
  );
}
