import { For, Show, createSignal, onCleanup } from "solid-js";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

const [toasts, setToasts] = createSignal<ToastItem[]>([]);
let nextToastId = 1;

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-800",
};

function removeToast(id: number) {
  setToasts((items) => items.filter((item) => item.id !== id));
}

function showToast(type: ToastType, message: string) {
  const id = nextToastId;
  nextToastId += 1;

  setToasts((items) => [...items, { id, type, message }].slice(-4));

  if (typeof window !== "undefined") {
    window.setTimeout(() => removeToast(id), 4200);
  }
}

export const toast = {
  success: (message: string) => showToast("success", message),
  error: (message: string) => showToast("error", message),
  info: (message: string) => showToast("info", message),
};

export function ToastViewport() {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setToasts([]);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleEscape);
    onCleanup(() => window.removeEventListener("keydown", handleEscape));
  }

  return (
    <Show when={toasts().length > 0}>
      <div
        aria-live="polite"
        aria-atomic="false"
        class="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
      >
        <For each={toasts()}>
          {(item) => (
            <div
              class={`pointer-events-auto flex items-start justify-between gap-4 rounded-sm border px-4 py-3 text-sm font-medium shadow-lg shadow-slate-900/10 ${toastStyles[item.type]}`}
              role={item.type === "error" ? "alert" : "status"}
            >
              <span>{item.message}</span>
              <button
                type="button"
                class="shrink-0 text-current opacity-60 transition hover:opacity-100"
                aria-label="Dismiss notification"
                onClick={() => removeToast(item.id)}
              >
                x
              </button>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}
