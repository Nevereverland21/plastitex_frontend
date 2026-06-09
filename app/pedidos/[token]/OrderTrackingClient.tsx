'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { getOrderByToken } from '@/lib/api';
import type { PublicOrder } from '@/types';
import DeliveryStepper from './components/DeliveryStepper';
import PickupTimeline from './components/PickupTimeline';
import OrderSummaryCard from './components/OrderSummaryCard';
import CancelledBanner from './components/CancelledBanner';

interface OrderTrackingClientProps {
  initialOrder: PublicOrder;
}

export default function OrderTrackingClient({ initialOrder }: OrderTrackingClientProps) {
  const [order, setOrder] = useState<PublicOrder>(initialOrder);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await getOrderByToken(order.public_token);
      if (updated) {
        setOrder(updated);
        setLastUpdated(new Date());
      }
    } catch {
      // Silencioso: si falla el polling, seguimos con los datos actuales
    } finally {
      setIsRefreshing(false);
    }
  }, [order.public_token]);

  // Polling cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Seguimiento de pedido</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Última actualización: {lastUpdated.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            aria-label="Actualizar estado del pedido"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Estado cancelado */}
        {order.status === 'cancelled' && (
          <div className="mb-6">
            <CancelledBanner updatedAt={order.updated_at} />
          </div>
        )}

        {/* Dos columnas en desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Columna izquierda: Progreso (timeline/stepper) */}
          <div className="lg:col-span-3">
            {order.status !== 'cancelled' && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                {order.delivery_type === 'delivery' ? (
                  <DeliveryStepper status={order.status} orderType={order.order_type} />
                ) : (
                  <PickupTimeline
                    status={order.status}
                    orderType={order.order_type}
                    storeLocation={order.store_location}
                    updatedAt={order.updated_at}
                  />
                )}
              </div>
            )}
          </div>

          {/* Columna derecha: Resumen */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <OrderSummaryCard order={order} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
