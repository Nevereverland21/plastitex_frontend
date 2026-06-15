'use client';

import { X, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCartStore, getItemUnitPrice, itemExtrasCost } from '@/store/cartStore';
import Link from 'next/link';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  const total = totalPrice();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl
                    flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Tu carrito</h2>
          <button onClick={closeCart}
            aria-label="Cerrar carrito"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => {
              const { product, quantity, selected_extras } = item;
              const price = getItemUnitPrice(item);
              const lineTotal = price * quantity + itemExtrasCost(item);
              return (
                <div key={product.id}
                  className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">

                  {/* Imagen */}
                  <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>

                    {/* Precio unitario */}
                    <p className="text-sm text-brand-navy font-semibold mt-0.5">
                      S/ {price.toFixed(2)} c/u
                    </p>

                    {/* Extras si los tiene */}
                    {selected_extras && selected_extras.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        + {selected_extras.map((e) => e.name).join(', ')}
                      </p>
                    )}

                    {/* Cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Reducir cantidad"
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300
                                   flex items-center justify-center text-sm font-bold transition-colors">
                        −
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Aumentar cantidad"
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300
                                   flex items-center justify-center text-sm font-bold transition-colors">
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button onClick={() => removeItem(product.id)}
                      aria-label="Eliminar producto del carrito"
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <p className="text-sm font-bold text-brand-navy">
                      S/ {lineTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Total estimado</span>
              <span className="text-xl font-bold text-brand-navy">
                S/ {total.toFixed(2)}
              </span>
            </div>
            <Link href="/checkout" onClick={closeCart}
              className="block w-full bg-brand-navy hover:bg-brand-orange text-white
                         text-center py-3 rounded-full font-semibold text-sm
                         transition-all duration-200 hover:scale-105">
              Proceder al pago
            </Link>
          </div>
        )}
      </div>
    </>
  );
}