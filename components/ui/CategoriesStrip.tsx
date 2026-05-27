'use client';


import Image from 'next/image';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Key,
  Mouse,
  Usb,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/types';
type IconType =
  | LucideIcon
  | React.ComponentType<{ className?: string }>;

const TomatodoIcon = ({ className = '' }) => (
  <Image
    src="/icons/tomatodo.png"
    alt="Tomatodo"
    width={28}
    height={28}
    className={className}
  />
);

const BarmatIcon = ({ className = '' }) => (
  <Image
    src="/icons/barmat.png"
    alt="Barmat"
    width={28}
    height={28}
    className={className}
  />
);
// Mapeo slug → ícono. Si una categoría no está aquí, usa Package por defecto.
const CATEGORY_ICONS: Record<string, IconType> = {
  tomatodos:   TomatodoIcon,
  llaveros:    Key,
  mugs:        Coffee,
  'pad-mouse': Mouse,
  usb:         Usb,
  barmats:     BarmatIcon,
};

// Ancho fijo de cada card en píxeles
const CARD_WIDTH = 180;
const CARD_GAP = 16; // gap-4 en Tailwind

interface Props {
  categories: Category[];
}

export default function CategoriesStrip({ categories }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // ─── Detectar estado del scroll ──────────────────────────────────────────
  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2; // tolerancia 2px

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(overflow && scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // Detectar al montar y al resize
  useEffect(() => {
    updateScrollState();

    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    // ResizeObserver para detectar cambios de tamaño del contenedor
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, categories.length]);

  // ─── Funciones de scroll por flechas ─────────────────────────────────────
  const scrollByCards = useCallback((direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;

    // Scrollear ~3 cards a la vez
    const distance = (CARD_WIDTH + CARD_GAP) * 3;
    el.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  }, []);

  if (!categories || categories.length === 0) return null;

  return (
    <section
      className="bg-white border-b border-gray-100 py-8 md:py-10"
      aria-labelledby="categories-strip-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Header con flechas a la derecha ─── */}
        <header className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-brand-orange text-xs font-semibold uppercase tracking-[0.2em] mb-1">
              Explora por categoría
            </p>
            <h2
              id="categories-strip-heading"
              className="text-xl md:text-2xl font-bold text-brand-navy tracking-tight"
            >
              Encuentra lo que buscas
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Link "Ver todas" — siempre visible en desktop */}
            <Link
              href="/catalogo"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold
                         text-brand-navy hover:text-brand-orange transition-colors group mr-2"
            >
              Ver todas
              <ArrowRight
                size={15}
                strokeWidth={2.5}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            {/* Flechas — solo si hay overflow, solo desktop */}
            {hasOverflow && (
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={() => scrollByCards('left')}
                  disabled={!canScrollLeft}
                  aria-label="Categorías anteriores"
                  className="w-9 h-9 rounded-full bg-white border border-gray-200
                             flex items-center justify-center
                             text-brand-navy hover:border-brand-navy hover:text-brand-orange
                             disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-brand-navy
                             transition-all"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => scrollByCards('right')}
                  disabled={!canScrollRight}
                  aria-label="Más categorías"
                  className="w-9 h-9 rounded-full bg-brand-navy
                             flex items-center justify-center text-white
                             hover:bg-brand-orange
                             disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-brand-navy
                             transition-all"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ─── Carrusel ─── */}
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide
                     -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card individual
// ─────────────────────────────────────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  const Icon = CATEGORY_ICONS[category.slug] ?? Package;

  return (
    <Link
      href={`/catalogo?categoria=${category.slug}`}
      style={{ width: `${CARD_WIDTH}px` }}
      className="
        group flex-shrink-0 snap-start
        bg-white border border-gray-200 hover:border-brand-orange
        rounded-2xl p-5
        flex flex-col items-center justify-center gap-3
        aspect-square
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
      "
      aria-label={`Ver categoría ${category.name}`}
    >
      {/* Ícono en círculo */}
      <div
        className="
          w-14 h-14 rounded-xl
          bg-brand-light group-hover:bg-brand-orange
          flex items-center justify-center
          transition-all duration-300 group-hover:scale-110
        "
      >
        <Icon
          size={26}
          strokeWidth={1.8}
          className="text-brand-navy group-hover:text-white transition-colors"
        />
      </div>

      {/* Nombre */}
      <span className="text-sm font-semibold text-brand-navy text-center leading-tight
                       group-hover:text-brand-orange transition-colors line-clamp-2">
        {category.name}
      </span>
    </Link>
  );
}