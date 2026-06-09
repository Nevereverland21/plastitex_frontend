'use client';

import { Clock, CheckCircle2, Factory, Store, Handshake, MapPin, Phone } from 'lucide-react';
import type { OrderStatus, OrderType } from '@/types';

interface PickupTimelineProps {
  status: OrderStatus;
  orderType: OrderType;
  storeLocation: {
    name: string;
    address: string;
    schedule: string;
    phone: string;
  } | null;
  updatedAt: string;
}

const ALL_EVENTS = [
  { key: 'pending',       label: 'Pedido recibido',   icon: Clock },
  { key: 'confirmed',     label: 'Pago confirmado',   icon: CheckCircle2 },
  { key: 'in_production', label: 'En producción',     icon: Factory },
  { key: 'ready',         label: 'Listo para recojo', icon: Store },
  { key: 'delivered',     label: 'Recogido',          icon: Handshake },
] as const;

const RETAIL_EVENTS = ALL_EVENTS.filter(e =>
  ['pending', 'confirmed', 'ready', 'delivered'].includes(e.key)
);

export default function PickupTimeline({ status, orderType, storeLocation, updatedAt }: PickupTimelineProps) {
  if (status === 'cancelled') return null;

  const events = orderType === 'retail' ? RETAIL_EVENTS : ALL_EVENTS;
  const statusOrder = events.map(e => e.key) as OrderStatus[];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="w-full">
      <div className="space-y-0">
        {events.map((event, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = event.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={event.key} className="flex gap-4">
              {/* Línea + círculo */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-[#1B2B5E] bg-[#1B2B5E] text-white shadow-lg shadow-[#1B2B5E]/30'
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  <Icon size={18} />
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[40px] ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Contenido */}
              <div className="pb-8 flex-1">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-[#1B2B5E]' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {event.label}
                </p>

                {/* Info de la tienda cuando está listo para recojo */}
                {event.key === 'ready' && isCurrent && storeLocation && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
                      Sede de recojo
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Store size={16} className="mt-0.5 shrink-0 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{storeLocation.name}</p>
                          <p className="text-sm text-gray-600">{storeLocation.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="shrink-0 text-blue-500" />
                        <p className="text-sm text-gray-600">{storeLocation.schedule}</p>
                      </div>
                      {storeLocation.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="shrink-0 text-blue-500" />
                          <p className="text-sm text-gray-600">{storeLocation.phone}</p>
                        </div>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeLocation.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors"
                      >
                        <MapPin size={14} />
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>
                )}

                {/* Fecha de recojo */}
                {event.key === 'delivered' && isCompleted && (
                  <p className="mt-1 text-xs text-gray-500">
                    Recogido el {new Date(updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
