'use client';

import { Check, PlusCircle, MessageCircle, Gift } from 'lucide-react';
import type { ProductExtra } from '@/types';
import { formatPrice, formatInt } from '@/lib/formatters';

interface ExtrasSectionProps {
  extras: ProductExtra[];
  selectedIds: number[];
  quantity: number;
  onToggle: (extra: ProductExtra) => void;
}

/**
 * Complementos del producto (extras). Cada uno se puede activar/desactivar:
 *  - Si NO requiere cotización: suma su costo (unit_cost × cantidad) al total,
 *    salvo que sea gratis a partir de cierta cantidad (incluido).
 *  - Si requiere cotización: al seleccionarlo, la compra pasa a cotización por
 *    WhatsApp (el asesor define el precio).
 */
export default function ExtrasSection({ extras, selectedIds, quantity, onToggle }: ExtrasSectionProps) {
  if (!extras || extras.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <PlusCircle size={12} className="text-brand-orange" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Complementos opcionales
        </p>
      </div>

      <div className="space-y-1.5">
        {extras.map((extra) => {
          const selected = selectedIds.includes(extra.id);
          const freeFrom = extra.included_from_quantity;
          const isFree = !!freeFrom && quantity >= freeFrom;
          const unit = parseFloat(extra.unit_cost);

          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => onToggle(extra)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-colors
                ${selected
                  ? 'border-brand-orange/40 bg-brand-orange/5'
                  : 'border-gray-150 bg-white hover:bg-gray-50/60 border-gray-200'
                }`}
            >
              {/* Checkbox */}
              <span
                className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border
                  ${selected ? 'bg-brand-orange border-brand-orange' : 'border-gray-300 bg-white'}`}
              >
                {selected && <Check size={11} strokeWidth={3} className="text-white" />}
              </span>

              {/* Nombre */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-navy truncate">{extra.name}</p>
                {!extra.is_quote_required && freeFrom && !isFree && (
                  <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <Gift size={10} className="flex-shrink-0" /> Gratis desde {formatInt(freeFrom)} uds
                  </p>
                )}
                {extra.extra_type_display && !freeFrom && (
                  <p className="text-[10px] text-gray-400">{extra.extra_type_display}</p>
                )}
              </div>

              {/* Precio / estado */}
              <div className="flex-shrink-0 text-right">
                {extra.is_quote_required ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-orange">
                    <MessageCircle size={10} /> Cotizar
                  </span>
                ) : isFree ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <Gift size={11} /> Incluido gratis
                  </span>
                ) : (
                  <span className="text-xs font-bold text-brand-navy">+S/ {formatPrice(unit)}<span className="text-[10px] text-gray-400">/ud</span></span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
