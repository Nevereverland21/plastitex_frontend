import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductDetail, ProductExtra } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product | ProductDetail, options?: {
    quantity?: number;
    unit_price?: string;
    unit_price_override?: string;
    selected_extras?: ProductExtra[];
    customization_notes?: string;
  }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export function getItemUnitPrice(item: CartItem): number {
  if (item.unit_price) {
    return parseFloat(item.unit_price);
  }
  if (item.unit_price_override) {
    return parseFloat(item.unit_price_override);
  }
  return parseFloat(item.product.base_price);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, options = {}) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        const currentQty = existing?.quantity ?? 0;
        const addQty = options.quantity ?? 1;

        if (currentQty >= product.stock && product.stock > 0) return;

        const unitPrice = options.unit_price ?? options.unit_price_override ?? undefined;

        if (existing && !unitPrice) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + addQty, product.stock || 9999) }
                : i
            ),
          });
        } else {
          const newItem: CartItem = {
            product,
            quantity: addQty,
            unit_price: unitPrice,
            unit_price_override: options.unit_price_override,
            selected_extras: options.selected_extras,
            customization_notes: options.customization_notes,
          };
          set({ items: [...items.filter(i => i.product.id !== product.id), newItem] });
        }

        set({ isOpen: true });
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const item = get().items.find((i) => i.product.id === productId);
        if (item && item.product.stock > 0 && quantity > item.product.stock) return;

        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((acc, i) => {
          const price = getItemUnitPrice(i);
          return acc + price * i.quantity;
        }, 0),
    }),
    { name: 'plastitex-cart' }
  )
);