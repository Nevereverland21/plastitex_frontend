'use client';

import { Lock, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import type { LogoSurcharge } from '@/types';

interface CustomizerTabProps {
  surcharges: LogoSurcharge[];
  active: LogoSurcharge | null;
  quantity: number;
  minUnitsForLogo: number;
  onSelect: (s: LogoSurcharge | null) => void;
  onOpenCustomizer: () => void;
  hasCustomization: boolean;
}

type Group = { technique: string; display: string; items: LogoSurcharge[] };

function groupBy(surcharges: LogoSurcharge[]): Group[] {
  const map = new Map<string, Group>();
  for (const s of surcharges) {
    if (!map.has(s.technique)) {
      map.set(s.technique, { technique: s.technique, display: s.technique_display, items: [] });
    }
    map.get(s.technique)!.items.push(s);
  }
  return Array.from(map.values());
}

const TECH_DESC: Record<string, string> = {
  serigrafia: 'Económico en volumen. Ideal logos simples.',
  dtf:        'Full color ilimitado. Diseños complejos.',
  bordado:    'Acabado premium. Tridimensional.',
  grabado:    'Grabado permanente en metal.',
};

const TECH_ICON: Record<string, string> = {
  serigrafia: '🎨',
  dtf:        '🖨️',
  bordado:    '🧵',
  grabado:    '⚙️',
};

export default function CustomizerTab({
  surcharges,
  active,
  quantity,
  minUnitsForLogo,
  onSelect,
  onOpenCustomizer,
  hasCustomization,
}: CustomizerTabProps) {
  const locked  = quantity < minUnitsForLogo;
  const groups  = groupBy(surcharges);

  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Lock size={22} className="text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-brand-navy">Personalización bloqueada</p>
          <p className="text-xs text-gray-400 mt-1">
            Disponible desde{' '}
            <strong className="text-brand-navy">{minUnitsForLogo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} unidades</strong>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Actualmente tienes{' '}
            <strong className="text-brand-orange">{quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</strong> uds
          </p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-brand-orange rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (quantity / minUnitsForLogo) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400">
          Te faltan{' '}
          <strong className="text-brand-navy">
            {(minUnitsForLogo - quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          </strong>{' '}
          uds más
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-1">

      {/* Técnicas */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Técnica de impresión
        </p>
        <div className="space-y-2">
          {groups.map((group) => {
            const isSingle      = group.items.length === 1;
            const isGroupActive = group.items.some((s) => s.id === active?.id);

            return (
              <div key={group.technique}>
                <button
                  onClick={() => {
                    if (isSingle) {
                      onSelect(isGroupActive ? null : group.items[0]);
                    } else if (!isGroupActive) {
                      onSelect(group.items[0]);
                    }
                  }}
                  className={`w-full text-left rounded-xl border p-3 transition-all duration-150
                    ${isGroupActive
                      ? 'border-brand-navy bg-brand-navy/4 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-brand-navy/30 hover:bg-gray-50/50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base w-6 text-center">
                        {TECH_ICON[group.technique] ?? '✦'}
                      </span>
                      <div>
                        <p className={`text-sm font-bold leading-tight
                          ${isGroupActive ? 'text-brand-navy' : 'text-gray-700'}`}>
                          {group.display}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {TECH_DESC[group.technique] ?? ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSingle && (
                        <span className={`text-sm font-black
                          ${isGroupActive ? 'text-brand-orange' : 'text-gray-500'}`}>
                          +S/{group.items[0].price_extra.toFixed(2)}/ud
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${isGroupActive ? 'border-brand-navy bg-brand-navy' : 'border-gray-300'}`}>
                        {isGroupActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Sub-opciones serigrafía */}
                {!isSingle && isGroupActive && (
                  <div className="mt-1.5 ml-3 grid grid-cols-2 gap-1.5">
                    {group.items.map((item) => {
                      const isItemActive = active?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelect(isItemActive ? null : item)}
                          className={`rounded-lg border p-2.5 text-center transition-all duration-150
                            ${isItemActive
                              ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                              : 'bg-white text-brand-navy border-gray-200 hover:border-brand-orange/40'
                            }`}
                        >
                          <p className={`text-[10px] font-bold ${isItemActive ? 'text-white/80' : 'text-gray-400'}`}>
                            {item.colors === 0
                              ? 'Full color'
                              : `${item.colors} color${item.colors > 1 ? 'es' : ''}`}
                          </p>
                          <p className={`text-sm font-black leading-tight mt-0.5
                            ${isItemActive ? 'text-white' : 'text-brand-navy'}`}>
                            +S/{item.price_extra.toFixed(2)}
                            <span className={`text-[9px] font-normal ml-0.5
                              ${isItemActive ? 'text-white/70' : 'text-gray-400'}`}>/ud</span>
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Total logo */}
      {active && (
        <div className="flex items-center justify-between bg-brand-orange/5 border border-brand-orange/15 rounded-xl px-3 py-2.5">
          <span className="text-xs text-brand-orange font-medium">
            Costo personalización ({quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} uds)
          </span>
          <span className="text-sm font-black text-brand-orange">
            S/ {(active.price_extra * quantity).toFixed(2).replace('.', ',')}
          </span>
        </div>
      )}

      {/* Botón customizer canvas */}
      <button
        onClick={onOpenCustomizer}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl
          border-2 transition-all duration-200 group
          ${hasCustomization
            ? 'border-brand-navy bg-brand-navy/3'
            : 'border-dashed border-brand-orange/40 hover:border-brand-orange hover:bg-brand-orange/3'
          }`}
      >
        <div className="flex items-center gap-2.5">
          {hasCustomization
            ? <CheckCircle size={16} className="text-brand-navy flex-shrink-0" />
            : <Sparkles size={16} className="text-brand-orange flex-shrink-0" />
          }
          <div className="text-left">
            <p className={`text-sm font-bold
              ${hasCustomization ? 'text-brand-navy' : 'text-brand-orange'}`}>
              {hasCustomization ? 'Logo guardado' : 'Posicionar logo en el producto'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {hasCustomization ? 'Haz clic para editar el diseño' : 'Arrastra, escala y rota tu logo'}
            </p>
          </div>
        </div>
        <ChevronRight
          size={15}
          className={`group-hover:translate-x-0.5 transition-transform flex-shrink-0
            ${hasCustomization ? 'text-brand-navy' : 'text-brand-orange'}`}
        />
      </button>
    </div>
  );
}