import { A } from "@solidjs/router";
import {
  getStoreCampaignsAction,
  type StoreCampaignsQuery,
} from "@repo/graphql";
import { For, Show, createSignal, onMount } from "solid-js";
import { loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const filterTheme = theme.categoryFilter;
const PAGE_SIZE = 24;

type StoreCampaign = StoreCampaignsQuery["store_campaigns"]["items"][number];

type CampaignCard = {
  id: string;
  title: string;
  image: string;
  detailPath: string;
};

function resolveCampaignPath(campaign: StoreCampaign) {
  if (campaign.landingPageUrl?.trim()) {
    return campaign.landingPageUrl;
  }

  return `/campaign/${campaign.slug || "campaign"}/${campaign.id}/`;
}

function mapCampaignCard(campaign: StoreCampaign): CampaignCard | null {
  const image = campaign.heroImageUrl?.trim();

  if (!image) {
    return null;
  }

  return {
    id: String(campaign.id),
    title: campaign.title,
    image,
    detailPath: resolveCampaignPath(campaign),
  };
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = createSignal<CampaignCard[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const response = await getStoreCampaignsAction({
        input: {
          limit: PAGE_SIZE,
          offset: 0,
          q: undefined,
          status: "active",
          visibility: "public",
        },
      });

      setCampaigns((response?.items ?? []).map(mapCampaignCard).filter(Boolean));
    } catch (error) {
      console.log("Unable to load campaigns.", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class={theme.page}>
      <NavBar menu={menu} />

      <main class="bg-white pb-[60px] pt-10">
        <div class={filterTheme.wrap}>
          <section class="w-full">
            <h1 class="mb-6 text-center text-3xl font-bold text-slate-950">
              All Campaigns
            </h1>

            <Show
              when={!loading()}
              fallback={
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <For each={Array.from({ length: 4 })}>
                    {(_, index) => (
                      <div
                        class="aspect-[3.25/1] w-full animate-pulse rounded-sm bg-slate-100"
                        aria-label={`Loading campaign ${index() + 1}`}
                      />
                    )}
                  </For>
                </div>
              }
            >
              <Show
                when={campaigns().length > 0}
                fallback={
                  <div class="flex min-h-[50vh] items-center justify-center text-center text-base font-medium text-slate-600">
                    No campaigns found.
                  </div>
                }
              >
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <For each={campaigns()}>
                    {(campaign) => (
                      <A
                        href={campaign.detailPath}
                        class="block overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm transition hover:border-gray-200"
                      >
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          class="aspect-[3.25/1] w-full object-cover"
                          loading="lazy"
                        />
                      </A>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
