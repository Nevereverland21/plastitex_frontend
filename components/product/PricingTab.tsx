'use client';

import { Minus, Plus, TrendingDown, Clock, AlertTriangle, Loader2, ShieldCheck, MapPin, Star } from 'lucide-react';
import type { ProductDetail, QuoteResponse } from '@/types';
import { formatPrice, formatInt } from '@/lib/formatters';

interface PricingTabProps {
  product: ProductDetail;
  quantity: number;
  quoteResult: QuoteResponse | null;
  loading: boolean;
  error: string | null;
  onQuantityChange: (qty: number) => void;
  /** Vista mayorista: muestra solo los rangos ≥ umbral mayorista. */
  wholesale?: boolean;
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100 flex flex-col gap-0.5">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold text-brand-navy truncate">{value}</span>
    </div>
  );
}

export default function PricingTab({
  product,
  quantity,
  quoteResult,
  loading,
  error,
  onQuantityChange,
  wholesale = false,
}: PricingTabProps) {
  const minUnits  = product.min_units ?? 1;
  const threshold = product.quote_threshold ?? 1000;
  const step      = quantity < 100 ? 1 : quantity < 500 ? 10 : 50;

  const handleDecrement = () => onQuantityChange(Math.max(minUnits, quantity - step));
  const handleIncrement = () => onQuantityChange(quantity + step);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v > 0) onQuantityChange(v);
  };

  // Rangos separados por el umbral mayorista: la vista estándar muestra solo los
  // rangos minoristas (< umbral); la vista mayorista, solo los mayoristas (≥ umbral).
  const wholesaleThreshold = product.wholesale_threshold ?? 100;
  const allTiers       = product.pricing_tiers ?? [];
  const retailTiers    = allTiers.filter((t) => t.min_quantity < wholesaleThreshold);
  const wholesaleTiers = allTiers.filter((t) => t.min_quantity >= wholesaleThreshold);
  const tiers = wholesale
    ? (wholesaleTiers.length ? wholesaleTiers : allTiers)
    : (retailTiers.length ? retailTiers : allTiers);

  const hasTiers   = tiers.length > 0;
  const isRetail   = !hasTiers;
  const hasDesc    = !!product.description;

  // Precio unitario para la cantidad actual: el del cotizador cuando está
  // disponible (autoritativo), si no el de entrada (mínimo). Así a 1 unidad se
  // muestra el precio base y al subir la cantidad baja según el rango.
  const headlineUnit = quoteResult
    ? parseFloat(quoteResult.unit_price)
    : parseFloat(String(product.starting_price));

  return (
    <div className="space-y-3 py-1">

      {/* Precio unitario para la cantidad actual */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-brand-navy">
          S/ {formatPrice(headlineUnit)}
        </span>
        <span className="text-xs text-gray-400">/ud</span>
        {minUnits > 1 && (
          <span className="text-xs text-gray-400 ml-1">· desde {formatInt(minUnits)} uds</span>
        )}
      </div>

      {/* Tabla de tiers — compacta */}
      {hasTiers && (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/80 px-3 py-1.5 flex items-center gap-1.5 border-b border-gray-100">
            <TrendingDown size={11} className="text-brand-orange" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {wholesale ? 'Precios mayoristas' : 'Precio por volumen'}
            </p>
          </div>
          {tiers.map((tier, i) => {
            const next     = tiers[i + 1];
            const isActive = quoteResult?.applied_tier?.min_quantity === tier.min_quantity;
            const label    = next
              ? `${formatInt(tier.min_quantity)} – ${formatInt(next.min_quantity - 1)} uds`
              : `${formatInt(tier.min_quantity)}+ uds`;
            const savings  = i > 0
              ? Math.round((1 - parseFloat(String(tier.unit_price)) / parseFloat(String(tiers[0].unit_price))) * 100)
              : 0;

            return (
              <button
                key={tier.min_quantity}
                onClick={() => onQuantityChange(tier.min_quantity)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left
                  transition-colors border-b border-gray-50 last:border-0
                  ${isActive ? 'bg-brand-orange/5' : 'bg-white hover:bg-gray-50/60'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                    ${isActive ? 'bg-brand-orange' : 'bg-gray-200'}`} />
                  <span className={`text-xs ${isActive ? 'font-bold text-brand-navy' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {savings > 0 && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      -{savings}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-black ${isActive ? 'text-brand-orange' : 'text-brand-navy'}`}>
                    S/ {formatPrice(tier.unit_price)}/ud
                  </span>
                  {tier.delivery_days && (
                    <span className="flex items-center gap-0.5 text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      <Clock size={8} /> {tier.delivery_days}d
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selector de cantidad — más compacto */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <button
            onClick={handleDecrement}
            aria-label="Reducir cantidad"
            className="w-9 h-9 flex items-center justify-center text-brand-navy
                       hover:bg-brand-navy hover:text-white transition-all duration-150"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={handleInput}
            className="w-14 text-center text-sm font-bold text-brand-navy focus:outline-none
                       border-x border-gray-100 h-9
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleIncrement}
            aria-label="Aumentar cantidad"
            className="w-9 h-9 flex items-center justify-center text-brand-navy
                       hover:bg-brand-navy hover:text-white transition-all duration-150"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center gap-1 text-brand-orange">
              <Loader2 size={11} className="animate-spin" />
              <span className="text-xs">Calculando...</span>
            </div>
          )}
          {!loading && quantity < minUnits && (
            <p className="text-xs text-red-500 font-medium">Mín. {formatInt(minUnits)} uds</p>
          )}
          {!loading && quantity >= threshold && (
            <p className="text-xs text-sky-600 font-medium">Requiere cotización</p>
          )}
          {!loading && quantity >= minUnits && quantity < threshold && (
            <p className="text-xs text-gray-400">Cotización ≥ {formatInt(threshold)} uds</p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">{error}</p>
        </div>
      )}

      {/* Specs técnicas — solo para minoristas sin tiers (rellena el espacio) */}
      {isRetail && (
        <div className="space-y-2">
          {/* Descripción si existe */}
          {hasDesc && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Grid de specs */}
          {(product.material || product.capacity_ml || product.height_cm ||
            product.diameter_cm || product.weight_grams || product.packaging) && (
            <div className="grid grid-cols-2 gap-1.5">
              {product.material && (
                <SpecItem label="Material" value={product.material} />
              )}
              {product.capacity_ml && (
                <SpecItem label="Capacidad" value={`${product.capacity_ml} ml`} />
              )}
              {product.height_cm && (
                <SpecItem label="Alto" value={`${product.height_cm} cm`} />
              )}
              {product.diameter_cm && (
                <SpecItem label="Diámetro" value={`${product.diameter_cm} cm`} />
              )}
              {product.weight_grams && (
                <SpecItem label="Peso" value={`${product.weight_grams} g`} />
              )}
              {product.packaging && (
                <SpecItem label="Empaque" value={product.packaging} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Garantías con íconos reales — en línea horizontal */}
      <div className="flex items-center gap-3 pt-0.5">
        <div className="flex items-center gap-1.5 text-gray-400">
          <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
          <span className="text-[10px] font-semibold">Pago seguro</span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-gray-400">
          <MapPin size={13} className="text-brand-orange flex-shrink-0" />
          <span className="text-[10px] font-semibold">Envío Lima</span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-gray-400">
          <Star size={13} className="text-brand-navy flex-shrink-0" />
          <span className="text-[10px] font-semibold">Calidad garantizada</span>
        </div>
      </div>
    </div>
  );
}