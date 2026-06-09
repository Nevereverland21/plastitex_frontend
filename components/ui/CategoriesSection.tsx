'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import { ArrowRight, Tag } from 'lucide-react';

interface Props {
  categories: Category[];
}

// Colores de fondo para categorías sin imagen
const bgColors = [
  'from-blue-600 to-blue-800',
  'from-orange-500 to-orange-700',
  'from-purple-600 to-purple-800',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
  'from-indigo-500 to-indigo-700',
];

export default function CategoriesSection({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section id="categorias" className="-mt-16 relative z-20 pb-16 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-1">
              Lo que ofrecemos
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Nuestras categorías
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors duration-200"
          >
            Ver todo <ArrowRight size={15} />
          </Link>
        </div>

        {/* Carrusel horizontal con scroll snap */}
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              href={`/catalogo?category=${category.slug}`}
              className="group flex-shrink-0 snap-start flex flex-col items-center gap-2.5 w-24 sm:w-28"
            >
              {/* Círculo imagen */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-brand-orange transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:shadow-brand-orange/20 group-hover:scale-105">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${bgColors[i % bgColors.length]} flex items-center justify-center`}>
                    <Tag size={28} className="text-white/80" />
                  </div>
                )}
                {/* Shimmer hover */}
                <div className="absolute inset-0 bg-brand-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Nombre */}
              <span className="text-xs sm:text-sm font-medium text-brand-navy group-hover:text-brand-orange transition-colors duration-200 text-center leading-tight line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}

          {/* Ver todos */}
          <Link
            href="/catalogo"
            className="group flex-shrink-0 snap-start flex flex-col items-center gap-2.5 w-24 sm:w-28"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-brand-navy/20 group-hover:border-brand-orange flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <ArrowRight size={22} className="text-brand-navy/40 group-hover:text-brand-orange transition-colors duration-200" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-brand-navy/50 group-hover:text-brand-orange transition-colors duration-200 text-center">
              Ver todos
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}