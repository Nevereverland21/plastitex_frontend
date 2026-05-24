'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

export default function FeaturedProducts({ products }: Props) {
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
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