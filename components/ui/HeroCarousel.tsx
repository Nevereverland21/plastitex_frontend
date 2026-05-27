'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  Headset,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Package,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type CTA = { label: string; href: string; icon?: 'arrow' | 'whatsapp' };

type HeroSlide = {
  id: string;
  variant: 'manifesto' | 'categories' | 'cta' | 'banner';
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
  image?: string;
  imageAlt?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_URL = 'https://wa.me/51999999999';

const SLIDES: HeroSlide[] = [
  {
    id: 'manifesto',
    variant: 'manifesto',
    eyebrow: 'Tienda online',
    title: 'Merchandising para',
    highlight: 'tu día a día',
    subtitle: 'Tomatodos, mugs, llaveros, USB y más. Compra por unidad, recibe en casa.',
    ctaPrimary: { label: 'Ver catálogo', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'Cotizar', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  // ─── Slide de categorías DESACTIVADO ──────────────────────────────────────
  // Razón: ya tenemos <CategoriesStrip /> permanente debajo del hero, mostrar
  // las mismas 6 categorías dos veces es redundante. Si en algún momento se
  // quita la tira y se quiere volver a este slide, descomentar este bloque y
  // las funciones CategoriesSlide + CategoryIcon más abajo.
  //
  // {
  //   id: 'categories',
  //   variant: 'categories',
  //   eyebrow: 'Nuestro catálogo',
  //   title: '6 categorías,',
  //   highlight: 'todo lo que buscas',
  //   subtitle: 'Encuentra el producto perfecto para regalar o llevar.',
  //   ctaPrimary: { label: 'Explorar catálogo', href: '/catalogo', icon: 'arrow' },
  // },
  {
    id: 'cta-retail',
    variant: 'cta',
    eyebrow: 'Compra desde 1 unidad',
    title: 'Pedidos pequeños,',
    highlight: 'atención personal',
    subtitle: 'Pago seguro, envíos rápidos y soporte por WhatsApp en todo el Perú.',
    ctaPrimary: { label: 'Comprar ahora', href: '/catalogo', icon: 'arrow' },
    ctaSecondary: { label: 'WhatsApp', href: WHATSAPP_URL, icon: 'whatsapp' },
  },
  // ─── FASE 2: agregar banners reales aquí ──────────────────────────────────
  // {
  //   id: 'tomatodos-tornado',
  //   variant: 'banner',
  //   image: '/hero/tomatodo-tornado.jpg',
  //   imageAlt: 'Tomatodos modelo Tornado',
  //   title: 'Tomatodos Tornado',
  //   subtitle: 'Diseño moderno, varios colores',
  //   ctaPrimary: { label: 'Ver producto', href: '/catalogo?categoria=tomatodos', icon: 'arrow' },
  // },
];
/*
const CATEGORIES = [
  { name: 'Tomatodos', slug: 'tomatodos' },
  { name: 'Llaveros', slug: 'llaveros' },
  { name: 'Mugs', slug: 'mugs' },
  { name: 'Pad Mouse', slug: 'pad-mouse' },
  { name: 'USB', slug: 'usb' },
  { name: 'Barmats', slug: 'barmats' },
];

*/


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

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

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
      if (elapsed >= AUTOPLAY_MS) {
        next();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
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

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
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
      className="relative w-full overflow-hidden bg-brand-light"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-[480px] md:h-[520px]">
        <BackgroundDecoration />

        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              i === current
                ? 'opacity-100 translate-x-0 pointer-events-auto'
                : i < current
                ? 'opacity-0 -translate-x-8 pointer-events-none'
                : 'opacity-0 translate-x-8 pointer-events-none'
            }`}
            aria-hidden={i !== current}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${SLIDES.length}`}
          >
            <SlideContent slide={s} active={i === current} />
          </div>
        ))}

        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/90 backdrop-blur
                     border border-gray-200 shadow-md hover:bg-white hover:shadow-lg
                     flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={20} className="text-brand-navy" strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          aria-label="Slide siguiente"
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 md:w-11 md:h-11 rounded-full bg-brand-navy
                     shadow-md hover:bg-brand-orange hover:shadow-lg
                     flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight size={20} className="text-white" strokeWidth={2.5} />
        </button>

        <div
          className="absolute bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 z-20
                     flex items-center gap-2"
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
                i === current ? 'w-10 bg-gray-300' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {i === current && (
                <div
                  className="h-full bg-brand-orange rounded-full"
                  style={{
                    width: `${reducedMotion ? 100 : progress}%`,
                    transition: 'none',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-slow-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(6px); }
        }
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.anim-float) {
          animation: float-slow 4s ease-in-out infinite;
        }
        :global(.anim-float-delayed) {
          animation: float-slow-delayed 4.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        :global(.anim-float-reverse) {
          animation: float-slow-reverse 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        :global(.anim-stagger > *) {
          animation: stagger-in 0.6s ease-out both;
        }
        :global(.anim-stagger > *:nth-child(1)) { animation-delay: 0.1s; }
        :global(.anim-stagger > *:nth-child(2)) { animation-delay: 0.2s; }
        :global(.anim-stagger > *:nth-child(3)) { animation-delay: 0.3s; }
        :global(.anim-stagger > *:nth-child(4)) { animation-delay: 0.4s; }
        :global(.anim-stagger > *:nth-child(5)) { animation-delay: 0.5s; }

        @media (prefers-reduced-motion: reduce) {
          :global(.anim-float),
          :global(.anim-float-delayed),
          :global(.anim-float-reverse),
          :global(.anim-stagger > *) {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FONDO DECORATIVO
// ─────────────────────────────────────────────────────────────────────────────
function BackgroundDecoration() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-32 -right-20 w-[400px] h-[400px] rounded-full opacity-40 anim-float"
        style={{ background: 'radial-gradient(circle, #2BA9E0 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[350px] h-[350px] rounded-full opacity-25 anim-float-reverse"
        style={{ background: 'radial-gradient(circle, #FF6B2B 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1B2B5E 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE CONTENT ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function SlideContent({ slide, active }: { slide: HeroSlide; active: boolean }) {
  if (slide.variant === 'manifesto') return <ManifestoSlide slide={slide} active={active} />;
  // if (slide.variant === 'categories') return <CategoriesSlide slide={slide} active={active} />; // desactivado, ver nota arriba
  if (slide.variant === 'cta') return <CTASlide slide={slide} active={active} />;
  if (slide.variant === 'banner') return <BannerSlide slide={slide} active={active} />;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Manifiesto retail
// ─────────────────────────────────────────────────────────────────────────────
function ManifestoSlide({ slide, active }: { slide: HeroSlide; active: boolean }) {
  return (
    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 items-center">
        <div className={`relative z-10 ${active ? 'anim-stagger' : ''}`} key={`${slide.id}-${active}`}>
          {slide.eyebrow && (
            <p className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy leading-[1.05] tracking-tight mb-4">
            {slide.title}{' '}
            {slide.highlight && <span className="text-brand-orange">{slide.highlight}</span>}
          </h1>
          {slide.subtitle && (
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 max-w-xl">
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mb-6">
            <CTAButton cta={slide.ctaPrimary} variant="primary" />
            <CTAButton cta={slide.ctaSecondary} variant="whatsapp" />
          </div>
          <TrustBar />
        </div>

        <div className="hidden md:flex relative h-full items-center justify-center">
          <IsotypeVisual />
        </div>
      </div>
    </div>
  );
}

function IsotypeVisual() {
  return (
    <div className="relative w-[320px] h-[320px]">
      {/* Círculo blanco con isotipo A COLOR (antes era gradient + isotipo blanco
          forzado, lo que aplanaba el degradé original del logo y se veía mal). */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center anim-float bg-white border border-gray-100"
        style={{
          boxShadow: '0 25px 60px -15px rgba(27, 43, 94, 0.25)',
        }}
      >
        <Image
          src="/isotipo-plastitex.png"
          alt=""
          width={220}
          height={240}
          className="w-[58%] h-auto"
          priority
        />
      </div>

      {/* Anillo decorativo sutil alrededor del círculo */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(43, 169, 224, 0.18), transparent 60%)',
        }}
      />

      <div className="absolute -top-2 -left-4 anim-float-delayed">
        <FloatingBadge icon={<Truck size={18} className="text-brand-orange" />} label="Envío Perú" />
      </div>
      <div className="absolute top-1/2 -right-8 anim-float">
        <FloatingBadge icon={<ShoppingBag size={18} className="text-brand-sky" />} label="Desde 1 ud." />
      </div>
      <div className="absolute bottom-2 -left-2 anim-float-reverse">
        <FloatingBadge icon={<Headset size={18} className="text-green-600" />} label="Soporte" />
      </div>
    </div>
  );
}

function FloatingBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-white rounded-2xl px-3.5 py-2.5 shadow-xl border border-gray-100 flex items-center gap-2">
      {icon}
      <span className="text-sm font-semibold text-brand-navy whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — Categorías [DESACTIVADO]
// ─────────────────────────────────────────────────────────────────────────────
// Estas funciones quedaron sin uso porque el slide 'categories' se quitó del
// array SLIDES (ahora hay <CategoriesStrip /> permanente debajo del hero).
// Se dejan comentadas por si en el futuro se quiere reactivar el slide.
// Para reactivar:
//   1. Descomentar el slide en el array SLIDES (arriba)
//   2. Descomentar estas dos funciones
//   3. Asegurarse de que el case 'categories' siga en SlideContent
//
/*
function CategoriesSlide({ slide, active }: { slide: HeroSlide; active: boolean }) {
  return (
    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-full grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 items-center">
        <div className={`relative z-10 ${active ? 'anim-stagger' : ''}`} key={`${slide.id}-${active}`}>
          {slide.eyebrow && (
            <p className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy leading-[1.05] tracking-tight mb-4">
            {slide.title}{' '}
            {slide.highlight && <span className="text-brand-orange">{slide.highlight}</span>}
          </h1>
          {slide.subtitle && (
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 max-w-md">
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <CTAButton cta={slide.ctaPrimary} variant="primary" />
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-3 ${active ? 'anim-stagger' : ''}`} key={`${slide.id}-grid-${active}`}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-xl border border-gray-100
                         hover:border-brand-orange/40 transition-all duration-300 hover:-translate-y-1
                         flex flex-col items-center justify-center gap-2 aspect-square"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-brand-light group-hover:bg-brand-orange/10
                              flex items-center justify-center transition-colors">
                <CategoryIcon slug={cat.slug} />
              </div>
              <span className="text-xs md:text-sm font-semibold text-brand-navy text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ slug }: { slug: string }) {
  const iconClass =
    'w-6 h-6 md:w-7 md:h-7 text-brand-navy group-hover:text-brand-orange transition-colors';
  switch (slug) {
    case 'tomatodos':
      return <Coffee className={iconClass} strokeWidth={1.8} />;
    case 'llaveros':
      return <Key className={iconClass} strokeWidth={1.8} />;
    case 'mugs':
      return <Coffee className={iconClass} strokeWidth={1.8} />;
    case 'pad-mouse':
      return <Mouse className={iconClass} strokeWidth={1.8} />;
    case 'usb':
      return <Usb className={iconClass} strokeWidth={1.8} />;
    case 'barmats':
      return <Beer className={iconClass} strokeWidth={1.8} />;
    default:
      return <Package className={iconClass} strokeWidth={1.8} />;
  }
}
*/


// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — CTA retail con cards de íconos (Compra · Recibe · Chat)
// ─────────────────────────────────────────────────────────────────────────────
function CTASlide({ slide, active }: { slide: HeroSlide; active: boolean }) {
  return (
    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 items-center">
        <div className={`relative z-10 ${active ? 'anim-stagger' : ''}`} key={`${slide.id}-${active}`}>
          {slide.eyebrow && (
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={14} className="text-brand-orange" />
              <p className="text-brand-orange text-xs font-bold uppercase tracking-wider">
                {slide.eyebrow}
              </p>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy leading-[1.05] tracking-tight mb-4">
            {slide.title}{' '}
            {slide.highlight && <span className="text-brand-orange">{slide.highlight}</span>}
          </h1>
          {slide.subtitle && (
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 max-w-xl">
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <CTAButton cta={slide.ctaPrimary} variant="primary" />
            <CTAButton cta={slide.ctaSecondary} variant="whatsapp" />
          </div>
        </div>

        <div className="hidden md:flex relative h-full items-center justify-center">
          <RetailComposition />
        </div>
      </div>
    </div>
  );
}

function RetailComposition() {
  // Estructura reorganizada para que las 3 cards NO se solapen con la central:
  //   - Card central (blanca con isotipo) más pequeña, ocupa el centro
  //   - Compra: arriba derecha, fuera del cuadrante central
  //   - Recibe: abajo izquierda, sale hacia afuera (antes quedaba tapada)
  //   - Chat: medio derecha, fuera del cuadrante central
  return (
    <div className="relative w-[320px] h-[320px]">
      {/* Card central blanca con isotipo a color — más pequeña que antes para
          dar aire a las cards laterales */}
      <div className="absolute inset-[60px] bg-white rounded-3xl shadow-2xl flex items-center justify-center anim-float border border-gray-100">
        <Image
          src="/isotipo-plastitex.png"
          alt=""
          width={180}
          height={200}
          className="w-[55%] h-auto"
        />
      </div>

      {/* Card naranja arriba derecha — Compra */}
      <div
        className="absolute -top-2 -right-2 w-24 h-24 bg-brand-orange rounded-2xl anim-float-delayed shadow-xl flex flex-col items-center justify-center text-white gap-1"
        style={{ transform: 'rotate(8deg)' }}
      >
        <ShoppingBag size={26} strokeWidth={2} />
        <span className="text-[11px] font-bold uppercase tracking-wider">Compra</span>
      </div>

      {/* Card sky abajo izquierda — Recibe (ahora SALE del marco, no se tapa) */}
      <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-teal-500 rounded-full anim-float-reverse shadow-xl flex flex-col items-center justify-center text-white gap-1">
        <Package size={28} strokeWidth={2} />
        <span className="text-[11px] font-bold uppercase tracking-wider">Recibe</span>
      </div>

      {/* Card navy medio derecha — Chat */}
      <div
        className="absolute top-1/2 -right-6 -translate-y-1/2 w-20 h-20 bg-brand-navy rounded-xl anim-float shadow-xl flex flex-col items-center justify-center text-white gap-1"
        style={{ transform: 'translateY(-50%) rotate(-8deg)' }}
      >
        <MessageCircle size={22} strokeWidth={2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
      </div>
    </div>
  );
}


function BannerSlide({ slide, active }: { slide: HeroSlide; active: boolean }) {
  if (!slide.image) return null;
  return (
    <div className="relative h-full w-full">
      <Image
        src={slide.image}
        alt={slide.imageAlt ?? slide.title}
        fill
        className="object-cover"
        priority={active}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className={`max-w-xl text-white ${active ? 'anim-stagger' : ''}`} key={`${slide.id}-${active}`}>
          {slide.eyebrow && (
            <p className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-3">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight mb-4">
            {slide.title}{' '}
            {slide.highlight && <span className="text-brand-orange">{slide.highlight}</span>}
          </h1>
          {slide.subtitle && (
            <p className="text-base md:text-lg text-white/90 leading-relaxed mb-6">
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <CTAButton cta={slide.ctaPrimary} variant="primary" />
            <CTAButton cta={slide.ctaSecondary} variant="whatsapp" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function CTAButton({
  cta,
  variant,
}: {
  cta?: CTA;
  variant: 'primary' | 'whatsapp' | 'outline';
}) {
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
      <a
        href={cta.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyles} ${variantStyles[variant]}`}
      >
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

function TrustBar() {
  const items = [
    { icon: <Truck size={14} strokeWidth={2.5} />, label: 'Envíos a todo el Perú' },
    { icon: <ShoppingBag size={14} strokeWidth={2.5} />, label: 'Compra desde 1 unidad' },
    { icon: <CreditCard size={14} strokeWidth={2.5} />, label: 'Pago seguro' },
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm text-gray-700">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="text-green-600">{it.icon}</span>
          <span className="font-medium">{it.label}</span>
        </span>
      ))}
    </div>
  );
}