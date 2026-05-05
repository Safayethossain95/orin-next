import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js";
import type { RuntimeAuthConfig } from "../stores/auth-store";

export type RuntimeThemeProps = {
  auth?: RuntimeAuthConfig;
  tenant?: {
    tenantId?: string;
    siteId?: string;
    domain?: string;
    displayName?: string;
    siteConfig?: Record<string, unknown>;
    apiBaseUrl?: string;
  };
  siteConfig?: Record<string, unknown>;
  apiBaseUrl?: string;
  route?: {
    pathname?: string;
    search?: string;
    url?: string;
  };
};

const RuntimeThemeContext = createContext<RuntimeThemeProps>({});

export function RuntimeThemeProvider(props: {
  value?: RuntimeThemeProps;
  children: JSX.Element;
}) {
  return (
    <RuntimeThemeContext.Provider value={props.value ?? {}}>
      {props.children}
    </RuntimeThemeContext.Provider>
  );
}

export function useRuntimeTheme() {
  return useContext(RuntimeThemeContext) ?? {};
}
