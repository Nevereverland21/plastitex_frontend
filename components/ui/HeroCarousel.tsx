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
type Theme = 'light' | 'vibrant' | 'dark';

type HeroSlide = {
  id: string;
  theme: Theme;
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
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
    theme: 'light',
    eyebrow: 'Tienda online',
    title: 'Transformamos ideas',
    highlight: 'en Merchandising',
    subtitle: 'Tomatodos, mugs, llaveros, USB y más con tu logo. Compra por unidad, recibe en casa.',
    image: '/hero/familia.png',
    imageAlt: 'Productos publicitarios personalizados de Plastitex',
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  {
    id: 'tomatodos',
    theme: 'vibrant',
    eyebrow: 'Tomatodos personalizados',
    title: 'Tu marca,',
    highlight: 'en cada sorbo',
    subtitle: 'Tomatodos en colores vivos con tu logo. Ideales para campañas, eventos y regalos corporativos.',
    image: '/hero/tomatodos.png',
    imageAlt: 'Tomatodos de colores personalizados con logo',
    ctaPrimary: { label: 'Ver tomatodos', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  {
    id: 'personalizacion',
    theme: 'dark',
    eyebrow: 'Personalización total',
    title: 'Tu logo en',
    highlight: 'cualquier forma',
    subtitle: 'USB, llaveros y artículos a medida. Convertimos tu marca en un producto que se queda.',
    image: '/hero/personalizados.png',
    imageAlt: 'USB con formas personalizadas a medida',
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  {
    id: 'llaveros',
    theme: 'vibrant',
    eyebrow: 'Llaveros y accesorios',
    title: 'Detalles que',
    highlight: 'recuerdan tu marca',
    subtitle: 'Llaveros, mousepads y artículos publicitarios que tu cliente usa todos los días.',
    image: '/hero/llaveros.png',
    imageAlt: 'Llaveros publicitarios personalizados',
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
];

const AUTOPLAY_MS = 7000;

// Estilos por tema (fondo de marca, colores de texto, glow, color de puntos).
const THEMES: Record<Theme, {
  section: string; eyebrow: string; title: string; highlight: string;
  subtitle: string; glow: string; dotTrack: string; dotColor: string;
}> = {
  light: {
    section: 'bg-gradient-to-br from-white via-brand-light to-[#e7ecf7]',
    eyebrow: 'text-brand-orange',
    title: 'text-brand-navy',
    highlight: 'text-brand-orange',
    subtitle: 'text-gray-600',
    glow: 'rgba(43,169,224,0.16)',
    dotTrack: 'bg-brand-navy/15',
    dotColor: '#1B2B5E',
  },
  vibrant: {
    section: 'bg-gradient-to-br from-[#14224f] via-[#21347a] to-[#2BA9E0]',
    eyebrow: 'text-orange-300',
    title: 'text-white',
    highlight: 'text-orange-300',
    subtitle: 'text-white/85',
    glow: 'rgba(255,107,43,0.20)',
    dotTrack: 'bg-white/30',
    dotColor: '#ffffff',
  },
  dark: {
    section: 'bg-gradient-to-br from-[#0a1024] via-[#13204a] to-[#1f3675]',
    eyebrow: 'text-brand-sky',
    title: 'text-white',
    highlight: 'text-brand-sky',
    subtitle: 'text-white/80',
    glow: 'rgba(43,169,224,0.22)',
    dotTrack: 'bg-white/30',
    dotColor: '#ffffff',
  },
};

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

  const activeTheme = THEMES[SLIDES[current].theme];

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
      <div className="relative h-[600px] sm:h-[560px] lg:h-[640px]">
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
            <ProductSlide slide={s} active={i === current} priority={i === 0} />
          </div>
        ))}

        {/* Flechas — solo desktop (en móvil se usa swipe + puntos) */}
        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20
                     w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-white/40
                     shadow-md hover:bg-white hover:shadow-lg items-center justify-center
                     transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={20} className="text-brand-navy" strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          aria-label="Slide siguiente"
          className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20
                     w-11 h-11 rounded-full bg-brand-orange shadow-md hover:bg-orange-600
                     hover:shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight size={20} className="text-white" strokeWidth={2.5} />
        </button>

        {/* Puntos de navegación */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
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
              className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
                i === current ? `w-10 ${activeTheme.dotTrack}` : `w-2 ${activeTheme.dotTrack} hover:opacity-80`
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
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.anim-float) { animation: float-slow 5.5s ease-in-out infinite; }
        :global(.anim-stagger > *) { animation: stagger-in 0.6s ease-out both; }
        :global(.anim-stagger > *:nth-child(1)) { animation-delay: 0.08s; }
        :global(.anim-stagger > *:nth-child(2)) { animation-delay: 0.16s; }
        :global(.anim-stagger > *:nth-child(3)) { animation-delay: 0.24s; }
        :global(.anim-stagger > *:nth-child(4)) { animation-delay: 0.32s; }
        :global(.anim-stagger > *:nth-child(5)) { animation-delay: 0.40s; }
        @media (prefers-reduced-motion: reduce) {
          :global(.anim-float), :global(.anim-stagger > *) { animation: none; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE DE PRODUCTO — 2 columnas en desktop (texto + producto juntos),
// apilado y centrado en móvil. Fondo de marca a sangre completa, sin recuadros.
// ─────────────────────────────────────────────────────────────────────────────
function ProductSlide({ slide, active, priority }: { slide: HeroSlide; active: boolean; priority: boolean }) {
  const t = THEMES[slide.theme];

  return (
    <div className={`relative h-full w-full overflow-hidden ${t.section}`}>
      {/* Glow radial para profundidad detrás del producto */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 72% 45%, ${t.glow}, transparent 60%)` }}
      />
      {/* Textura de puntos sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, ${t.dotColor} 1px, transparent 1px)`,
          backgroundSize: '34px 34px',
        }}
      />

      <div
        className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10
                   flex flex-col items-center justify-center gap-4 text-center
                   md:grid md:grid-cols-2 md:items-center md:gap-10 md:text-left"
      >
        {/* Texto */}
        <div
          className={`order-2 md:order-1 w-full max-w-xl mx-auto md:mx-0 ${active ? 'anim-stagger' : ''}`}
          key={`${slide.id}-${active}`}
        >
          {slide.eyebrow && (
            <p className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-3 ${t.eyebrow}`}>
              {slide.eyebrow}
            </p>
          )}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight mb-3 md:mb-4 ${t.title}`}>
            {slide.title}{' '}
            {slide.highlight && <span className={t.highlight}>{slide.highlight}</span>}
          </h1>
          {slide.subtitle && (
            <p className={`text-base md:text-lg leading-relaxed mb-5 md:mb-7 max-w-md mx-auto md:mx-0 ${t.subtitle}`}>
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <CTAButton cta={slide.ctaPrimary} variant="primary" />
            <CTAButton cta={slide.ctaSecondary} variant="whatsapp" />
          </div>
          {slide.theme === 'light' && (
            <div className="mt-6 flex justify-center md:justify-start">
              <TrustBar />
            </div>
          )}
        </div>

        {/* Producto */}
        <div className="order-1 md:order-2 relative w-full h-[210px] sm:h-[280px] md:h-[86%]">
          <div className={`relative h-full w-full ${active ? 'anim-float' : ''}`}>
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 768px) 90vw, 46vw"
              className="object-contain drop-shadow-2xl"
            />
          </div>
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
    'inline-flex items-center gap-2 h-11 md:h-12 px-5 md:px-6 rounded-full text-sm md:text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg';

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
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm text-gray-700 justify-center md:justify-start">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="text-green-600">{it.icon}</span>
          <span className="font-medium">{it.label}</span>
        </span>
      ))}
    </div>
  );
}
