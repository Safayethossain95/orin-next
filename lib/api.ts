import type { ApiResponse, AuthUser } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://orin-ecom-backend.vercel.app/api/v1";
const TOKEN_KEY = "orin-next.access-token";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export async function login(payload: { email: string; password: string }) {
  const response = await apiRequest<{ token: string; user: AuthUser }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  if (response.data?.token) setStoredToken(response.data.token);
  return response.data?.user ?? null;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const response = await apiRequest<{ token: string; user: AuthUser }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  if (response.data?.token) setStoredToken(response.data.token);
  return response.data?.user ?? null;
}

export async function currentUser() {
  const response = await apiRequest<{ user: AuthUser }>("/auth/me");
  return response.data?.user ?? null;
}

export async function logout() {
  await apiRequest("/auth/logout", { method: "POST" }).catch(() => null);
  clearStoredToken();
}

export async function createOrder(payload: {
  name: string;
  address: string;
  phone: string;
  items: any;
  subtotal: number;
  shipping: any;
  total: number;
  createdAt: string;
}) {
  const bodyPayload = {
    ...payload,
    shippingAddress: {
      street: payload.address,
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  };

  const response = await apiRequest<{ orderId: string }>("/orders/create-order", {
    method: "POST",
    body: JSON.stringify(bodyPayload)
  });
  return response.data?.orderId ?? null;
}
