'use client';

import { ChevronLeft, CheckCircle, Loader2, User, Mail, Phone, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import type { CartItem } from '@/types';
import type { ContactFormData } from '@/types/checkout';
import PaymentMethodSelector from './PaymentMethodSelector';
import { PaymentMethod } from '@/types';
import { formatPrice } from '@/lib/formatters';

interface ConfirmStepProps {
  items: CartItem[];
  contact: ContactFormData;
  deliveryType: 'pickup' | 'delivery';
  address: string;
  loading: boolean;
  error?: string | null;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onConfirm: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onBack: () => void;
}

export default function ConfirmStep({
  items,
  contact,
  deliveryType,
  address,
  loading,
  error,
  paymentMethod,
  onPaymentMethodChange,
  onConfirm,
  onBack,
}: ConfirmStepProps) {
  const subtotal = items.reduce((acc, i) => {
    const priceStr = i.unit_price ?? i.unit_price_override ?? i.product.base_price;
    const price = parseFloat(priceStr);
    return acc + price * i.quantity;
  }, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-brand-navy mb-1">Revisa tu pedido</h2>
        <p className="text-sm text-gray-400">Confirma que todo esté correcto antes de continuar</p>
      </div>

      {/* Productos */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          Productos ({items.length})
        </p>
        <div className="divide-y divide-gray-50">
          {items.map(({ product, quantity, unit_price, unit_price_override, customization_notes }) => {
            const priceStr = unit_price ?? unit_price_override ?? product.base_price;
            const price = parseFloat(priceStr);
            return (
              <div key={product.id} className="flex gap-3 items-center px-4 py-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                  {product.image
                    ? <Image src={product.image} alt={product.name} width={40} height={40} className="w-full h-full object-contain p-1" />
                    : <div className="w-full h-full bg-gray-100" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-gray-400">{quantity} uds · S/ {formatPrice(price)} c/u</p>
                  {customization_notes && (
                    <p className="text-[10px] text-brand-orange truncate">✦ {customization_notes}</p>
                  )}
                </div>
                <p className="text-xs font-bold text-brand-navy shrink-0">S/ {formatPrice(price * quantity)}</p>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
          <span className="text-sm font-bold text-brand-navy">Total</span>
          <span className="text-base font-black text-brand-navy">S/ {formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          Tus datos
        </p>
        <div className="divide-y divide-gray-50">
          {[
            { icon: User,  label: 'Nombre',   value: contact.customer_name },
            { icon: Mail,  label: 'Email',    value: contact.email },
            { icon: Phone, label: 'Teléfono', value: contact.phone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-2.5">
              <Icon size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-400 w-16 flex-shrink-0">{label}</span>
              <span className="text-xs font-semibold text-brand-navy truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entrega */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          Entrega
        </p>
        <div className="flex items-start gap-3 px-4 py-3">
          {deliveryType === 'pickup'
            ? <Store size={14} className="text-brand-navy flex-shrink-0 mt-0.5" />
            : <Truck size={14} className="text-brand-navy flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className="text-xs font-bold text-brand-navy">
              {deliveryType === 'pickup' ? 'Recojo en tienda — Gratis' : 'Delivery — Costo a coordinar'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {deliveryType === 'pickup'
                ? 'Jr. Áncash 919, Lima 15001 · L-V 8am–6pm'
                : address
              }
            </p>
          </div>
        </div>
      </div>

      {/* Método de pago */}
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onSelect={onPaymentMethodChange}
      />

      {/* Aviso WhatsApp */}
      {paymentMethod === 'whatsapp' && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">💬</span>
          <p className="text-xs text-green-700 leading-relaxed">
            Al confirmar, se registrará tu pedido y se abrirá <strong>WhatsApp</strong> para coordinar el pago con un asesor de Plastitex.
          </p>
        </div>
      )}

      {/* Error del backend */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-xs text-red-700 font-medium flex items-center gap-2">
            <span className="text-sm">✕</span>
            {error}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-sm font-semibold
                     border-2 border-gray-200 text-gray-500 hover:border-gray-300
                     disabled:opacity-50 transition-all duration-200"
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Atrás
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                     font-bold text-sm transition-all duration-300 shadow-lg
                     bg-brand-navy text-white hover:bg-brand-orange shadow-brand-navy/20
                     hover:scale-[1.01] active:scale-[0.99]
                     disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                     disabled:shadow-none disabled:scale-100"
        >
          {loading ? (
            <><Loader2 size={17} className="animate-spin" /> Procesando pedido...</>
          ) : paymentMethod === 'whatsapp' ? (
            <><CheckCircle size={17} /> Confirmar y abrir WhatsApp</>
          ) : (
            <><CheckCircle size={17} /> Confirmar pedido</>
          )}
        </button>
      </div>
    </div>
  );
}