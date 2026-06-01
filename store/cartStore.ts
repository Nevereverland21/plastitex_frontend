import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductExtra } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, options?: {
    quantity?: number;
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

        // Validar contra stock real
        if (currentQty >= product.stock && product.stock > 0) return;

        if (existing && !options.unit_price_override) {
          // Incrementar cantidad si ya está en el carrito sin personalización especial
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + addQty, product.stock || 9999) }
                : i
            ),
          });
        } else {
          // Agregar nuevo item (o reemplazar si viene con precio override del configurador)
          const newItem: CartItem = {
            product,
            quantity: addQty,
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
          // Usar precio override si viene del configurador, si no usar base_price
          const price = i.unit_price_override
            ? parseFloat(i.unit_price_override)
            : parseFloat(i.product.base_price);
          return acc + price * i.quantity;
        }, 0),
    }),
    { name: 'plastitex-cart' }
  )
);