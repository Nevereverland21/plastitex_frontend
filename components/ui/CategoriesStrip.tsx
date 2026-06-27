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
    src="/icons/tomatodo.webp"
    alt="Tomatodo"
    width={28}
    height={28}
    className={className}
  />
);

const BarmatIcon = ({ className = '' }) => (
  <Image
    src="/icons/barmat.webp"
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
const CARD_WIDTH = 150;
const CARD_GAP = 12; // gap-3 en Tailwind

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
      className="bg-white border-b border-gray-100 py-6 md:py-8"
      aria-labelledby="categories-strip-heading"
    >
      <div className="container-wide">
        {/* ─── Header con flechas a la derecha ─── */}
        <header className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
              Explora por categoría
            </p>
            <h2
              id="categories-strip-heading"
              className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight"
            >
              Encuentra lo que buscas
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Link "Ver todas" — siempre visible en desktop */}
            <Link
              href="/catalogo"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold
                         text-brand-navy hover:text-brand-turquoise transition-colors group mr-2"
            >
              Ver todas
              <ArrowRight
                size={16}
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
                  className="w-8 h-8 rounded-full bg-white border border-gray-200
                             flex items-center justify-center
                             text-brand-navy hover:border-brand-turquoise hover:text-brand-turquoise
                             disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-brand-navy
                             transition-all"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => scrollByCards('right')}
                  disabled={!canScrollRight}
                  aria-label="Más categorías"
                  className="w-8 h-8 rounded-full bg-brand-navy
                             flex items-center justify-center text-white
                             hover:bg-brand-turquoise
                             disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-brand-navy
                             transition-all"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ─── Carrusel ─── */}
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide
                     -mx-3 px-3 sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8 xl:mx-0 xl:px-0"
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
        bg-white border border-gray-200 hover:border-brand-turquoise
        rounded-xl p-4
        flex flex-col items-center justify-center gap-2
        aspect-square
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
      "
      aria-label={`Ver categoría ${category.name}`}
    >
      {/* Ícono en círculo */}
      <div
        className="
          w-12 h-12 rounded-lg
          bg-brand-light group-hover:bg-brand-turquoise
          flex items-center justify-center
          transition-all duration-300 group-hover:scale-110
        "
      >
        <Icon
          size={22}
          strokeWidth={1.8}
          className="text-brand-navy group-hover:text-white transition-colors"
        />
      </div>

      {/* Nombre */}
      <span className="text-xs font-semibold text-brand-navy text-center leading-tight
                       group-hover:text-brand-turquoise transition-colors line-clamp-2">
        {category.name}
      </span>
    </Link>
  );
}