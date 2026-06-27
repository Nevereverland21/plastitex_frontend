'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Building2, Package, Sparkles, ArrowRight, Users } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, formatQuantity } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeTierIndex, setActiveTierIndex] = useState<number | null>(null);

  const displayImage = product.image;

  const isRetail = product.catalog_type === 'retail' || product.catalog_type === 'both';
  const isWholesale = product.catalog_type === 'wholesale' || product.catalog_type === 'both';
  const hasTiers = product.pricing_tiers && product.pricing_tiers.length > 0;

  const isOutOfStock = isRetail && product.stock === 0;
  const isLowStock = isRetail && product.stock > 0 && product.stock <= 5;

  const activeTier = activeTierIndex !== null ? product.pricing_tiers?.[activeTierIndex] : null;
  const displayedPrice = activeTier
    ? parseFloat(String(activeTier.unit_price))
    : parseFloat(String(product.starting_price));

  const priceLabel = activeTier
    ? `${formatQuantity(activeTier.min_quantity)}+ uds`
    : 'Desde';

  return (
    <div
      className="group relative bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden
                 hover:shadow-[0_6px_20px_rgba(27,43,94,0.09)] hover:border-brand-turquoise/15
                 transition-all duration-300"
      onMouseLeave={() => setActiveTierIndex(null)}
    >
      {/* ── Imagen ─────────────────────────────────────────────── */}
      <Link
        href={`/${product.slug}`}
        className="relative aspect-square bg-gradient-to-br from-gray-50 to-slate-50/60 overflow-hidden block"
      >
        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.featured && (
            <span className="bg-brand-turquoise text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Destacado
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Últimas {product.stock} uds
            </span>
          )}
          {!isOutOfStock && isRetail && product.stock > 5 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-white" />
              En stock
            </span>
          )}
        </div>

        {/* Badge personalizable */}
        {product.allows_logo && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-white/95 backdrop-blur-sm text-brand-turquoise border border-brand-turquoise/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-contain p-4 transition-all duration-500 group-hover:scale-[1.06] ${
              isOutOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Package size={44} strokeWidth={1} />
          </div>
        )}

        {/* Overlay agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/25">
            <span className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Agotado
            </span>
          </div>
        )}

        {/* Botón hover */}
        <div
          className="absolute inset-x-0 bottom-0 h-11 flex items-center justify-center
                      bg-gradient-to-t from-brand-navy/90 to-brand-navy/50
                      transition-all duration-300 opacity-0 translate-y-2
                      group-hover:opacity-100 group-hover:translate-y-0"
        >
          <span className="text-white text-xs font-bold flex items-center gap-1 tracking-wide">
            Ver producto
            <ArrowRight size={13} strokeWidth={2.5} />
          </span>
        </div>
      </Link>

      {/* ── Info ───────────────────────────────────────────────── */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {/* Categoría + nombre */}
        <div className="mb-0.5">
          <p className="text-[10px] text-brand-turquoise font-bold uppercase tracking-[0.12em] mb-0.5">
            {product.category_name}
          </p>
          <Link href={`/${product.slug}`}>
            <h3 className="text-[15px] font-bold text-brand-navy leading-snug line-clamp-2
                           group-hover:text-brand-turquoise transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Tipo de venta */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          {isRetail && isWholesale ? (
            <>
              <ShoppingBag size={11} strokeWidth={2.5} />
              Por unidad y por mayor
            </>
          ) : isWholesale ? (
            <>
              <Building2 size={11} strokeWidth={2.5} />
              Solo por mayor
            </>
          ) : (
            <>
              <ShoppingBag size={11} strokeWidth={2.5} />
              Por unidad
            </>
          )}
        </div>

        {/* Tiers / mínimo */}
        <div className="min-h-[24px] flex items-start mt-1">
          {hasTiers ? (
            <div className="flex flex-wrap gap-1">
              {product.pricing_tiers!.slice(0, 2).map((tier, i) => (
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
              {product.pricing_tiers!.length > 2 && (
                <span className="self-center px-2 py-0.5 rounded-full text-[10px] font-bold
                                 bg-brand-navy/5 text-brand-navy/50 border border-brand-navy/10">
                  +{product.pricing_tiers!.length - 2}
                </span>
              )}
            </div>
          ) : product.min_units > 1 ? (
            <div className="flex items-center gap-1 text-amber-600 bg-amber-50 rounded-md px-2 py-0.5 w-fit">
              <Users size={11} strokeWidth={2.5} />
              <span className="text-[10px] font-bold">Mín. {product.min_units} uds</span>
            </div>
          ) : null}
        </div>

        {/* Precio */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0" />
          <div className="text-right shrink-0">
            <p className="text-[11px] text-gray-400 font-semibold mb-0 transition-all duration-150">
              {priceLabel}
            </p>
            <p
              className={`text-base font-black leading-none transition-all duration-150
                          ${activeTierIndex !== null ? 'text-brand-turquoise' : 'text-brand-navy'}`}
            >
              S/ {formatPrice(displayedPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
