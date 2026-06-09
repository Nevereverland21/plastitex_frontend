'use client';

import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import type { CartItem } from '@/types';
import { formatPrice } from '@/lib/formatters';

interface OrderSummaryProps {
  items: CartItem[];
  isBuyNow?: boolean;
}

export default function OrderSummary({ items, isBuyNow }: OrderSummaryProps) {
  const subtotal = items.reduce((acc, i) => {
    const price = parseFloat(i.unit_price_override ?? i.product.base_price);
    return acc + price * i.quantity;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <ShoppingBag size={15} className="text-brand-navy" />
        <h2 className="text-sm font-bold text-brand-navy">
          {isBuyNow ? 'Comprando ahora' : 'Tu pedido'}
        </h2>
        <span className="ml-auto text-xs font-semibold text-gray-400">
          {items.reduce((a, i) => a + i.quantity, 0)} uds
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map(({ product, quantity, unit_price_override, customization_notes }) => {
          const price = parseFloat(unit_price_override ?? product.base_price);
          return (
            <div key={product.id} className="flex gap-3 items-center px-5 py-3.5">
              {/* Imagen */}
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                {product.image
                  ? <Image src={product.image} alt={product.name} width={44} height={44} className="w-full h-full object-contain p-1" />
                  : <div className="w-full h-full bg-gray-100" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {quantity} uds · S/ {formatPrice(price)} c/u
                </p>
                {customization_notes && (
                  <p className="text-[10px] text-brand-orange mt-0.5 truncate">
                    ✦ {customization_notes}
                  </p>
                )}
              </div>

              {/* Subtotal */}
              <p className="text-xs font-bold text-brand-navy shrink-0">
                S/ {formatPrice(price * quantity)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Subtotal</span>
          <span className="text-xs font-semibold text-brand-navy">S/ {formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Delivery</span>
          <span className="text-xs font-semibold text-emerald-600">Por coordinar</span>
        </div>
        <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
          <span className="text-sm font-bold text-brand-navy">Total</span>
          <span className="text-lg font-black text-brand-navy">S/ {formatPrice(subtotal)}</span>
        </div>
        <p className="text-[10px] text-gray-400 text-center pt-1">Precio sin IGV</p>
      </div>
    </div>
  );
}