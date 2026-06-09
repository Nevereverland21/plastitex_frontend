'use client';

import { Clock, CheckCircle2, Factory, PackageCheck, Truck, PartyPopper } from 'lucide-react';
import type { OrderStatus, OrderType } from '@/types';

interface DeliveryStepperProps {
  status: OrderStatus;
  orderType: OrderType;
}

const ALL_STEPS = [
  { key: 'pending',       label: 'Pendiente',            description: 'Pedido recibido',              icon: Clock },
  { key: 'confirmed',     label: 'Confirmado',           description: 'Pago confirmado',              icon: CheckCircle2 },
  { key: 'in_production', label: 'En producción',        description: 'Fabricando tu pedido',         icon: Factory },
  { key: 'ready',         label: 'Listo para entrega',   description: 'Empacado y listo',             icon: PackageCheck },
  { key: 'dispatched',    label: 'Enviado',              description: 'En camino a tu dirección',     icon: Truck },
  { key: 'delivered',     label: 'Entregado',            description: 'Entrega completada',           icon: PartyPopper },
] as const;

const RETAIL_STEPS = ALL_STEPS.filter(s =>
  ['pending', 'confirmed', 'ready', 'delivered'].includes(s.key)
);

export default function DeliveryStepper({ status, orderType }: DeliveryStepperProps) {
  if (status === 'cancelled') return null;

  const steps = orderType === 'retail' ? RETAIL_STEPS : ALL_STEPS;
  const statusOrder = steps.map(s => s.key) as OrderStatus[];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="w-full">
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex gap-4">
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
                    className={`w-0.5 flex-1 min-h-[32px] ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Texto */}
              <div className="pb-6">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-[#1B2B5E]' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
