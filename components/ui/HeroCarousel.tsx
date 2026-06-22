'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  Boxes,
  PackageCheck,
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
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

type TrustPill = {
  label: string;
  icon: LucideIcon;
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
    image: '/hero/imagen-principal.webp',
    imageAlt: 'Set de merchandising Plastitex sobre un escritorio: tomatodo, mousepad, llavero y laptop',
    objectPosition: 'center',
  },
  {
    id: 'stock',
    eyebrow: 'Listo para enviar',
    title: 'Productos en stock,',
    highlight: 'entrega inmediata',
    subtitle: 'Tomatodos, mugs y llaveros disponibles hoy. Pide desde 1 unidad y recíbelo en casa.',
    image: '/hero/bg-tomatodos.webp',
    imageAlt: 'Tomatodos de colores personalizados con logos de distintas marcas',
    objectPosition: 'center',
  },
  {
    id: 'mayor',
    eyebrow: 'Venta por mayor',
    title: 'Más cantidad,',
    highlight: 'mejor precio',
    subtitle: 'Escalas de precio por volumen para empresas, campañas y eventos. Cotiza al instante.',
    image: '/hero/bg-llaveros.webp',
    imageAlt: 'Llaveros publicitarios personalizados de distintas marcas',
    objectPosition: 'center',
  },
  {
    id: 'merch',
    eyebrow: 'Personalización',
    title: 'Tu logo en',
    highlight: 'cada producto',
    subtitle: 'USB, llaveros, tomatodos y más. Una línea personalizable dentro de nuestra tienda.',
    image: '/hero/bg-usb.webp',
    imageAlt: 'USB con formas personalizadas a medida: cámaras, motos y maquinaria',
    objectPosition: 'center',
  },
];

// CTAs persistentes — los 4 motivos de compra del cliente.
const QUICK_CTAS: QuickCTA[] = [
  { label: 'Comprar por Unidad', href: '/catalogo?catalog_type=retail', icon: ShoppingBag, variant: 'primary' },
  { label: 'Comprar por Mayor', href: '/catalogo?catalog_type=wholesale', icon: Boxes, variant: 'primary' },
  { label: 'Productos en Stock', href: '/catalogo?in_stock=true', icon: PackageCheck, variant: 'secondary' },
  { label: 'Productos Novedosos', href: '/catalogo?ordering=-created_at', icon: Star, variant: 'secondary' },
];

// Mini trust pills dentro del hero.
const TRUST_PILLS: TrustPill[] = [
  { label: 'Envíos a todo el Perú', icon: Truck },
  { label: 'Compra desde 1 unidad', icon: ShieldCheck },
  { label: 'Atención L-V 9am-6pm', icon: Clock },
];

const AUTOPLAY_MS = 4500;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);
  const goTo = useCallback((i: number) => setCurrent(i), []);

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
      className="bg-white pt-3 sm:pt-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm
                     bg-white
                     min-h-[480px] md:min-h-0 md:h-[380px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Grid interno: texto + imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* ══════════ PANEL IZQUIERDO — TEXTO + CTAS ══════════ */}
            <div className="relative z-10 order-2 md:order-1 flex flex-col justify-center
                            bg-gradient-to-br from-brand-light to-white
                            px-5 sm:px-8 lg:px-12 py-6 md:py-8">
              {/* Texto con alturas reservadas para que los controles no bailen */}
              <div key={slide.id} className="anim-stagger">
                {slide.eyebrow && (
                  <p className="h-4 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]
                                text-brand-turquoise mb-2 flex items-center">
                    {slide.eyebrow}
                  </p>
                )}

                <div className="min-h-[3.6rem] sm:min-h-[4.2rem] lg:min-h-[4.6rem] mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-[1.9rem] font-bold leading-[1.15]
                                 tracking-tight text-brand-navy">
                    {slide.title}{' '}
                    {slide.highlight && <span className="text-brand-turquoise">{slide.highlight}</span>}
                  </h1>
                </div>

                <div className="min-h-[2.6rem] sm:min-h-[2.8rem] mb-4">
                  <p className="text-sm leading-snug text-gray-600 max-w-md">
                    {slide.subtitle}
                  </p>
                </div>
              </div>

              {/* CTAs persistentes */}
              <div className="grid grid-cols-2 gap-2 max-w-md mb-4">
                {QUICK_CTAS.map((cta) => (
                  <CTAButton key={cta.label} cta={cta} />
                ))}
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-2 max-w-md mb-5">
                {TRUST_PILLS.map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500
                               bg-white border border-gray-100 rounded-full px-2.5 py-1 shadow-sm"
                  >
                    <pill.icon size={11} strokeWidth={2.4} className="text-brand-turquoise" />
                    {pill.label}
                  </span>
                ))}
              </div>

              {/* Dots + contador — siempre en la misma posición */}
              <div className="flex items-center justify-between max-w-md">
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
                          ? 'w-7 bg-brand-turquoise'
                          : 'w-2 bg-brand-navy/20 hover:bg-brand-navy/40'
                      }`}
                    />
                  ))}
                </div>

                <span className="text-[11px] font-bold text-brand-navy/40 tracking-wider">
                  {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* ══════════ PANEL DERECHO — IMAGEN LIMPIA ══════════ */}
            <div className="relative order-1 md:order-2 bg-gray-50 overflow-hidden min-h-[220px]">
              {SLIDES.map((s, i) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    i === current ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden={i !== current}
                >
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    style={{ objectPosition: s.objectPosition ?? 'center' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ FLECHAS EN EXTREMOS LATERALES ══════════ */}
          <button
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 rounded-full bg-white/95 hover:bg-white
                       shadow-lg border border-gray-100
                       flex items-center justify-center transition-all
                       hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={20} className="text-brand-navy" strokeWidth={2.5} />
          </button>

          <button
            onClick={next}
            aria-label="Slide siguiente"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 rounded-full bg-white/95 hover:bg-white
                       shadow-lg border border-gray-100
                       flex items-center justify-center transition-all
                       hover:scale-110 active:scale-95"
          >
            <ChevronRight size={20} className="text-brand-navy" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.anim-stagger) { animation: stagger-in 0.35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          :global(.anim-stagger) { animation: none; }
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
      className={`group inline-flex items-center justify-between gap-1 h-10 px-3
                  rounded-xl text-[11px] sm:text-xs font-semibold transition-all
                  hover:scale-[1.02] active:scale-95 ${
                    isPrimary
                      ? 'bg-brand-turquoise hover:bg-brand-teal text-white shadow-md'
                      : 'bg-white hover:bg-brand-light text-brand-navy border border-gray-200 shadow-sm'
                  }`}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        <Icon
          size={15}
          strokeWidth={2.4}
          className={`shrink-0 ${isPrimary ? 'text-white' : 'text-brand-turquoise'}`}
        />
        <span className="truncate">{cta.label}</span>
      </span>
      <ArrowRight
        size={12}
        strokeWidth={2.5}
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
