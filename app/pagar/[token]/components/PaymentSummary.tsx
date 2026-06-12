'use client';

import { Package, Receipt } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import type { PaymentLink } from '@/types';

interface PaymentSummaryProps {
  link: PaymentLink;
}

export default function PaymentSummary({ link }: PaymentSummaryProps) {
  const isAdvance = link.link_type_value === 'advance';
  const isFull = link.link_type_value === 'full';
  const remaining = isAdvance ? link.remaining_amount : '0.00';

  const badgeLabel = isFull ? 'Pago completo' : isAdvance ? 'Pago de adelanto' : 'Pago del restante';
  const badgeClass = isFull
    ? 'bg-emerald-100 text-emerald-700'
    : isAdvance
      ? 'bg-amber-100 text-amber-700'
      : 'bg-purple-100 text-purple-700';
  const conceptLabel = isFull ? 'Pago completo (100%)' : isAdvance ? 'Adelanto (50%)' : 'Restante (50%)';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Pedido #{link.order_id}</p>
          <h2 className="mt-0.5 text-lg font-bold text-gray-900">{link.customer_name}</h2>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-2.5">
          <p className="text-xs font-semibold text-gray-700">Productos</p>
        </div>
        <div className="divide-y divide-gray-100">
          {link.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Package size={14} className="text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.product}</p>
                <p className="text-xs text-gray-500">{item.quantity} uds × {formatPrice(item.unit_price)}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desglose de pago */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-4 space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Desglose del pago</p>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total del pedido</span>
          <span className="font-medium text-gray-900">{formatPrice(link.total)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{conceptLabel}</span>
          <span className="font-semibold text-gray-900">{formatPrice(link.amount_to_pay)}</span>
        </div>

        {parseFloat(remaining) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{isAdvance ? 'Pendiente después de este pago' : 'Pagado previamente'}</span>
            <span className="font-medium text-gray-900">{formatPrice(isAdvance ? remaining : link.advance_amount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2.5 flex justify-between">
          <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Receipt size={14} />
            A pagar ahora
          </span>
          <span className="text-lg font-black text-[#1B2B5E]">{formatPrice(link.amount_to_pay)}</span>
        </div>
      </div>

      {/* Tipo de entrega */}
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-500">Tipo de entrega:</span>
        <span className="text-xs font-semibold text-gray-800">{link.delivery_type}</span>
      </div>
    </div>
  );
}
