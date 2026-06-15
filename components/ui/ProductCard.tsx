'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Building2, Package, Sparkles, ArrowRight, Users } from 'lucide-react';
import type { Product, ProductColor } from '@/types';
import { formatPrice, formatQuantity } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const defaultColor =
    product.colors?.find((c) => c.is_default) ?? product.colors?.[0] ?? null;
  const [activeColor, setActiveColor] = useState<ProductColor | null>(defaultColor);
  const [activeTierIndex, setActiveTierIndex] = useState<number | null>(null);

  const displayImage = activeColor?.image ?? product.image;

  const isRetail = product.catalog_type === 'retail' || product.catalog_type === 'both';
  const isWholesale = product.catalog_type === 'wholesale' || product.catalog_type === 'both';
  const hasTiers = product.pricing_tiers && product.pricing_tiers.length > 0;

  const activeTier =
    activeTierIndex !== null ? product.pricing_tiers?.[activeTierIndex] : null;

  const displayedPrice = activeTier
    ? parseFloat(String(activeTier.unit_price))
    : parseFloat(String(product.starting_price));

  const priceLabel = activeTier
    ? `${formatQuantity(activeTier.min_quantity)}+ uds`
    : 'Desde';

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden
                 hover:shadow-[0_8px_30px_rgba(27,43,94,0.12)] hover:border-brand-navy/15
                 transition-all duration-300"
      onMouseLeave={() => setActiveTierIndex(null)}
    >
      {/* ── Zona imagen ─────────────────────────────────────────── */}
      <Link
        href={`/${product.slug}`}
        className="relative aspect-square bg-gradient-to-br from-gray-50 to-slate-50/60 overflow-hidden block"
      >
        {/* Badges top-left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.featured && (
            <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              ★ Destacado
            </span>
          )}
          <div className="flex gap-1 flex-wrap">
            {isRetail && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ShoppingBag size={9} strokeWidth={2.5} />
                Minorista
              </span>
            )}
            {isWholesale && (
              <span className="bg-brand-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Building2 size={9} strokeWidth={2.5} />
                Mayorista
              </span>
            )}
          </div>
        </div>

        {/* Badge personalizable top-right */}
        {product.allows_logo && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-brand-orange border border-brand-orange/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles size={9} strokeWidth={2.5} />
              Logo
            </span>
          </div>
        )}

        {/* Imagen */}
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-6 transition-all duration-500 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Package size={52} strokeWidth={1} />
          </div>
        )}

        {/* Overlay CTA en hover */}
        <div
          className="absolute inset-x-0 bottom-0 h-14 flex items-center justify-center
                      bg-gradient-to-t from-brand-navy/80 to-transparent
                      transition-all duration-300 opacity-0 translate-y-2
                      group-hover:opacity-100 group-hover:translate-y-0"
        >
          <span className="text-white text-xs font-bold flex items-center gap-1.5 tracking-wide">
            {isWholesale && !isRetail ? 'Ver precios' : 'Ver producto'}
            <ArrowRight size={13} strokeWidth={2.5} />
          </span>
        </div>
      </Link>

      {/* ── Zona info ────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1 gap-0">

        {/* Categoría + nombre */}
        <div className="mb-2.5">
          <p className="text-[10px] text-brand-orange font-bold uppercase tracking-[0.15em] mb-1">
            {product.category_name}
          </p>
          <Link href={`/${product.slug}`}>
            <h3 className="text-sm font-bold text-brand-navy leading-snug line-clamp-2
                           group-hover:text-brand-orange transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Zona tiers / mínimo — crece con el contenido (min-h) para no encimar
            el precio; se muestran hasta 3 rangos + indicador "+N". */}
        <div className="min-h-[34px] flex items-start">
          {hasTiers ? (
            <div className="flex flex-wrap gap-1">
              {product.pricing_tiers!.slice(0, 3).map((tier, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveTierIndex(i)}
                  onMouseLeave={() => setActiveTierIndex(null)}
                  onClick={(e) => e.preventDefault()}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-150
                              ${activeTierIndex === i
                                ? 'bg-brand-navy text-white border-brand-navy shadow-sm scale-105'
                                : 'bg-brand-navy/5 text-brand-navy/70 border-brand-navy/15 hover:bg-brand-navy/10'
                              }`}
                >
                  {formatQuantity(tier.min_quantity)}+ → S/{formatPrice(parseFloat(String(tier.unit_price)))}
                </button>
              ))}
              {product.pricing_tiers!.length > 3 && (
                <span className="self-center px-2 py-0.5 rounded-full text-[10px] font-bold
                                 bg-brand-navy/5 text-brand-navy/50 border border-brand-navy/10">
                  +{product.pricing_tiers!.length - 3} más
                </span>
              )}
            </div>
          ) : product.min_units > 1 ? (
            <div className="flex items-center gap-1 text-amber-600 bg-amber-50 rounded-lg px-2 py-1 w-fit">
              <Users size={10} strokeWidth={2.5} />
              <span className="text-[10px] font-bold">Mín. {product.min_units} uds</span>
            </div>
          ) : null}
        </div>

        {/* Colores + precio */}
        <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-end justify-between gap-2">

          {/* Selector de colores */}
          <div className="flex-1 min-w-0">
            {product.colors && product.colors.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 items-center">
                {product.colors.slice(0, 5).map((color) => (
                  <button
                    key={color.id}
                    onMouseEnter={() => setActiveColor(color)}
                    onClick={(e) => { e.preventDefault(); setActiveColor(color); }}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150
                                ${activeColor?.id === color.id
                                  ? 'border-brand-navy scale-125 shadow-sm'
                                  : 'border-white shadow hover:scale-110'
                                }`}
                    style={{ backgroundColor: color.hex_code }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[10px] text-gray-400 font-semibold">
                    +{product.colors.length - 5}
                  </span>
                )}
                {activeColor && (
                  <span className="text-[10px] text-gray-500 font-medium ml-0.5 truncate">
                    {activeColor.name}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-gray-300 font-medium">Color único</span>
            )}
          </div>

          {/* Precio dinámico */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400 font-semibold mb-0.5 transition-all duration-150">
              {priceLabel}
            </p>
            <p
              className={`text-lg font-black leading-none transition-all duration-150
                          ${activeTierIndex !== null ? 'text-brand-orange' : 'text-brand-navy'}`}
            >
              S/ {formatPrice(displayedPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}