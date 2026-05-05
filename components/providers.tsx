"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "@/lib/api";
import type { AuthUser, Product } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  isChecking: boolean;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

type CartItem = Product & { cartQuantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (id: string | number) => void;
  clearCart: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const CartContext = createContext<CartContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    authApi
      .currentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsChecking(false));
  }, []);

  const auth = useMemo<AuthContextValue>(
    () => ({
      user,
      isChecking,
      signIn: async (payload) => {
        setUser(await authApi.login(payload));
      },
      signUp: async (payload) => {
        setUser(await authApi.register(payload));
      },
      signOut: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [isChecking, user],
  );

  const cart = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.cartQuantity, 0);
    return {
      items,
      subtotal,
      count: items.reduce((total, item) => total + item.cartQuantity, 0),
      addItem: (product) => {
        setItems((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            return current.map((item) => (item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
          }
          return [...current, { ...product, cartQuantity: 1 }];
        });
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return (
    <AuthContext.Provider value={auth}>
      <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside Providers");
  return value;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside Providers");
  return value;
}
