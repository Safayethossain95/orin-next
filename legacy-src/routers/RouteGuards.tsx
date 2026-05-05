import { Navigate, useLocation } from "@solidjs/router";
import { Show } from "solid-js";
import type { JSX } from "solid-js";
import { useAuthStore } from "../stores/auth-store";

type RouteGuardProps = {
  children: JSX.Element;
  redirectTo?: string;
};

function withReturnTo(path: string, pathname: string, search: string) {
  const returnTo = `${pathname}${search}`;
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}

export function ProtectedRoute(props: RouteGuardProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginPath = useAuthStore((state) => state.loginPath);

  return (
    <Show
      when={isAuthenticated()}
      fallback={
        <Navigate
          href={withReturnTo(
            props.redirectTo ?? loginPath(),
            location.pathname,
            location.search,
          )}
        />
      }
    >
      {props.children}
    </Show>
  );
}

export function PublicRoute(props: RouteGuardProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authenticatedPath = useAuthStore((state) => state.authenticatedPath);
  const redirectTo = () => props.redirectTo ?? authenticatedPath();
  const isAuthRoute = () =>
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/login/") ||
    location.pathname.startsWith("/register/");

  return (
    <Show
      when={
        !isAuthenticated() ||
        !isAuthRoute() ||
        redirectTo() === location.pathname
      }
      fallback={<Navigate href={redirectTo()} />}
    >
      {props.children}
    </Show>
  );
}
