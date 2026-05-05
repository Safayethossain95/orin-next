import { For, Show, createMemo } from "solid-js";
import { useI18n } from "../../lib/i18n";

type PaginationControlsProps = {
  total: number;
  page: number;
  first: number;
  firstOptions?: number[];
  onPageChange: (page: number) => void;
  onFirstChange: (first: number) => void;
};

export function PaginationControls(props: PaginationControlsProps) {
  const { t } = useI18n();
  const firstOptions = createMemo(() => props.firstOptions ?? [15, 30, 50, 100]);
  const pageCount = createMemo(() =>
    Math.max(1, Math.ceil(props.total / props.first)),
  );
  const currentPage = createMemo(() =>
    Math.min(Math.max(1, props.page), pageCount()),
  );
  const startItem = createMemo(() =>
    props.total === 0 ? 0 : (currentPage() - 1) * props.first + 1,
  );
  const endItem = createMemo(() =>
    Math.min(currentPage() * props.first, props.total),
  );
  const pages = createMemo(() => {
    const count = pageCount();
    const current = currentPage();
    const start = Math.max(1, current - 1);
    const end = Math.min(count, current + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  const goToPage = (page: number) => {
    props.onPageChange(Math.min(Math.max(1, page), pageCount()));
  };

  return (
    <div class="mt-2 flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <span>
        {t("pagination.showing", {
          start: startItem(),
          end: endItem(),
          total: props.total,
        })}
      </span>

      <div class="flex flex-wrap items-center gap-2">
        <span>{t("pagination.itemsPerPage")}</span>
        <select
          class="h-9 rounded border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#8e208c]"
          value={props.first}
          onChange={(event) =>
            props.onFirstChange(Number(event.currentTarget.value))
          }
        >
          <For each={firstOptions()}>
            {(option) => <option value={option}>{option}</option>}
          </For>
        </select>
        <button
          type="button"
          class="h-9 rounded border border-gray-200 px-3 text-slate-700 transition hover:border-[#8e208c] hover:text-[#8e208c] disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:border-gray-200"
          disabled={currentPage() <= 1}
          onClick={() => goToPage(currentPage() - 1)}
        >
          {t("pagination.prev")}
        </button>
        <Show when={pages()[0] > 1}>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded border border-gray-200 text-slate-700 transition hover:border-[#8e208c] hover:text-[#8e208c]"
            onClick={() => goToPage(1)}
          >
            1
          </button>
        </Show>
        <Show when={pages()[0] > 2}>
          <span class="px-1 text-slate-400">...</span>
        </Show>
        <For each={pages()}>
          {(page) => (
            <button
              type="button"
              class={`flex h-9 w-9 items-center justify-center rounded border transition ${
                page === currentPage()
                  ? "border-[#8e208c] bg-[#8e208c] text-white"
                  : "border-gray-200 text-slate-700 hover:border-[#8e208c] hover:text-[#8e208c]"
              }`}
              aria-current={page === currentPage() ? "page" : undefined}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          )}
        </For>
        <Show when={pages()[pages().length - 1] < pageCount() - 1}>
          <span class="px-1 text-slate-400">...</span>
        </Show>
        <Show when={pages()[pages().length - 1] < pageCount()}>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded border border-gray-200 text-slate-700 transition hover:border-[#8e208c] hover:text-[#8e208c]"
            onClick={() => goToPage(pageCount())}
          >
            {pageCount()}
          </button>
        </Show>
        <button
          type="button"
          class="h-9 rounded border border-gray-200 px-3 text-slate-700 transition hover:border-[#8e208c] hover:text-[#8e208c] disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:border-gray-200"
          disabled={currentPage() >= pageCount()}
          onClick={() => goToPage(currentPage() + 1)}
        >
          {t("pagination.next")}
        </button>
      </div>
    </div>
  );
}
