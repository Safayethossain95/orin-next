import { Router } from "@solidjs/router";
import { RouterRoutes } from "./RouterRoutes";

type AppRouterProps = {
  base?: string;
};

function normalizeRouterBase(base: string) {
  const normalized = base.trim().replace(/\/+$/, "");
  return normalized || "/";
}

function resolveDefaultRouterBase() {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizeRouterBase(
    new URL(import.meta.env.BASE_URL, window.location.origin).pathname,
  );
}

export function AppRouter(props: AppRouterProps) {
  const routerBase = normalizeRouterBase(props.base ?? resolveDefaultRouterBase());

  return (
    <Router base={routerBase}>
      <RouterRoutes />
    </Router>
  );
}
