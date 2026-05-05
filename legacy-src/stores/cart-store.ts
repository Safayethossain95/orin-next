import { createSignal, onCleanup } from "solid-js";
import { createStore } from "zustand/vanilla";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  slug?: string;
  detailPath?: string;
  backendProductId?: string;
  sku?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemId: string) => void;
  setItemQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
};

export const cartStore = createStore<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((entry) => entry.id === item.id);

      if (existingItem) {
        return {
          items: state.items.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          ),
        };
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((entry) => entry.id !== itemId),
    })),
  setItemQuantity: (itemId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((entry) => entry.id !== itemId)
          : state.items.map((entry) =>
              entry.id === itemId ? { ...entry, quantity } : entry,
            ),
    })),
  clear: () => set({ items: [] }),
}));

export function useCartStore<T>(selector: (state: CartState) => T) {
  const [selected, setSelected] = createSignal(selector(cartStore.getState()));
  const unsubscribe = cartStore.subscribe((state) => {
    setSelected(() => selector(state));
  });

  onCleanup(unsubscribe);

  return selected;
}
