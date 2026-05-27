'use client';

// components/ui/FeaturedProducts.tsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO:
//   - Sin negative margin (antes -mt-20 z-30 forzaba que se montara sobre un
//     hero oscuro que ya no existe)
//   - Fondo blanco limpio, transición natural con el hero claro de arriba
//   - Card de INVITACIÓN al final cuando hay menos de 4 productos.
//     Rellena el grid sin mentir sobre el inventario.
//   - Mejor estado de error (con fondo claro, no overlay oscuro)
//   - Animación de entrada con stagger
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

// Cuántos productos máximo mostramos antes de "Ver todos"
const MAX_VISIBLE = 8;
// Bajo este número agregamos card de invitación al final
const INVITATION_THRESHOLD = 4;

export default function FeaturedProducts({
  products,
  loading = false,
  error = false,
}: Props) {
  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingState />;

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error) return <ErrorState />;

  // ─── Vacío ────────────────────────────────────────────────────────────────
  if (products.length === 0) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  const visible = products.slice(0, MAX_VISIBLE);
  const showInvitation = visible.length < INVITATION_THRESHOLD;

  return (
    <section className="py-14 md:py-20 bg-white" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-brand-orange text-xs font-semibold uppercase tracking-[0.2em] mb-2">
              Lo más popular
            </p>
            <h2
              id="featured-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy tracking-tight"
            >
              Productos destacados
            </h2>
          </div>

          <Link
            href="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold
                       text-brand-navy hover:text-brand-orange transition-colors group"
          >
            Ver todos
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {visible.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: 'both',
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}

          {/* Card de invitación cuando hay pocos productos */}
          {showInvitation && (
            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: `${visible.length * 60}ms`,
                animationFillMode: 'both',
              }}
            >
              <InvitationCard />
            </div>
          )}
        </div>

        {/* CTA mobile (solo cuando no se ve el "Ver todos" del header) */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-navy text-white
                       px-6 py-3 rounded-full font-semibold text-sm
                       hover:bg-brand-orange transition-colors"
          >
            Ver todos los productos
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Subcomponentes
// ═════════════════════════════════════════════════════════════════════════════

// Card de invitación — aparece cuando hay menos de 4 productos destacados
function InvitationCard() {
  return (
    <Link
      href="/catalogo"
      className="group relative h-full min-h-[420px] flex flex-col items-center justify-center gap-4
                 bg-gradient-to-br from-brand-light to-white
                 border-2 border-dashed border-gray-200 hover:border-brand-orange/60
                 rounded-2xl p-6 transition-all duration-300
                 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="w-16 h-16 bg-brand-orange/10 group-hover:bg-brand-orange rounded-2xl
                      flex items-center justify-center transition-all duration-300
                      group-hover:scale-110">
        <LayoutGrid
          size={28}
          strokeWidth={2}
          className="text-brand-orange group-hover:text-white transition-colors"
        />
      </div>

      <div className="text-center">
        <h3 className="text-base font-bold text-brand-navy mb-1">
          Explora el catálogo
        </h3>
        <p className="text-sm text-gray-600 leading-snug max-w-[200px] mx-auto">
          Descubre todos nuestros productos personalizables
        </p>
      </div>

      <span
        className="inline-flex items-center gap-1.5 text-sm font-semibold
                   text-brand-orange group-hover:gap-2.5 transition-all"
      >
        Ver todo
        <ArrowRight size={15} strokeWidth={2.5} />
      </span>
    </Link>
  );
}

// ─── Skeleton de carga ───────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
                        bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-px bg-gray-100 mt-1" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-9 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full w-24 mb-2 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded-full w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
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
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-light border border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-brand-orange/10 border border-brand-orange/20 rounded-full
                          flex items-center justify-center mx-auto mb-4">
            <RefreshCw size={24} className="text-brand-orange" />
          </div>
          <p className="text-brand-navy text-base font-semibold mb-1">
            No se pudieron cargar los productos
          </p>
          <p className="text-gray-500 text-sm mb-5">
            Verifica tu conexión o intenta más tarde
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-semibold
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