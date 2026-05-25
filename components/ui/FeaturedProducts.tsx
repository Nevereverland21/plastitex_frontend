'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  loading?: boolean;
  error?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
      {/* Imagen skeleton */}
      <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      {/* Contenido skeleton */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="h-px bg-gray-100 mt-1" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-9 bg-gray-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ products, loading = false, error = false }: Props) {

  // Estado: cargando
  if (loading) {
    return (
      <section className="-mt-20 relative z-30 pb-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="h-3 bg-white/20 rounded-full w-24 mb-2 animate-pulse" />
              <div className="h-7 bg-white/10 rounded-full w-48 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Estado: error de API
  if (error) {
    return (
      <section className="-mt-20 relative z-30 pb-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-brand-orange/10 border border-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={24} className="text-brand-orange" />
            </div>
            <p className="text-white/70 text-base font-medium mb-1">No se pudieron cargar los productos</p>
            <p className="text-white/40 text-sm mb-5">Verifica tu conexión o intenta más tarde</p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-200"
            >
              Ver catálogo completo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Estado: sin productos destacados
  if (products.length === 0) return null;

  return (
    <section className="-mt-20 relative z-30 pb-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-1">
              Lo más popular
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Productos destacados
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors duration-200"
          >
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid con animación de entrada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA mobile */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-orange transition-colors duration-200"
          >
            Ver todos los productos <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}