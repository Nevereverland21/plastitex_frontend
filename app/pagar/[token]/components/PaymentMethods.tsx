'use client';

import { MessageCircle, CreditCard, QrCode, Landmark, Smartphone } from 'lucide-react';
import { WHATSAPP } from '@/lib/config';
import type { PaymentLink } from '@/types';

interface PaymentMethodsProps {
  link: PaymentLink;
}

export default function PaymentMethods({ link }: PaymentMethodsProps) {
  const isActive = link.is_active;

  const handleWhatsAppPayment = () => {
    const lines = [
      `Hola, quiero realizar el pago de mi pedido #${link.order_id}.`,
      `Cliente: ${link.customer_name}`,
      `Concepto: ${link.link_type} — ${formatPrice(link.amount_to_pay)}`,
      `Link: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ].join('\n');
    window.open(WHATSAPP.link(lines), '_blank');
  };

  const methods = [
    {
      id: 'whatsapp',
      label: 'Pagar por WhatsApp',
      description: 'Coordina tu pago directamente con un asesor',
      icon: MessageCircle,
      enabled: true,
      color: 'bg-[#25D366] hover:bg-[#1db954]',
      textColor: 'text-white',
      onClick: handleWhatsAppPayment,
    },
    {
      id: 'izipay',
      label: 'Tarjeta de crédito/débito',
      description: 'Pago seguro con Izipay',
      icon: CreditCard,
      enabled: false,
      color: 'bg-gray-100',
      textColor: 'text-gray-400',
    },
    {
      id: 'yape',
      label: 'Yape',
      description: 'Escanea el QR con tu app',
      icon: Smartphone,
      enabled: false,
      color: 'bg-gray-100',
      textColor: 'text-gray-400',
    },
    {
      id: 'plin',
      label: 'Plin',
      description: 'Escanea el QR con tu app',
      icon: QrCode,
      enabled: false,
      color: 'bg-gray-100',
      textColor: 'text-gray-400',
    },
    {
      id: 'transferencia',
      label: 'Transferencia bancaria',
      description: 'Próximamente: datos de cuenta',
      icon: Landmark,
      enabled: false,
      color: 'bg-gray-100',
      textColor: 'text-gray-400',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Métodos de pago</p>

      {methods.map((method) => {
        const Icon = method.icon;
        const isEnabled = method.enabled && isActive;

        return (
          <button
            key={method.id}
            onClick={isEnabled ? method.onClick : undefined}
            disabled={!isEnabled}
            className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
              isEnabled
                ? `${method.color} ${method.textColor} border-transparent shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer`
                : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-70'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isEnabled ? 'bg-white/20' : 'bg-gray-100'
              }`}
            >
              <Icon size={20} className={isEnabled ? 'text-white' : 'text-gray-400'} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${isEnabled ? method.textColor : 'text-gray-500'}`}>
                  {method.label}
                </p>
                {!method.enabled && (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Próximamente
                  </span>
                )}
              </div>
              <p className={`text-xs ${isEnabled ? 'text-white/80' : 'text-gray-400'}`}>
                {method.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
