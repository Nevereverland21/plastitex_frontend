'use client';

import { MessageCircle, CreditCard, QrCode, Landmark, Lock } from 'lucide-react';
import { usePayment } from '@/hooks/checkout/usePayment';
import { PaymentMethod } from '@/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle size={16} strokeWidth={2} />,
  CreditCard: <CreditCard size={16} strokeWidth={2} />,
  QrCode: <QrCode size={16} strokeWidth={2} />,
  Landmark: <Landmark size={16} strokeWidth={2} />,
};

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const { availableMethods, hasMultipleMethods } = usePayment();

  if (!hasMultipleMethods) {
    const method = availableMethods[0];
    if (!method) return null;

    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center">
            {ICON_MAP[method.icon] || <MessageCircle size={16} />}
          </div>
          <div>
            <p className="text-sm font-bold text-brand-navy">{method.label}</p>
            <p className="text-xs text-gray-500">{method.description}</p>
          </div>
          <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            ACTIVO
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-brand-navy">Método de pago</p>
      <div className="space-y-2">
        {availableMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = ICON_MAP[method.icon] || <Lock size={16} />;

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-brand-navy bg-brand-navy/3'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              aria-pressed={isSelected}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
                {Icon}
              </div>
              <div className="text-left flex-1">
                <p className={`text-sm font-bold ${isSelected ? 'text-brand-navy' : 'text-gray-700'}`}>
                  {method.label}
                </p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-brand-navy' : 'border-gray-300'}`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-brand-navy" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}