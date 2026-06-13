'use client';

import { CheckCircle, MessageCircle, Package, Clock, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import { PaymentMethod } from '@/types';

interface SuccessScreenProps {
  publicToken: string;
  waUrl?: string;
  paymentUrl?: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  deliveryType?: 'pickup' | 'delivery';
  onDismiss?: () => void;
}

export default function SuccessScreen({ publicToken, waUrl, paymentUrl, customerName, paymentMethod, deliveryType, onDismiss }: SuccessScreenProps) {
  const isWhatsApp = paymentMethod === 'whatsapp';
  // En delivery el monto final (con envío) y el link de pago se confirman por
  // WhatsApp, así que aquí todavía no hay link de pago para mostrar.
  const isDelivery = deliveryType === 'delivery';

  // No abrimos WhatsApp automáticamente: los navegadores bloquean window.open
  // fuera de un clic del usuario. El botón "Abrir WhatsApp" de abajo es la acción.

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle size={44} className="text-white" strokeWidth={2} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-brand-navy">
            {isWhatsApp ? '¡Pedido confirmado!' : '¡Pedido registrado!'}
          </h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Gracias, <strong className="text-brand-navy">{customerName}</strong>. Tu pedido fue registrado correctamente.
          </p>
        </div>

        {isWhatsApp ? (
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <MessageCircle size={14} className="text-green-600 flex-shrink-0" />
            <p className="text-green-700 text-xs font-medium">
              Toca <strong>&ldquo;Abrir WhatsApp&rdquo;</strong> para coordinar tu pago con un asesor.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Clock size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-xs font-medium">
              Esperando confirmación de pago...
            </p>
          </div>
        )}

        {isDelivery && (
          <div className="flex items-start justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left">
            <Truck size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 text-xs leading-relaxed">
              Tu pedido es con <strong>delivery</strong>: el costo de envío se confirma por
              WhatsApp según tu ubicación. Ahí recibirás el <strong>monto final y el link de pago</strong>.
            </p>
          </div>
        )}

        <div className="bg-brand-navy/3 border border-brand-navy/10 rounded-2xl p-4 text-left space-y-3">
          <p className="text-[10px] font-bold text-brand-navy uppercase tracking-wider">¿Qué sigue?</p>
          {isWhatsApp ? (
            <>
              {[
                { n: '1', text: 'Un asesor de Plastitex te contactará por WhatsApp' },
                { n: '2', text: 'Coordinarán el método de pago (Yape, transferencia, etc.)' },
                { n: '3', text: 'Confirmarán la fecha de entrega o recojo' },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { n: '1', text: 'Completa el pago usando el método seleccionado' },
                { n: '2', text: 'El sistema confirmará automáticamente tu pago' },
                { n: '3', text: 'Recibirás notificación cuando tu pedido esté listo' },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {paymentUrl && (
            <a
              href={paymentUrl}
              onClick={onDismiss}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm bg-brand-navy text-white hover:bg-brand-orange transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <CreditCard size={17} />
              Pagar ahora con link
            </a>
          )}

          {isWhatsApp && waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDismiss}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm bg-[#25D366] text-white hover:bg-[#1db954] transition-all duration-200 shadow-md shadow-green-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle size={17} />
              Abrir WhatsApp
            </a>
          )}

          <Link
            href={`/pedidos/${publicToken}`}
            onClick={onDismiss}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-200"
          >
            <Package size={15} />
            Ver estado de mi pedido
          </Link>

          <Link
            href="/catalogo"
            onClick={onDismiss}
            className="text-xs text-gray-400 hover:text-brand-navy transition-colors py-1"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}