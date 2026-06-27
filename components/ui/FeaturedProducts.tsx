'use client';

// components/ui/FeaturedProducts.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sección de productos destacados optimizada para aparecer above the fold.
//   - Padding reducido
//   - Header compacto con acción clara
//   - Grid denso
//   - Card de invitación al catálogo cuando hay pocos productos
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { ArrowRight, RefreshCw, LayoutGrid } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  loading?: boolean;
  error?: boolean;
}

const MAX_VISIBLE = 8;
const INVITATION_THRESHOLD = 4;

export default function FeaturedProducts({
  products,
  loading = false,
  error = false,
}: Props) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (products.length === 0) return null;

  const visible = products.slice(0, MAX_VISIBLE);
  const showInvitation = visible.length < INVITATION_THRESHOLD;

  return (
    <section className="pt-4 md:pt-5 pb-10 md:pb-12 bg-white" aria-labelledby="featured-heading">
      <div className="container-wide">
        {/* Header */}
        <header className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
              Lo más pedido
            </p>
            <h2
              id="featured-heading"
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy tracking-tight"
            >
              Productos destacados
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold
                       text-brand-turquoise hover:text-brand-teal transition-colors group"
          >
            Ver todos
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {visible.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: 'both',
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}

          {showInvitation && (
            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: `${visible.length * 40}ms`,
                animationFillMode: 'both',
              }}
            >
              <InvitationCard />
            </div>
          )}
        </div>

        {/* CTA mobile */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-navy text-white
                       px-5 py-2.5 rounded-full font-semibold text-sm
                       hover:bg-brand-turquoise transition-colors"
          >
            Ver todos los productos
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function InvitationCard() {
  return (
    <Link
      href="/catalogo"
      className="group relative h-full min-h-[240px] flex flex-col items-center justify-center gap-3
                 bg-gradient-to-br from-brand-light to-white
                 border-2 border-dashed border-gray-200 hover:border-brand-turquoise/60
                 rounded-xl p-5 transition-all duration-300
                 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="w-14 h-14 bg-brand-turquoise/10 group-hover:bg-brand-turquoise rounded-xl
                      flex items-center justify-center transition-all duration-300 group-hover:scale-110">
        <LayoutGrid
          size={24}
          strokeWidth={2}
          className="text-brand-turquoise group-hover:text-white transition-colors"
        />
      </div>

      <div className="text-center">
        <h3 className="text-sm font-bold text-brand-navy mb-1">
          Explora el catálogo
        </h3>
        <p className="text-xs text-gray-600 leading-snug max-w-[160px] mx-auto">
          Descubre todos nuestros productos personalizables
        </p>
      </div>

      <span
        className="inline-flex items-center gap-1 text-sm font-semibold
                   text-brand-turquoise group-hover:gap-1.5 transition-all"
      >
        Ver todo
        <ArrowRight size={14} strokeWidth={2.5} />
      </span>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
                        bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-px bg-gray-100 mt-1" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-8 bg-gray-200 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="container-wide">
        <div className="mb-4">
          <div className="h-3 bg-gray-200 rounded-full w-20 mb-1.5 animate-pulse" />
          <div className="h-7 bg-gray-200 rounded-full w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ErrorState() {
  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="container-wide">
        <div className="bg-brand-light border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-brand-turquoise/10 border border-brand-turquoise/20 rounded-full
                          flex items-center justify-center mx-auto mb-3">
            <RefreshCw size={20} className="text-brand-turquoise" />
          </div>
          <p className="text-brand-navy text-sm font-semibold mb-1">
            No se pudieron cargar los productos
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Verifica tu conexión o intenta más tarde
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-turquoise text-white px-5 py-2 rounded-full text-sm font-semibold
                       hover:scale-105 transition-all"
          >
            Ver catálogo completo
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
