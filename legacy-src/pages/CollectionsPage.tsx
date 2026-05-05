import {
  getStoreCollectionsAction,
  type StoreCollectionsQuery,
} from "@repo/graphql";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import { loadMenuData } from "../lib/home";
import { useI18n } from "../lib/i18n";
import { theme } from "../lib/theme";
import { PaginationControls } from "../widgets/category-filter/PaginationControls";
import { Footer } from "../widgets/footer/Footer";
import { NavBar } from "../widgets/navbar/NavBar";

const menu = loadMenuData();
const filterTheme = theme.categoryFilter;
const LOAD_LIMIT = 100;
const FIRST_OPTIONS = [4, 8, 12, 24];
const COLLECTION_GRID_TWO_ROWS = 4;

type StoreCollection = StoreCollectionsQuery["store_collections"]["items"][number];

type CollectionCard = {
  id: string;
  title: string;
  image: string;
  detailPath: string;
};

function mapCollectionCard(collection: StoreCollection): CollectionCard | null {
  const image = collection.mediaUrl?.trim();

  if (!image) {
    return null;
  }

  return {
    id: String(collection.id),
    title: collection.title,
    image,
    detailPath: `/collection/${collection.slug || "collection"}/${collection.id}/`,
  };
}

function parseQueryInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback;
}

export function CollectionsPage() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [collections, setCollections] = createSignal<CollectionCard[]>([]);
  const [loading, setLoading] = createSignal(true);
  const query = createMemo(() => new URLSearchParams(location.search));
  const currentPage = createMemo(() => parseQueryInt(query().get("page"), 1));
  const first = createMemo(() => parseQueryInt(query().get("first"), 4));
  const paginatedCollections = createMemo(() => {
    const rows = collections();
    const page = Math.min(
      currentPage(),
      Math.max(1, Math.ceil(rows.length / first())),
    );
    const start = (page - 1) * first();

    return rows.slice(start, start + first());
  });

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const nextQuery = new URLSearchParams(location.search);

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        nextQuery.set(key, value);
      } else {
        nextQuery.delete(key);
      }
    }

    const queryString = nextQuery.toString();
    void navigate(
      `${location.pathname}${queryString ? `?${queryString}` : ""}`,
      {
        replace: true,
      },
    );
  };

  onMount(async () => {
    try {
      const response = await getStoreCollectionsAction({
        input: {
          limit: LOAD_LIMIT,
          offset: 0,
          q: undefined,
          status: "active",
          visibility: "public",
          includeUnpublished: false,
        },
      });

      setCollections(
        (response?.items ?? []).map(mapCollectionCard).filter(Boolean),
      );
    } catch (error) {
      console.log("Unable to load collections.", error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class={`${theme.page} flex flex-col`}>
      <NavBar menu={menu} />

      <div class="flex min-h-screen flex-col">
        <main class="flex flex-1 flex-col bg-white pb-[60px] pt-10">
          <div class={`${filterTheme.wrap} flex-1`}>
            <section class="flex w-full flex-col">
              <h1 class="mb-6 text-center text-3xl font-bold text-slate-950">
                {t("collection.all")}
              </h1>

              <Show
                when={!loading()}
                fallback={
                  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <For each={Array.from({ length: 4 })}>
                      {(_, index) => (
                        <div
                          class="aspect-[3.25/1] w-full animate-pulse rounded-sm bg-slate-100"
                          aria-label={t("collection.loading", { number: index() + 1 })}
                        />
                      )}
                    </For>
                  </div>
                }
              >
                <Show
                  when={collections().length > 0}
                  fallback={
                    <div class="mt-5 flex flex-1 flex-col items-center justify-center rounded-sm border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
                      <h2 class="text-lg font-semibold text-gray-900">
                        {t("collection.noneFound")}
                      </h2>
                      <p class="mt-2 text-sm text-gray-600">
                        {t("collection.noneFoundDescription")}
                      </p>
                      <A
                        href="/"
                        class="mt-5 inline-flex rounded-sm bg-[#8e208c] px-5 py-2 text-sm font-semibold text-white!"
                      >
                        {t("checkout.browseProducts")}
                      </A>
                    </div>
                  }
                >
                  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <For each={paginatedCollections()}>
                      {(collection) => (
                        <A
                          href={collection.detailPath}
                          class="block overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm transition hover:border-gray-200"
                        >
                          <img
                            src={collection.image}
                            alt={collection.title}
                            class="aspect-[3.25/1] w-full object-cover"
                            loading="lazy"
                          />
                        </A>
                      )}
                    </For>
                  </div>
                  <Show when={collections().length > COLLECTION_GRID_TWO_ROWS}>
                    <PaginationControls
                      total={collections().length}
                      page={currentPage()}
                      first={first()}
                      firstOptions={FIRST_OPTIONS}
                      onPageChange={(page) =>
                        updateQuery({ page: String(page) })
                      }
                      onFirstChange={(nextFirst) =>
                        updateQuery({
                          first: String(nextFirst),
                          page: undefined,
                        })
                      }
                    />
                  </Show>
                </Show>
              </Show>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
