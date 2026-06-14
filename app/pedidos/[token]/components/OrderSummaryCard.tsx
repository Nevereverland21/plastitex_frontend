'use client';

import { Package, User, MapPin, Calendar, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import type { PublicOrder } from '@/types';

interface OrderSummaryCardProps {
  order: PublicOrder;
}

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <div className="space-y-6">
      {/* Header del pedido */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Pedido #{order.id}
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {order.customer_name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              order.status === 'delivered'
                ? 'bg-green-100 text-green-700'
                : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : order.status === 'ready' || order.status === 'dispatched'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
            }`}
          >
            {order.status_display}
          </span>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <Calendar size={18} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Fecha del pedido</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(order.created_at).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {order.delivery_deadline && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Truck size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Fecha estimada de entrega</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(order.delivery_deadline).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">Productos</p>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Package size={18} className="text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.product_name}</p>
                <p className="text-xs text-gray-500">{item.quantity} unidades</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatPrice(item.unit_price)}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Productos</span>
            <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
          </div>

          {order.delivery_type === 'delivery' && !order.charges_confirmed ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Costo de delivery</span>
              <span className="font-medium text-amber-600">Por confirmar</span>
            </div>
          ) : (
            parseFloat(order.delivery_cost) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Costo de delivery</span>
                <span className="font-medium text-gray-900">{formatPrice(order.delivery_cost)}</span>
              </div>
            )
          )}

          {parseFloat(order.extra_charges) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Comisión / otros cargos</span>
              <span className="font-medium text-gray-900">{formatPrice(order.extra_charges)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-1.5 mt-1">
            <span className="text-gray-900">Total</span>
            <span className="text-[#1B2B5E]">
              {order.delivery_type === 'delivery' && !order.charges_confirmed
                ? `${formatPrice(order.total)} + envío`
                : formatPrice(order.total)}
            </span>
          </div>

          {order.delivery_type === 'delivery' && !order.charges_confirmed && (
            <p className="pt-1 text-[11px] text-amber-600">
              El costo de envío se confirma por WhatsApp y se sumará al total.
            </p>
          )}
        </div>
      </div>

      {/* Datos de entrega */}
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="mb-3 text-sm font-semibold text-gray-900">Datos de entrega</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} className="shrink-0 text-gray-400" />
            {order.customer_name}
          </div>
          {order.delivery_type === 'delivery' && order.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <span>
                {order.address}
                {order.address_reference && (
                  <span className="block text-xs text-gray-400">Ref: {order.address_reference}</span>
                )}
              </span>
            </div>
          )}
          {order.delivery_type === 'pickup' && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
              Recojo en tienda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
