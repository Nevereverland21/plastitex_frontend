'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Truck,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Eye,
} from 'lucide-react';
import { Product } from '@/types';
import ProductModal from '@/components/ui/ProductModal';

interface Props {
  products: Product[];
}

const features = [
  { icon: ShieldCheck, label: 'Calidad garantizada' },
  { icon: Truck, label: 'Envío a todo el Perú' },
  { icon: HeadphonesIcon, label: 'Soporte 24/7' },
];

export default function HeroCarousel({ products }: Props) {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [, setDirection] = useState<'left' | 'right'>('right');
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [hovered, setHovered] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  // Precarga anticipada: índice siguiente que ya precargamos
  const preloadedRef = useRef<Set<number>>(new Set());

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right' = 'right') => {
      if (sliding || products.length <= 1) return;
      setDirection(dir);
      setSliding(true);
      setTimeout(() => {
        setCurrent(index);
        setSliding(false);
      }, 400);
    },
    [sliding, products.length]
  );

  const prev = useCallback(() => {
    goTo(current === 0 ? products.length - 1 : current - 1, 'left');
  }, [current, products.length, goTo]);

  const next = useCallback(() => {
    goTo(current === products.length - 1 ? 0 : current + 1, 'right');
  }, [current, products.length, goTo]);

  // Autoplay
  useEffect(() => {
    if (products.length <= 1 || hovered || modalProduct) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, products.length, hovered, modalProduct]);

  // Precarga TODAS las imágenes al montar
  useEffect(() => {
    products.forEach((p, i) => {
      if (p.image) {
        const img = new window.Image();
        img.src = p.image;
        img.onload = () => {
          setImageLoaded((prev) => ({ ...prev, [i]: true }));
          preloadedRef.current.add(i);
        };
        img.onerror = () => {
          // Si falla la carga igual marcamos como "listo" para no bloquear
          setImageLoaded((prev) => ({ ...prev, [i]: true }));
        };
      } else {
        setImageLoaded((prev) => ({ ...prev, [i]: true }));
        preloadedRef.current.add(i);
      }
    });
  }, [products]);

  // Precarga anticipada del siguiente al cambiar de slide
  useEffect(() => {
    const nextIndex = current === products.length - 1 ? 0 : current + 1;
    const prevIndex = current === 0 ? products.length - 1 : current - 1;

    [nextIndex, prevIndex].forEach((i) => {
      if (!preloadedRef.current.has(i) && products[i]?.image) {
        const img = new window.Image();
        img.src = products[i].image;
        img.onload = () => {
          setImageLoaded((prev) => ({ ...prev, [i]: true }));
          preloadedRef.current.add(i);
        };
      }
    });
  }, [current, products]);

  const phone = '51959388698';
  const waMessage = encodeURIComponent('¡Hola! Quiero cotizar productos Plastitex.');

  if (products.length === 0) {
    return (
      <section className="relative w-full min-h-screen bg-brand-navy flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="text-center z-10 relative">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-7xl font-bold text-white">Plasti</span>
            <span className="text-7xl font-bold text-brand-orange">tex</span>
          </div>
          <p className="text-white/60 text-xl mb-8">Transformamos ideas en Merchandising</p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-200"
          >
            Ver catálogo <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  const product = products[current];

  return (
    <>
      <section className="relative w-full min-h-[60vh] bg-brand-navy overflow-hidden flex items-center">

        {/* Patrón de fondo */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Línea naranja izquierda */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-brand-orange to-transparent" />

        {/* Degradado lateral */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/95 to-brand-navy/70" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── IZQUIERDA ── */}
            <div className="flex flex-col gap-7">
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">Plasti</span>
                  <span className="text-5xl sm:text-6xl font-bold text-brand-orange tracking-tight">tex</span>
                </div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em]">
                  Transformamos ideas en Merchandising
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-2">
                  Somos fabricantes de
                </h2>
                <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                  <span className="bg-brand-orange text-white px-3 py-1 rounded-lg inline-block">
                    artículos publicitarios
                  </span>
                </h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {features.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-brand-orange" />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catalogo"
                  className="group flex items-center gap-2 bg-brand-orange hover:bg-orange-500 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-brand-orange/25"
                >
                  Ver catálogo completo
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <a
                  href={`https://wa.me/${phone}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <MessageCircle size={15} />
                  Cotizar por WhatsApp
                </a>
              </div>

              <p className="text-white/30 text-xs tracking-widest uppercase">
                Cotiza al · 959 388 698
              </p>
            </div>

            {/* ── DERECHA — Carrusel ── */}
            <div className="flex flex-col gap-5">

              {/* Título */}
              <div className="flex items-center gap-2">
                <Star size={15} className="text-brand-orange fill-brand-orange" />
                <p className="text-white/70 text-sm font-semibold uppercase tracking-widest">
                  Productos destacados
                </p>
                <span className="text-white/30 text-xs ml-auto">
                  {current + 1} / {products.length}
                </span>
              </div>

              <div className="relative w-full">

                {/* Card imagen — SIN spinner, crossfade entre imágenes */}
                <div
                  onClick={() => setModalProduct(product)}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-brand-navy/80 cursor-pointer group/card"
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all duration-300 z-30 flex items-center justify-center">
                    <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-90 group-hover/card:scale-100 bg-white/90 backdrop-blur-sm text-brand-navy text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl">
                      <Eye size={14} />
                      Ver detalle
                    </div>
                  </div>

                  {/* Fondo placeholder — se ve solo si ninguna imagen cargó aún */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-blue-900/50 flex items-center justify-center">
                    <Package size={48} strokeWidth={1} className="text-white/10" />
                  </div>

                  {/* Imágenes — todas montadas, crossfade entre ellas */}
                  {products.map((p, i) => {
                    const isActive = i === current;
                    const isLoaded = imageLoaded[i];

                    return (
                      <div
                        key={p.id}
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{
                          opacity: isActive && !sliding && isLoaded ? 1
                                 : isActive && sliding ? 0
                                 : 0,
                        }}
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-navy to-blue-900">
                            <Package size={64} strokeWidth={1} className="text-white/20" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Degradado inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10" />

                  {/* Badge categoría */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-brand-orange/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {product.category_name ?? ''}
                    </span>
                  </div>
                </div>

                {/* Info producto */}
                <div
                  className={`mt-4 transition-all duration-300 ${
                    sliding ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-lg leading-tight truncate">
                        {product.name}
                      </h3>
                      <p className="text-white/50 text-sm mt-0.5 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-white/40 text-xs">desde</p>
                      <p className="text-brand-orange font-bold text-xl">
                        S/ {parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const wa = `https://wa.me/${phone}?text=${encodeURIComponent(
                        `¡Hola! Me interesa este producto:\n\n*${product.name}*\nPrecio: S/ ${parseFloat(product.price).toFixed(2)}\n\n¿Tienen disponibilidad?`
                      )}`;
                      window.open(wa, '_blank');
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 border border-white/20 hover:border-brand-orange hover:bg-brand-orange/10 text-white text-sm font-medium py-2.5 rounded-xl transition-all duration-200"
                  >
                    Cotizar este producto <ArrowRight size={14} />
                  </button>
                </div>

                {/* Controles */}
                {products.length > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {products.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i, i > current ? 'right' : 'left')}
                          className={`transition-all duration-300 rounded-full ${
                            i === current
                              ? 'w-6 h-2 bg-brand-orange'
                              : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prev}
                        className="w-8 h-8 bg-white/8 hover:bg-white/15 border border-white/15 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={next}
                        className="w-8 h-8 bg-white/8 hover:bg-white/15 border border-white/15 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />
    </>
  );
}