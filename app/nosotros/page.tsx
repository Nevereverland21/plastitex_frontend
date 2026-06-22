'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award, Users, Package, Factory,
  Lightbulb, Leaf, ShieldCheck, Star,
  ChevronRight, MessageCircle,
  Target, Globe, Flag,
  Printer, FlaskConical,
  Truck, HardHat, Settings2,
} from 'lucide-react';
import { WHATSAPP } from '@/lib/config';

// ─── Hook animación scroll ────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Hook contador animado ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Sección animada ──────────────────────────────────────────────────────────
function RevealSection({
  children, className = '', delay = 0,
}: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Datos ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 14, suffix: '+', label: 'Años de experiencia', icon: Award },
  { value: 500, suffix: '+', label: 'Clientes satisfechos', icon: Users },
  { value: 42, suffix: '+', label: 'Modelos de productos', icon: Package },
  { value: 100, suffix: '%', label: 'Fabricación propia', icon: Factory },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Calidad garantizada',
    desc: 'Materiales 100% vírgenes y procesos de control estricto en cada producto que fabricamos.',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Lightbulb,
    title: 'Innovación constante',
    desc: 'Tecnología de punta y maquinaria propia para desarrollar productos únicos y de alto impacto.',
    iconColor: 'text-brand-orange',
    bgColor: 'bg-brand-orange/10',
  },
  {
    icon: Leaf,
    title: 'Compromiso ambiental',
    desc: 'Productos diseñados para ser sostenibles y reciclables, reduciendo nuestro impacto ambiental.',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Star,
    title: 'Satisfacción del cliente',
    desc: 'Cada pedido es único. Trabajamos para que tu marca destaque con productos que conecten.',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const INFRAESTRUCTURA = [
  { icon: Factory,      label: 'Planta propia',      desc: 'Infraestructura propia en Lima' },
  { icon: Settings2,    label: 'Maquinaria CNC',      desc: 'Tecnología de precisión' },
  { icon: Printer,      label: 'Impresión digital',   desc: 'UV, serigrafía y más' },
  { icon: FlaskConical, label: 'Control de calidad',  desc: 'Revisión en cada etapa' },
  { icon: Truck,        label: 'Logística propia',    desc: 'Despacho a todo el Perú' },
  { icon: HardHat,      label: 'Técnicos expertos',   desc: 'Equipo multidisciplinario' },
];

// ─── Página ───────────────────────────────────────────────────────────────────
export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════ HERO ESTILO FICHA TÉCNICA ══════════════ */}
      <section className="relative bg-brand-navy overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* ── Columna texto ── */}
            <div className="lg:col-span-5">
              <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Sobre nosotros
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-white leading-[1.1] mb-4">
                Fabricamos productos que{' '}
                <span className="text-brand-turquoise">impulsan marcas</span>{' '}
                y construyen relaciones
              </h1>
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
                Más de 14 años ayudando a empresas de todo el Perú a comunicar su identidad
                a través de productos personalizados de alta calidad.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: '14+', label: 'Años de experiencia', icon: Award },
                  { value: '500+', label: 'Clientes satisfechos', icon: Users },
                  { value: '42+', label: 'Modelos de productos', icon: Package },
                  { value: '100%', label: 'Fabricación propia', icon: Factory },
                ].map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                      <stat.icon size={16} className="text-brand-turquoise" strokeWidth={2} />
                    </div>
                    <p className="text-xl font-bold text-white leading-none mb-0.5">{stat.value}</p>
                    <p className="text-[10px] text-white/60 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Columna imagen ── */}
            <div className="lg:col-span-7 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
                <Image
                  src="/images/nosotros-hero.png"
                  alt="Plastitex — producción propia de artículos publicitarios"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Tarjeta flotante */}
              <div className="absolute -bottom-4 -right-2 sm:bottom-6 sm:right-6 w-[260px] sm:w-[300px]
                              bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 z-10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-brand-navy font-bold text-sm sm:text-base mb-1">
                      Producción 100% propia
                    </p>
                    <p className="text-gray-500 text-xs leading-snug">
                      Controlamos cada etapa del proceso para garantizar calidad, plazos y precios competitivos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <StatsSection />

      {/* ══════════════ QUIÉNES SOMOS ══════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <RevealSection>
              <span className="text-brand-orange text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                ¿Quiénes somos?
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy leading-tight mb-6">
                Una empresa peruana que fabrica tu marca
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Somos fabricantes directos de artículos publicitarios y productos de
                merchandising. Contamos con infraestructura propia, maquinaria de punta
                y un equipo de técnicos especializados en diversas áreas productivas.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Nuestra innovación constante nos permite satisfacer las necesidades
                específicas de cada cliente de manera eficiente, entregando productos
                que conectan emocionalmente con su público objetivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-brand-light rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Flag size={18} className="text-brand-navy" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Empresa</p>
                    <p className="text-sm font-bold text-brand-navy">100% peruana</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-brand-light rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Factory size={18} className="text-brand-navy" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Fabricación</p>
                    <p className="text-sm font-bold text-brand-navy">Planta propia en Lima</p>
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Grid infraestructura */}
            <RevealSection delay={150}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {INFRAESTRUCTURA.map((item, i) => (
                  <RevealSection key={item.label} delay={i * 60}>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center
                                    shadow-sm hover:shadow-md hover:-translate-y-0.5
                                    transition-all duration-300">
                      <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center
                                      justify-center mx-auto mb-3">
                        <item.icon size={20} className="text-brand-navy" strokeWidth={1.8} />
                      </div>
                      <p className="text-xs font-bold text-brand-navy mb-0.5">{item.label}</p>
                      <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ══════════════ MISIÓN Y VISIÓN ══════════════ */}
      <section id="mision" className="py-20 md:py-28 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="text-brand-orange text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                Nuestro propósito
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                Misión y Visión
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Misión */}
            <RevealSection delay={0}>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100
                              hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-brand-navy rounded-2xl flex items-center justify-center mb-6">
                  <Target size={26} className="text-white" strokeWidth={1.8} />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Misión</h3>
                <p className="text-gray-600 leading-relaxed">
                  Potenciar la visibilidad y el impacto de las marcas a través de soluciones
                  publicitarias innovadoras y efectivas. Nos dedicamos a crear productos y
                  servicios de marketing personalizados que conecten emocionalmente con el
                  público, fomenten relaciones duraderas y generen un valor significativo.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Trabajamos con pasión y creatividad para ayudar a nuestros clientes a
                  destacar en un mercado competitivo, siempre comprometidos con la calidad,
                  la sostenibilidad y la satisfacción del cliente.
                </p>
              </div>
            </RevealSection>

            {/* Visión */}
            <RevealSection delay={150}>
              <div className="bg-brand-navy rounded-3xl p-8 md:p-10 shadow-sm h-full
                              hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center mb-6">
                  <Globe size={26} className="text-white" strokeWidth={1.8} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Visión</h3>
                <p className="text-white/80 leading-relaxed">
                  Ser líderes en América Latina en productos promocionales innovadores
                  y personalizados, destacándonos por nuestra excelencia en calidad y
                  conciencia ambiental, para alcanzar reconocimiento global por nuestra
                  innovación, sostenibilidad y responsabilidad social.
                </p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-start gap-3">
                    <Leaf size={18} className="text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-white/70 text-sm leading-relaxed">
                      <span className="text-white font-semibold">Compromiso ambiental:</span>{' '}
                      Nuestros productos son diseñados para ser sostenibles y reciclables,
                      reduciendo nuestro impacto ambiental y promoviendo un futuro más verde.
                    </p>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ══════════════ VALORES ══════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="text-brand-orange text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                Lo que nos define
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                Nuestros valores
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <RevealSection key={val.title} delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center
                                shadow-sm hover:shadow-lg hover:-translate-y-1
                                transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl ${val.bgColor}
                                   flex items-center justify-center mx-auto mb-4`}>
                    <val.icon size={22} className={val.iconColor} strokeWidth={1.8} />
                  </div>
                  <h4 className="font-bold text-brand-navy mb-2">{val.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section className="py-20 bg-brand-orange">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para personalizar tu marca?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Más de 14 años fabricando productos que hacen que las marcas destaquen.
              Cuéntanos tu idea y la hacemos realidad.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-white text-brand-orange
                           font-bold px-8 py-4 rounded-xl transition-all
                           hover:scale-105 active:scale-95 shadow-xl"
              >
                Explorar catálogo
                <ChevronRight size={16} strokeWidth={2.5} />
              </Link>
              <a
                href={WHATSAPP.link('Hola Plastitex, me gustaría cotizar un pedido')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30
                           text-white font-bold px-8 py-4 rounded-xl transition-all
                           border border-white/30"
              >
                <MessageCircle size={16} strokeWidth={2.5} />
                Cotizar por WhatsApp
              </a>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

// ─── Stats con contadores animados ───────────────────────────────────────────
function StatsSection() {
  const { ref, visible } = useScrollReveal(0.2);
  const s0 = useCounter(STATS[0].value, 1800, visible);
  const s1 = useCounter(STATS[1].value, 1800, visible);
  const s2 = useCounter(STATS[2].value, 1800, visible);
  const s3 = useCounter(STATS[3].value, 1800, visible);
  const counts = [s0, s1, s2, s3];

  return (
    <section ref={ref} className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-700
                          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center
                              justify-center mx-auto mb-3">
                <stat.icon size={22} className="text-brand-navy" strokeWidth={1.8} />
              </div>
              <p className="text-4xl font-bold text-brand-navy leading-none mb-1">
                {counts[i]}{stat.suffix}
              </p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}