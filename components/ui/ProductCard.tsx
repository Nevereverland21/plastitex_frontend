'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Package, Star, AlertCircle, ChevronRight } from 'lucide-react';
import type { Product, PricingTier } from '@/types';

interface Props {
  product: Product;
}

// ─── Helper: obtener tier activo para una cantidad ────────────────────────────
function getActiveTier(tiers: PricingTier[], qty: number): PricingTier | null {
  const eligible = tiers.filter((t) => t.min_quantity <= qty);
  if (eligible.length === 0) return null;
  return eligible.reduce((a, b) => (a.min_quantity > b.min_quantity ? a : b));
}

// ─── Helper: formatear cantidad para el tab ───────────────────────────────────
function formatQty(qty: number): string {
  if (qty >= 1000) return `${qty / 1000}k`;
  return String(qty);
}

export default function ProductCard({ product }: Props) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasTiers = product.pricing_tiers && product.pricing_tiers.length > 0;

  // Cantidad seleccionada — iniciar con el primer tier
  const [selectedQty, setSelectedQty] = useState<number>(
    hasTiers ? product.pricing_tiers[0].min_quantity : 100
  );

  // Precio activo según cantidad seleccionada
  const activeTier = hasTiers ? getActiveTier(product.pricing_tiers, selectedQty) : null;
  const displayPrice = activeTier
    ? parseFloat(activeTier.unit_price).toFixed(2)
    : parseFloat(product.starting_price ?? product.base_price).toFixed(2);

  // Tabs a mostrar — máximo 4 para no romper el layout
  const tierTabs = hasTiers ? product.pricing_tiers.slice(0, 4) : [];

  const handleTabClick = useCallback(
    (e: React.MouseEvent, qty: number) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedQty(qty);
    },
    []
  );

  return (
    <Link href={`/${product.slug}`} className="block group">
      <article
        className="relative bg-white rounded-2xl overflow-hidden border border-gray-100
                   shadow-sm hover:shadow-xl transition-all duration-300
                   hover:-translate-y-1 hover:border-brand-orange/30
                   flex flex-col h-full"
      >
        {/* ═══════════════ IMAGEN ═══════════════ */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden flex-shrink-0">

          {/* Badge Destacado */}
          {product.featured && !isOutOfStock && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 bg-brand-orange text-white
                               text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                <Star size={11} strokeWidth={2.5} fill="currentColor" />
                Destacado
              </span>
            </div>
          )}

          {/* Categoría */}
          {product.category_name && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block bg-white/95 backdrop-blur-sm text-brand-navy
                               text-[11px] font-semibold px-2.5 py-1 rounded-full
                               border border-gray-200 shadow-sm">
                {product.category_name}
              </span>
            </div>
          )}

          {/* Imagen */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105
                          ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center
                            bg-gradient-to-br from-gray-100 to-gray-200">
              <Package size={48} strokeWidth={1.2} className="text-gray-300" />
            </div>
          )}

          {/* Agotado */}
          {isOutOfStock && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-brand-navy/92 backdrop-blur-sm text-white text-[11px]
                               font-bold px-3.5 py-1.5 rounded-full uppercase
                               tracking-wider shadow-md">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════ CONTENIDO ═══════════════ */}
        <div className="p-4 flex flex-col gap-2.5 flex-1">

          {/* Nombre */}
          <h3 className="text-sm font-bold text-brand-navy leading-snug line-clamp-2
                         group-hover:text-brand-orange transition-colors duration-200">
            {product.name}
          </h3>

          {/* Stock bajo */}
          {isLowStock && (
            <div className="flex items-center gap-1">
              <AlertCircle size={12} strokeWidth={2.5} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600">
                Últimas {product.stock} unidades
              </span>
            </div>
          )}

          {/* ── Tabs de cantidad ── */}
          {hasTiers && !isOutOfStock && (
            <div className="flex gap-1 flex-wrap">
              {tierTabs.map((tier) => {
                const isActive = activeTier?.min_quantity === tier.min_quantity;
                return (
                  <button
                    key={tier.min_quantity}
                    onClick={(e) => handleTabClick(e, tier.min_quantity)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold
                               transition-all duration-150 border
                               ${isActive
                                 ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                                 : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-brand-navy/40 hover:text-brand-navy'
                               }`}
                  >
                    {formatQty(tier.min_quantity)}+
                  </button>
                );
              })}
              {product.pricing_tiers.length > 4 && (
                <span className="px-2 py-1 text-[11px] text-gray-400 font-medium self-center">
                  +{product.pricing_tiers.length - 4} más
                </span>
              )}
            </div>
          )}

          {/* Separador */}
          <div className="h-px bg-gray-100 mt-auto" />

          {/* ── Precio + CTA ── */}
          <div className="flex items-end justify-between gap-2">

            {/* Precio dinámico */}
            <div className="flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-400
                             font-semibold leading-none mb-1">
                {hasTiers && activeTier
                  ? `${activeTier.min_quantity.toLocaleString()}+ uds`
                  : 'desde'
                }
              </p>
              <div className="flex items-baseline gap-1">
                <p className={`text-xl font-bold leading-none whitespace-nowrap
                                transition-all duration-200
                                ${isOutOfStock ? 'text-gray-400 line-through' : 'text-brand-navy'}`}>
                  S/ {displayPrice}
                </p>
                <span className="text-xs text-gray-400 font-normal">c/u</span>
              </div>
              {activeTier?.delivery_days && (
                <p className="text-[10px] text-gray-400 mt-0.5 leading-none">
                  🕐 {activeTier.delivery_days} días útiles
                </p>
              )}
            </div>

            {/* Botón */}
            {isOutOfStock ? (
              <span className="inline-flex items-center text-xs font-bold px-3 py-2
                               rounded-xl bg-gray-100 text-gray-400 flex-shrink-0">
                Agotado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold
                               px-3 py-2 rounded-xl flex-shrink-0
                               bg-brand-navy group-hover:bg-brand-orange text-white
                               transition-colors duration-200 shadow-sm whitespace-nowrap">
                Cotizar
                <ChevronRight size={13} strokeWidth={2.5} />
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}