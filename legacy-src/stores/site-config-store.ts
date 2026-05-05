import { createSignal, onCleanup } from "solid-js";
import { getStoreSiteConfigAction } from "@repo/graphql";
import { createStore } from "zustand/vanilla";

type SiteConfig = Awaited<ReturnType<typeof getStoreSiteConfigAction>>;

type SiteConfigState = {
  config: SiteConfig | null;
  isLoading: boolean;
  errorMessage: string;
  siteName: string;
  setConfig: (config: SiteConfig | null) => void;
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (message: string) => void;
};

function resolveSiteName(config: SiteConfig | null) {
  return (
    config?.adminManaged.siteName?.trim() ||
    config?.adminManaged.legalBusinessName?.trim() ||
    config?.adminManaged.primaryDomain?.trim() ||
    config?.adminManaged.canonicalDomain?.trim() ||
    "ankur.store"
  );
}

export const siteConfigStore = createStore<SiteConfigState>((set) => ({
  config: null,
  isLoading: false,
  errorMessage: "",
  siteName: "ankur.store",
  setConfig: (config) => set({ config, siteName: resolveSiteName(config) }),
  setIsLoading: (value) => set({ isLoading: value }),
  setErrorMessage: (message) => set({ errorMessage: message }),
}));

let siteConfigPromise: Promise<SiteConfig | null> | null = null;

export function loadSiteConfig() {
  if (typeof window === "undefined") {
    return Promise.resolve<SiteConfig | null>(siteConfigStore.getState().config);
  }

  if (!siteConfigPromise) {
    siteConfigStore.getState().setIsLoading(true);
    siteConfigPromise = getStoreSiteConfigAction()
      .then((config) => {
        siteConfigStore.getState().setConfig(config);
        siteConfigStore.getState().setErrorMessage("");
        return config;
      })
      .catch((error) => {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : "Site config load failed.";
        siteConfigStore.getState().setErrorMessage(message);
        return null;
      })
      .finally(() => {
        siteConfigStore.getState().setIsLoading(false);
        siteConfigPromise = null;
      });
  }

  return siteConfigPromise;
}

export function useSiteConfigStore<T>(selector: (state: SiteConfigState) => T) {
  const [selected, setSelected] = createSignal(selector(siteConfigStore.getState()));
  const unsubscribe = siteConfigStore.subscribe((state) => {
    setSelected(() => selector(state));
  });

  onCleanup(unsubscribe);

  return selected;
}
