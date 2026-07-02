'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Pencil,
  PackageCheck,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type HeroSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
};

type QuickCTA = {
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const SLIDES: HeroSlide[] = [
  {
    id: 'tienda',
    eyebrow: 'Tienda online',
    title: 'Artículos promocionales',
    highlight: 'para cada ocasión',
    subtitle: 'Compra por unidad o al por mayor con stock disponible y envío a todo el Perú.',
    image: '/hero/hero-tienda.webp',
    imageAlt: 'Set de merchandising Plastitex sobre un escritorio: tomatodo, mousepad, llavero y laptop',
    objectPosition: 'center',
  },
  {
    id: 'stock',
    eyebrow: 'Listo para enviar',
    title: 'Productos en stock,',
    highlight: 'entrega inmediata',
    subtitle: 'Tomatodos, mugs y llaveros disponibles hoy. Pide desde 1 unidad y recíbelo en casa.',
    image: '/hero/hero-stock.webp',
    imageAlt: 'Tomatodos de colores personalizados con logos de distintas marcas',
    objectPosition: 'center',
  },
  {
    id: 'mayor',
    eyebrow: 'Venta por mayor',
    title: 'Más cantidad,',
    highlight: 'mejor precio',
    subtitle: 'Escalas de precio por volumen para empresas, campañas y eventos. Cotiza al instante.',
    image: '/hero/hero-mayor.webp',
    imageAlt: 'Llaveros publicitarios personalizados de distintas marcas',
    objectPosition: 'center',
  },
  {
    id: 'merch',
    eyebrow: 'Personalización',
    title: 'Tu logo en',
    highlight: 'cada producto',
    subtitle: 'USB, llaveros, tomatodos y más. Una línea personalizable dentro de nuestra tienda.',
    image: '/hero/hero-personalizados.webp',
    imageAlt: 'USB con formas personalizadas a medida: cámaras, motos y maquinaria',
    objectPosition: 'center',
  },
];

// CTAs persistentes — los 4 motivos de compra del cliente.
const QUICK_CTAS: QuickCTA[] = [
  { label: 'Destacados', href: '/catalogo?featured=true', icon: Star, variant: 'primary' },
  { label: 'Personalizables', href: '/catalogo?allows_logo=true', icon: Pencil, variant: 'primary' },
  { label: 'Entrega inmediata', href: '/catalogo?in_stock=true', icon: PackageCheck, variant: 'secondary' },
  { label: 'Novedades', href: '/catalogo?ordering=-created_at', icon: Sparkles, variant: 'secondary' },
];

const AUTOPLAY_MS = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const next = useCallback(() => {
    setDirection('next');
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection('prev');
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goTo = useCallback((i: number) => {
    setDirection(i > current ? 'next' : 'prev');
    setCurrent(i);
  }, [current]);

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const t = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [current, isPaused, reducedMotion, next]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 50) (delta > 0 ? next : prev)();
  };

  const slide = SLIDES[current];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Banner principal de Plastitex"
      className="bg-white pt-3 sm:pt-4 lg:pt-5"
    >
      {/* Banner FULL-BLEED: ocupa todo el ancho de la pantalla (estilo MercadoLibre).
          El contenido interno se centra al contenedor de 1280px → alineado con el resto. */}
      <div
        className="group relative overflow-hidden
                   bg-brand-navy
                   h-[50vh] min-h-[360px] sm:min-h-[340px] lg:min-h-[360px] xl:min-h-[380px] max-h-[460px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          {/* ══════════ CAPA 1 — IMAGEN DE FONDO ══════════ */}
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              aria-hidden={i !== current}
            >
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: s.objectPosition ?? 'center' }}
              />
            </div>
          ))}

          {/* ══════════ CAPA 2 — DIFUMINADO SUAVE HACIA LA DERECHA ══════════
              Degradado muy suave para no tapar los productos de la imagen.
              La zona derecha queda casi limpia para que los productos se vean nítidos. */}
          <div
            className="absolute inset-0 bg-gradient-to-r
                       from-brand-navy/95 via-brand-navy/75 to-brand-navy/10
                       sm:from-brand-navy/95 sm:via-brand-navy/60 sm:to-transparent
                       lg:from-brand-navy lg:via-brand-navy/55 lg:to-transparent"
            aria-hidden
          />

          {/* Refuerzo sutil en móvil por si la imagen tiene zonas claras */}
          <div
            className="absolute inset-0
                       bg-gradient-to-t from-brand-navy/70 via-transparent to-brand-navy/20
                       sm:bg-gradient-to-t sm:from-brand-navy/40 sm:via-transparent sm:to-transparent"
            aria-hidden
          />

          {/* Sombra inferior para anclar dots y controles */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-navy/50 to-transparent"
            aria-hidden
          />

          {/* ══════════ CONTENIDO — centrado al contenedor (1280) ══════════ */}
          <div className="relative z-10 h-full">
           <div className="container-wide h-full flex flex-col justify-center py-6 lg:py-8">
            {/* Texto con animación al cambiar de slide */}
            <div
              key={slide.id + direction}
              className="anim-hero-content will-change-transform"
            >
              {slide.eyebrow && (
                <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]
                              text-brand-aqua mb-2 sm:mb-3">
                  <span className="w-5 h-0.5 bg-brand-aqua rounded-full" />
                  {slide.eyebrow}
                </p>
              )}

              <div className="mb-2 sm:mb-3 max-w-xl lg:max-w-2xl">
                <h1 className="text-[1.65rem] sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-extrabold leading-[1.1]
                               tracking-tight text-white drop-shadow-lg">
                  {slide.title}{' '}
                  {slide.highlight && (
                    <span className="text-brand-aqua">{slide.highlight}</span>
                  )}
                </h1>
              </div>

              <div className="mb-4 sm:mb-6 max-w-md lg:max-w-lg">
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 drop-shadow-md">
                  {slide.subtitle}
                </p>
              </div>
            </div>

            {/* CTAs persistentes */}
            <div className="flex flex-wrap gap-2 sm:gap-3 max-w-2xl mb-4 sm:mb-6">
              {QUICK_CTAS.map((cta) => (
                <CTAButton key={cta.label} cta={cta} />
              ))}
            </div>

            {/* Dots + contador */}
            <div className="flex items-center justify-between max-w-3xl">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Navegación del carrusel">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    role="tab"
                    aria-selected={i === current}
                    aria-label={`Ir al slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? 'w-7 bg-brand-aqua'
                        : 'w-2 bg-white/30 hover:bg-white/55'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] font-bold text-white/50 tracking-wider">
                {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>
           </div>
          </div>

          {/* ══════════ FLECHAS — en los extremos del banner ══════════ */}
          <button
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                       w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25
                       backdrop-blur-sm border border-white/30
                       flex items-center justify-center transition-all
                       hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100
                       focus:opacity-100"
          >
            <ChevronLeft size={20} className="text-white" strokeWidth={2.5} />
          </button>

          <button
            onClick={next}
            aria-label="Slide siguiente"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                       w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25
                       backdrop-blur-sm border border-white/30
                       flex items-center justify-center transition-all
                       hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100
                       focus:opacity-100"
          >
            <ChevronRight size={20} className="text-white" strokeWidth={2.5} />
          </button>
      </div>

      <style jsx>{`
        @keyframes hero-content-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.anim-hero-content) { animation: hero-content-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          :global(.anim-hero-content) { animation: none; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function CTAButton({ cta }: { cta: QuickCTA }) {
  const Icon = cta.icon;
  const isPrimary = cta.variant === 'primary';

  return (
    <Link
      href={cta.href}
      className={`group inline-flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-5
                  rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all
                  hover:scale-[1.03] active:scale-95 ${
                    isPrimary
                      ? 'bg-brand-turquoise hover:bg-brand-teal text-white shadow-md shadow-brand-turquoise/25'
                      : 'bg-white hover:bg-white/95 text-brand-navy border border-white/80 backdrop-blur-sm shadow-md shadow-black/5'
                  }`}
    >
      <span className="flex items-center gap-2 min-w-0">
        <Icon
          size={16}
          strokeWidth={2.3}
          className={`shrink-0 ${isPrimary ? 'text-white' : 'text-brand-turquoise'}`}
        />
        <span className="truncate">{cta.label}</span>
      </span>
      <ArrowRight
        size={14}
        strokeWidth={2.5}
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
