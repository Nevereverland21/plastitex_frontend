'use client';

import { useRef } from 'react';
import { ShoppingCart, Zap, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, formatInt } from '@/lib/formatters';

interface StickyTotalProps {
  unitPrice: number | null;
  quantity: number;
  logoExtra: number;
  loading: boolean;
  ctaState: 'disabled' | 'cart' | 'quote';
  addedToCart: boolean;
  productSlug: string;
  onAddToCart: () => void;
  onRequestQuote: () => void;
}

export default function StickyTotal({
  unitPrice,
  quantity,
  logoExtra,
  loading,
  ctaState,
  addedToCart,
  productSlug,
  onAddToCart,
  onRequestQuote,
}: StickyTotalProps) {
  // Preservar último precio válido para evitar parpadeo
  const lastUnitPrice = useRef<number | null>(null);
  const lastTotal     = useRef<number | null>(null);

  const displayUnit  = loading ? lastUnitPrice.current : unitPrice;
  const subtotal     = displayUnit !== null ? displayUnit * quantity : null;
  const grandTotal   = subtotal !== null ? subtotal + logoExtra : null;

  // Actualizar refs cuando hay datos reales
  if (!loading && unitPrice !== null) {
    lastUnitPrice.current = unitPrice;
    lastTotal.current     = grandTotal;
  }

  return (
    <div className="border-t border-gray-100 pt-3 space-y-2.5">

      {/* Desglose de precio — sin parpadeo */}
      <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 space-y-1.5">
        {grandTotal !== null ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                {loading && <Loader2 size={10} className="animate-spin text-brand-orange" />}
                S/ {displayUnit !== null ? formatPrice(displayUnit) : '—'} × {formatInt(quantity)} uds
              </span>
              <span className="text-xs font-semibold text-brand-navy">
                S/ {subtotal !== null ? formatPrice(subtotal) : '—'}
              </span>
            </div>
            {logoExtra > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Logo (referencial)</span>
                <span className="text-xs font-semibold text-brand-orange">≈ +S/ {formatPrice(logoExtra)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
              <span className="text-sm font-bold text-brand-navy">Total estimado</span>
              <span className={`text-xl font-black text-brand-navy transition-opacity duration-200
                ${loading ? 'opacity-50' : 'opacity-100'}`}>
                S/ {formatPrice(grandTotal)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-sm font-bold text-brand-navy">Total estimado</span>
            <span className="text-sm text-gray-400">—</span>
          </div>
        )}
      </div>

      {/* CTAs */}
      {ctaState === 'disabled' && (
        <button disabled
          className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-bold cursor-not-allowed">
          Cantidad inválida
        </button>
      )}

      {ctaState === 'cart' && (
        <div className="space-y-2">
          {/* Comprar ahora — acción primaria */}
          <Link
            href={`/checkout?buy_now=${productSlug}&qty=${quantity}&unit_price=${unitPrice !== null ? unitPrice.toFixed(2) : ''}&price=${unitPrice !== null ? unitPrice.toFixed(2) : ''}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm
                      bg-brand-orange text-white hover:bg-brand-orange/90
                      transition-all duration-200 shadow-md shadow-brand-orange/20
                      hover:scale-[1.01] active:scale-[0.99]"
          >
            <Zap size={16} strokeWidth={2.5} />
            Comprar ahora
          </Link>

          {/* Agregar al carrito — secundario */}
          <button
            onClick={onAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm
              transition-all duration-300 border-2
              ${addedToCart
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                : 'bg-white text-brand-navy border-brand-navy hover:bg-brand-navy hover:text-white'
              }`}
          >
            {addedToCart
              ? <><CheckCircle size={16} /> ¡Agregado!</>
              : <><ShoppingCart size={16} /> Agregar al carrito</>
            }
          </button>

          {/* WhatsApp — terciario */}
          <button
            onClick={onRequestQuote}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                       text-gray-400 hover:text-[#25D366] transition-colors duration-200">
            <MessageCircle size={13} /> Consultar por WhatsApp
          </button>
        </div>
      )}

      {ctaState === 'quote' && (
        <div className="space-y-2.5">
          {/* Info del proceso de cotización */}
          <div className="bg-brand-navy/3 border border-brand-navy/10 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-bold text-brand-navy uppercase tracking-wider">
              ¿Cómo funciona la cotización?
            </p>
            {[
              { icon: '1', text: 'Envías tu solicitud por WhatsApp con cantidad y detalles.' },
              { icon: '2', text: 'Un asesor te contacta y confirma precio final.' },
              { icon: '3', text: 'Recibes un link de pago seguro para cerrar el pedido.' },
            ].map((step) => (
              <div key={step.icon} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-navy text-white text-[9px] font-black
                                 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.icon}
                </span>
                <p className="text-[11px] text-gray-500 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Botón WhatsApp */}
          <button
            onClick={onRequestQuote}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm
                       bg-[#25D366] text-white hover:bg-[#1db954]
                       transition-all duration-200 shadow-md shadow-green-200
                       hover:scale-[1.01] active:scale-[0.99]">
            <MessageCircle size={17} />
            Solicitar cotización por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}