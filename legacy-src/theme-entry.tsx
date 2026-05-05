import { render } from "solid-js/web";
import "./index.css";

import App from "./App";
import type { RuntimeThemeProps } from "./routers/RuntimeThemeContext";

type RuntimeMountHandle = {
  destroy: () => void;
  unmount: () => void;
};

function renderTheme(root: HTMLElement, props?: RuntimeThemeProps): RuntimeMountHandle {
  const dispose = render(() => <App routerBase="/" runtimeProps={props} />, root);
  let disposed = false;

  const cleanup = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    dispose();
  };

  return {
    destroy: cleanup,
    unmount: cleanup,
  };
}

export function mount(root: HTMLElement, props?: RuntimeThemeProps) {
  return renderTheme(root, props);
}

export const hydrate = mount;

export default mount;
