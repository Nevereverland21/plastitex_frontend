'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  MessageCircle,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type CTA = { label: string; href: string; icon?: 'arrow' | 'whatsapp' };

type HeroSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  /** Posición del foco de la imagen para que el producto no quede tapado por el texto. */
  objectPosition?: string;
  /** Muestra la barra de confianza (solo en el primer slide). */
  showTrustBar?: boolean;
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
import { WHATSAPP } from '@/lib/config';
const WHATSAPP_URL = WHATSAPP.baseUrl;

const SLIDES: HeroSlide[] = [
  {
    id: 'manifiesto',
    eyebrow: 'Tienda online',
    title: 'Transformamos ideas',
    highlight: 'en Merchandising',
    subtitle: 'Tomatodos, mugs, llaveros, USB y más con tu logo. Compra por unidad, recibe en casa.',
    image: '/hero/image8.webp',
    imageAlt: 'Merchandising personalizado de Plastitex: tomatodo, mousepad, pin y llavero',
    objectPosition: '70% center',
    showTrustBar: true,
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  {
    id: 'tomatodos',
    eyebrow: 'Tomatodos personalizados',
    title: 'Tu marca,',
    highlight: 'en cada sorbo',
    subtitle: 'Tomatodos en colores vivos con tu logo. Ideales para campañas, eventos y regalos corporativos.',
    image: '/hero/bg-tomatodos.webp',
    imageAlt: 'Tomatodos de colores personalizados con logos de distintas marcas',
    objectPosition: '60% center',
    ctaPrimary: { label: 'Ver tomatodos', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  {
    id: 'personalizacion',
    eyebrow: 'Personalización total',
    title: 'Tu logo en',
    highlight: 'cualquier forma',
    subtitle: 'USB, llaveros y artículos a medida. Convertimos tu marca en un producto que se queda.',
    image: '/hero/bg-usb.webp',
    imageAlt: 'USB con formas personalizadas a medida: cámaras, motos y maquinaria',
    objectPosition: '65% center',
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  {
    id: 'llaveros',
    eyebrow: 'Llaveros y accesorios',
    title: 'Detalles que',
    highlight: 'recuerdan tu marca',
    subtitle: 'Llaveros, mousepads y artículos publicitarios que tu cliente usa todos los días.',
    image: '/hero/bg-llaveros.webp',
    imageAlt: 'Llaveros de caucho personalizados con logos de empresas',
    objectPosition: '60% center',
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
];

const AUTOPLAY_MS = 7000;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const progressStartTime = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

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
    if (isPaused || reducedMotion) {
      setProgress(0);
      return;
    }
    progressStartTime.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - progressStartTime.current;
      const pct = Math.min((elapsed / AUTOPLAY_MS) * 100, 100);
      setProgress(pct);
      if (elapsed >= AUTOPLAY_MS) next();
      else rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [current, isPaused, reducedMotion, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next();
      else prev();
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Banner principal de Plastitex"
      className="relative w-full overflow-hidden bg-brand-navy"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-[620px] sm:h-[680px] lg:h-[780px]">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === current ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={i !== current}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${SLIDES.length}`}
          >
            <ProductSlide slide={s} active={i === current} priority={i === 0} reducedMotion={reducedMotion} />
          </div>
        ))}

        {/* Flechas — solo desktop (en móvil se usa swipe + puntos) */}
        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20
                     w-11 h-11 rounded-full bg-white/15 backdrop-blur border border-white/30
                     shadow-lg hover:bg-white/25 items-center justify-center
                     transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={20} className="text-white" strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          aria-label="Slide siguiente"
          className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20
                     w-11 h-11 rounded-full bg-brand-orange shadow-lg hover:bg-orange-600
                     hover:shadow-xl items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight size={20} className="text-white" strokeWidth={2.5} />
        </button>

        {/* Puntos de navegación */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:left-auto sm:right-8 sm:translate-x-0"
          role="tablist"
          aria-label="Navegación del carrusel"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir al slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden bg-white/35 hover:bg-white/50 ${
                i === current ? 'w-10' : 'w-2'
              }`}
            >
              {i === current && (
                <div
                  className="h-full bg-brand-orange rounded-full"
                  style={{ width: `${reducedMotion ? 100 : progress}%`, transition: 'none' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ken-burns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.anim-kenburns) { animation: ken-burns 9s ease-out both; }
        :global(.anim-stagger > *) { animation: stagger-in 0.6s ease-out both; }
        :global(.anim-stagger > *:nth-child(1)) { animation-delay: 0.10s; }
        :global(.anim-stagger > *:nth-child(2)) { animation-delay: 0.20s; }
        :global(.anim-stagger > *:nth-child(3)) { animation-delay: 0.30s; }
        :global(.anim-stagger > *:nth-child(4)) { animation-delay: 0.40s; }
        :global(.anim-stagger > *:nth-child(5)) { animation-delay: 0.50s; }
        @media (prefers-reduced-motion: reduce) {
          :global(.anim-kenburns), :global(.anim-stagger > *) { animation: none; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE DE PRODUCTO — imagen fotográfica a sangre completa con texto superpuesto
// a la izquierda. Degradado oscuro para garantizar la legibilidad sobre la foto.
// ─────────────────────────────────────────────────────────────────────────────
function ProductSlide({
  slide,
  active,
  priority,
  reducedMotion,
}: {
  slide: HeroSlide;
  active: boolean;
  priority: boolean;
  reducedMotion: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-brand-navy">
      {/* Imagen de fondo a sangre completa con leve zoom (Ken Burns) mientras está activa */}
      <div className={`absolute inset-0 ${active && !reducedMotion ? 'anim-kenburns' : ''}`}>
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: slide.objectPosition ?? 'center' }}
        />
      </div>

      {/* Degradado oscuro de izquierda a derecha para la legibilidad del texto */}
      <div
        className="absolute inset-0 pointer-events-none
                   bg-gradient-to-r from-[#0a1024]/95 via-[#0a1024]/65 to-transparent
                   md:from-[#0a1024]/92 md:via-[#0a1024]/48 md:to-transparent"
      />
      {/* Oscurecido radial extra en el lado izquierdo (donde va el texto) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(115% 95% at 0% 55%, rgba(10,16,36,0.6), transparent 58%)' }}
      />
      {/* Refuerzo inferior para móvil (zona de puntos) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a1024]/60 via-transparent to-transparent" />

      {/* Contenido */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center">
        <div
          className={`w-full max-w-xl text-left ${active ? 'anim-stagger' : ''}`}
          key={`${slide.id}-${active}`}
        >
          {slide.eyebrow && (
            <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] mb-3 md:mb-4 text-orange-300">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-4 md:mb-5 text-white drop-shadow-lg">
            {slide.title}{' '}
            {slide.highlight && <span className="text-brand-orange">{slide.highlight}</span>}
          </h1>
          {slide.subtitle && (
            <p className="text-lg md:text-xl leading-relaxed mb-6 md:mb-8 max-w-lg text-white/90 drop-shadow">
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <CTAButton cta={slide.ctaPrimary} variant="primary" />
            <CTAButton cta={slide.ctaSecondary} variant="whatsapp" />
          </div>
          {slide.showTrustBar && (
            <div className="mt-6">
              <TrustBar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function CTAButton({ cta, variant }: { cta?: CTA; variant: 'primary' | 'whatsapp' | 'outline' }) {
  if (!cta) return null;

  const baseStyles =
    'inline-flex items-center gap-2 h-11 md:h-12 px-5 md:px-6 rounded-full text-sm md:text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl';

  const variantStyles = {
    primary: 'bg-brand-orange hover:bg-orange-600 text-white',
    whatsapp: 'bg-green-500 hover:bg-green-600 text-white',
    outline: 'bg-white hover:bg-brand-light text-brand-navy border border-gray-200',
  };

  const isExternal = cta.href.startsWith('http');
  const content = (
    <>
      {cta.icon === 'whatsapp' && <MessageCircle size={18} strokeWidth={2.5} />}
      <span>{cta.label}</span>
      {cta.icon === 'arrow' && <ArrowRight size={16} strokeWidth={2.5} />}
    </>
  );

  if (isExternal) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={`${baseStyles} ${variantStyles[variant]}`}>
        {content}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={`${baseStyles} ${variantStyles[variant]}`}>
      {content}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BAR
// ─────────────────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: <Truck size={14} strokeWidth={2.5} />, label: 'Envíos a todo el Perú' },
    { icon: <ShoppingBag size={14} strokeWidth={2.5} />, label: 'Compra desde 1 unidad' },
    { icon: <CreditCard size={14} strokeWidth={2.5} />, label: 'Pago seguro' },
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm text-white/85">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="text-green-400">{it.icon}</span>
          <span className="font-medium">{it.label}</span>
        </span>
      ))}
    </div>
  );
}
