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

/**
 * Precio unitario para una cantidad, según el escalonado por tiers del
 * producto. Espeja la lógica autoritativa del backend (`Product.unit_price_for`):
 * toma el tier con mayor `min_quantity <= cantidad`, o cae a `base_price`.
 * Así el precio que ve el cliente coincide con el que el servidor cobrará.
 */
export function tierUnitPrice(product: Product | ProductDetail, quantity: number): string {
  const tiers = product.pricing_tiers ?? [];
  let best: { min_quantity: number; unit_price: string } | null = null;
  for (const t of tiers) {
    if (t.min_quantity <= quantity && (best === null || t.min_quantity > best.min_quantity)) {
      best = t;
    }
  }
  return best ? String(best.unit_price) : String(product.base_price);
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
        // Respeta el mínimo de compra del producto.
        const addQty = Math.max(options.quantity ?? 1, product.min_units ?? 1);

        if (currentQty >= product.stock && product.stock > 0) return;

        const explicitPrice = options.unit_price ?? options.unit_price_override ?? undefined;

        if (existing && !explicitPrice) {
          // Suma cantidades y RE-TARIFA según la cantidad resultante (escalonado),
          // para que el precio mostrado coincida con el que el backend cobrará.
          const newQty = Math.min(currentQty + addQty, product.stock || 9999);
          const tierPrice = tierUnitPrice(product, newQty);
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: newQty, unit_price: tierPrice, unit_price_override: tierPrice }
                : i
            ),
          });
        } else {
          // Precio explícito si vino (ej. "comprar ahora"); si no, el del tier.
          const unitPrice = explicitPrice ?? tierUnitPrice(product, addQty);
          const newItem: CartItem = {
            product,
            quantity: addQty,
            unit_price: unitPrice,
            unit_price_override: options.unit_price_override ?? unitPrice,
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
        if (!item) return;
        // No baja del mínimo de compra; se elimina con el botón de quitar.
        const q = Math.max(quantity, item.product.min_units ?? 1);
        if (item.product.stock > 0 && q > item.product.stock) return;

        // RE-TARIFA: el unitario se re-deriva del tier de la nueva cantidad.
        const tierPrice = tierUnitPrice(item.product, q);
        set({
          items: get().items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: q, unit_price: tierPrice, unit_price_override: tierPrice }
              : i
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