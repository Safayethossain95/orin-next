import { AppRouter } from "./routers/AppRouter";
import { ToastViewport } from "./components/common/Toast";
import { RuntimeThemeProvider } from "./routers/RuntimeThemeContext";
import type { RuntimeThemeProps } from "./routers/RuntimeThemeContext";
import { initializeAuthStore } from "./stores/auth-store";
import { onMount } from "solid-js";
import { loadSiteConfig } from "./stores/site-config-store";
import { I18nProvider } from "./lib/i18n";

type AppProps = {
  routerBase?: string;
  runtimeProps?: RuntimeThemeProps;
};

function App(props: AppProps) {
  initializeAuthStore(props.runtimeProps?.auth);

  onMount(() => {
    void loadSiteConfig();
  });

  return (
    <I18nProvider>
      <RuntimeThemeProvider value={props.runtimeProps}>
        <AppRouter base={props.routerBase} />
        <ToastViewport />
      </RuntimeThemeProvider>
    </I18nProvider>
  );
}

export default App;
