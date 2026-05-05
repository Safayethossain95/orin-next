import { createSignal, onCleanup } from "solid-js";
import { getAuthMeAction, type AuthMeQuery } from "@repo/graphql";
import { createStore } from "zustand/vanilla";

export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_TOKENS_KEY = "system.auth.tokens";
const AUTH_TOKENS_BACKUP_KEY = "system.auth.tokens.v1";
const AUTH_SESSION_KEY = "orin.auth.session";

export type RuntimeAuthConfig = {
  isAuthenticated?: boolean;
  loginPath?: string;
  authenticatedPath?: string;
};

export type AuthUser = AuthMeQuery["auth_me"];

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loginPath: string;
  authenticatedPath: string;
  isCheckingSession: boolean;
  setAuth: (auth: RuntimeAuthConfig) => void;
  setUser: (user: AuthUser | null) => void;
  setIsCheckingSession: (value: boolean) => void;
  signIn: (user?: AuthUser | null) => void;
  signOut: () => void;
};

type StoredAuthTokens = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  tokenType?: string;
  token_type?: string;
  accessExpiresIn?: number;
  access_expires_in?: number;
  refreshExpiresIn?: number;
  refresh_expires_in?: number;
};

function normalizeStoredAuthTokens(tokens: StoredAuthTokens) {
  return {
    accessToken: tokens.accessToken ?? tokens.access_token,
    refreshToken: tokens.refreshToken ?? tokens.refresh_token,
    tokenType: tokens.tokenType ?? tokens.token_type,
    accessExpiresIn: tokens.accessExpiresIn ?? tokens.access_expires_in,
    refreshExpiresIn: tokens.refreshExpiresIn ?? tokens.refresh_expires_in,
  };
}

function encodeStorageValue(value: string) {
  return window.btoa(encodeURIComponent(value));
}

function decodeStorageValue(value: string) {
  return decodeURIComponent(window.atob(value));
}

function readJsonAccessToken(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const tokens = normalizeStoredAuthTokens(JSON.parse(raw) as StoredAuthTokens);
    return tokens.accessToken?.trim() || null;
  } catch {
    return null;
  }
}

function readJsonHasAuthToken(raw: string | null) {
  if (!raw) {
    return false;
  }

  try {
    const tokens = normalizeStoredAuthTokens(JSON.parse(raw) as StoredAuthTokens);
    return Boolean(tokens.accessToken?.trim() || tokens.refreshToken?.trim());
  } catch {
    return false;
  }
}

function readEncodedJsonAccessToken(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    return readJsonAccessToken(decodeStorageValue(raw));
  } catch {
    return null;
  }
}

function readEncodedJsonHasAuthToken(raw: string | null) {
  if (!raw) {
    return false;
  }

  try {
    return readJsonHasAuthToken(decodeStorageValue(raw));
  } catch {
    return false;
  }
}

function hasStoredAuthSessionFlag() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(AUTH_SESSION_KEY) === "1" ||
    window.sessionStorage.getItem(AUTH_SESSION_KEY) === "1"
  );
}

export function readStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    readJsonAccessToken(window.localStorage.getItem(AUTH_TOKENS_KEY)) ??
    readEncodedJsonAccessToken(window.localStorage.getItem(AUTH_TOKENS_BACKUP_KEY)) ??
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
    readJsonAccessToken(window.sessionStorage.getItem(AUTH_TOKENS_KEY)) ??
    readEncodedJsonAccessToken(window.sessionStorage.getItem(AUTH_TOKENS_BACKUP_KEY))
  );
}

export function hasStoredAuthSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(readStoredAccessToken()) ||
    readJsonHasAuthToken(window.localStorage.getItem(AUTH_TOKENS_KEY)) ||
    readEncodedJsonHasAuthToken(window.localStorage.getItem(AUTH_TOKENS_BACKUP_KEY)) ||
    readJsonHasAuthToken(window.sessionStorage.getItem(AUTH_TOKENS_KEY)) ||
    readEncodedJsonHasAuthToken(window.sessionStorage.getItem(AUTH_TOKENS_BACKUP_KEY)) ||
    hasStoredAuthSessionFlag();
}

function persistAuthSessionFlag() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, "1");
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function persistAuthTokens(tokens: StoredAuthTokens) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedTokens = normalizeStoredAuthTokens(tokens);

  if (!normalizedTokens.accessToken) {
    persistAuthSessionFlag();
    return;
  }

  const rawTokens = JSON.stringify(normalizedTokens);
  window.localStorage.setItem(ACCESS_TOKEN_KEY, normalizedTokens.accessToken);
  window.localStorage.setItem(AUTH_TOKENS_KEY, rawTokens);
  window.localStorage.setItem(AUTH_TOKENS_BACKUP_KEY, encodeStorageValue(rawTokens));
  persistAuthSessionFlag();
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_TOKENS_KEY);
  window.sessionStorage.removeItem(AUTH_TOKENS_BACKUP_KEY);
}

export function clearStoredAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_TOKENS_KEY);
  window.localStorage.removeItem(AUTH_TOKENS_BACKUP_KEY);
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_TOKENS_KEY);
  window.sessionStorage.removeItem(AUTH_TOKENS_BACKUP_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export const authStore = createStore<AuthState>((set) => ({
  isAuthenticated: hasStoredAuthSession(),
  user: null,
  loginPath: "/login",
  authenticatedPath: "/",
  isCheckingSession: false,
  setAuth: (auth) =>
    set((state) => ({
      isAuthenticated: auth.isAuthenticated ?? state.isAuthenticated,
      loginPath: auth.loginPath ?? state.loginPath,
      authenticatedPath: auth.authenticatedPath ?? state.authenticatedPath,
    })),
  setUser: (user) => set({ user }),
  setIsCheckingSession: (value) => set({ isCheckingSession: value }),
  signIn: (user) => {
    persistAuthSessionFlag();
    set({
      isAuthenticated: true,
      ...(user !== undefined ? { user } : {}),
    });
  },
  signOut: () => {
    clearStoredAuthTokens();
    set({ isAuthenticated: false, user: null });
  },
}));

let refreshSessionPromise: Promise<AuthUser | null> | null = null;

export function refreshAuthSession(options: { clearOnFailure?: boolean } = {}) {
  if (typeof window === "undefined") {
    return Promise.resolve<AuthUser | null>(null);
  }

  const clearOnFailure = options.clearOnFailure ?? true;

  if (!refreshSessionPromise) {
    authStore.getState().setIsCheckingSession(true);
    refreshSessionPromise = getAuthMeAction()
      .then((user) => {
        if (user) {
          authStore.getState().signIn(user);
          return user;
        }

        if (clearOnFailure) {
          authStore.getState().signOut();
        }
        return null;
      })
      .catch(() => {
        if (clearOnFailure) {
          authStore.getState().signOut();
        }
        return null;
      })
      .finally(() => {
        authStore.getState().setIsCheckingSession(false);
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

export function initializeAuthStore(auth?: RuntimeAuthConfig) {
  const hasStoredSession = hasStoredAuthSession();
  authStore.getState().setAuth({
    ...auth,
    isAuthenticated: hasStoredSession ? true : auth?.isAuthenticated,
  });
}

export function useAuthStore<T>(selector: (state: AuthState) => T) {
  const [selected, setSelected] = createSignal(selector(authStore.getState()));
  const unsubscribe = authStore.subscribe((state) => {
    setSelected(() => selector(state));
  });

  onCleanup(unsubscribe);

  return selected;
}
