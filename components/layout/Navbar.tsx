'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, Menu, X, Search, Phone, Mail,
  ChevronDown, Truck, Clock, Users, Briefcase,
  FileText, Info, PackageSearch, LayoutGrid,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { COMPANY } from '@/lib/config';
import { useState, useEffect, useRef } from 'react';
import type { Category } from '@/types';

interface NavbarProps {
  categories?: Category[];
}

const NOSOTROS_LINKS = [
  { name: 'Quiénes somos',        href: '/nosotros',             icon: Info },
  { name: 'Misión y Visión',      href: '/nosotros#mision',      icon: Users },
  { name: 'Trabaja con nosotros', href: '/trabaja-con-nosotros', icon: Briefcase },
];

const ATENCION_LINKS = [
  { name: 'Seguimiento de pedidos', href: '/seguimiento', icon: PackageSearch },
  { name: 'Libro de Reclamaciones', href: '/reclamos',    icon: FileText },
];

const SEARCH_PLACEHOLDERS = [
  'Buscar tomatodos...',
  'Buscar mugs personalizados...',
  'Buscar llaveros...',
  'Buscar USB publicitarios...',
  'Buscar pad mouse...',
];

export default function Navbar({ categories = [] }: NavbarProps) {
  const openCart   = useCartStore((s) => s.openCart);
  const count      = useCartStore((s) => s.items.reduce((acc, it) => acc + it.quantity, 0));
  const pathname   = usePathname();

  const [scrolled,        setScrolled]        = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [nosotrosOpen,    setNosotrosOpen]    = useState(false);
  const [atencionOpen,    setAtencionOpen]    = useState(false);
  const [categoriesOpen,  setCategoriesOpen]  = useState(false);
  const [mobileNosotros,  setMobileNosotros]  = useState(false);
  const [mobileAtencion,  setMobileAtencion]  = useState(false);
  const [searchValue,     setSearchValue]     = useState('');
  const [placeholderIdx,  setPlaceholderIdx]  = useState(0);

  const nosotrosRef   = useRef<HTMLDivElement>(null);
  const atencionRef   = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const router        = useRouter();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nosotrosRef.current && !nosotrosRef.current.contains(e.target as Node))
        setNosotrosOpen(false);
      if (atencionRef.current && !atencionRef.current.contains(e.target as Node))
        setAtencionOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node))
        setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    router.push(`/catalogo?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ═══════════ TOP BAR ═══════════ */}
      <div className="relative z-10 hidden lg:block text-xs bg-brand-navy text-white/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-6">
              <a href={`tel:+51${COMPANY.phone}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={12} strokeWidth={2.5} />
                <span>+51 {COMPANY.phoneDisplay}</span>
              </a>
              <a href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail size={12} strokeWidth={2.5} />
                <span>{COMPANY.email}</span>
              </a>
            </div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <Truck size={12} strokeWidth={2.5} />
                Envíos a todo el Perú
              </span>
              <span className="flex items-center gap-1.5 text-white/60">
                <Clock size={12} strokeWidth={2.5} />
                L-V 9am – 6pm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ NAVBAR PRINCIPAL ═══════════ */}
      <div className={`relative z-10 transition-colors duration-300 bg-white ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8 h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center" aria-label="Plastitex - Inicio">
              <Image src="/logo_sin_frase.png" alt="Plastitex" width={170} height={50} priority
                className="hidden sm:block h-10 w-auto" />
              <Image src="/isotipo-plastitex.png" alt="Plastitex" width={40} height={44} priority
                className="sm:hidden h-10 w-auto" />
            </Link>

            {/* Buscador desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl" role="search">
              <div className="relative flex w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-turquoise transition-colors">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]} aria-label="Buscar productos"
                  className="w-full h-11 pl-11 pr-28 text-sm rounded-full transition-all focus:outline-none
                             focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/15
                             bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:bg-white" />
                <button type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-turquoise hover:bg-brand-teal
                             text-white text-sm font-semibold px-5 h-9 rounded-full transition-colors active:scale-95">
                  Buscar
                </button>
              </div>
            </form>

            {/* Carrito + menú mobile */}
            <div className="flex items-center gap-2">
              <button onClick={openCart}
                className="relative flex items-center gap-2 bg-brand-turquoise hover:bg-brand-teal
                           text-white px-4 lg:px-5 h-11 rounded-full text-sm font-semibold
                           transition-all active:scale-95 shadow-sm hover:shadow-md"
                aria-label={`Abrir carrito${count > 0 ? `, ${count} productos` : ''}`}>
                <ShoppingCart size={18} strokeWidth={2.5} />
                <span className="hidden lg:inline">Carrito</span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-navy text-white text-[10px]
                                   font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center
                                   justify-center ring-2 ring-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>

              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-brand-navy transition-colors"
                aria-label="Abrir menú" aria-expanded={mobileOpen}>
                {mobileOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* Buscador mobile */}
          <form onSubmit={handleSearch} className="md:hidden pb-3" role="search">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} strokeWidth={2.5} />
              </div>
              <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]} aria-label="Buscar productos"
                className="w-full h-10 pl-10 pr-4 text-sm rounded-full transition-all focus:outline-none
                           focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/15
                           bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:bg-white" />
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════ SUB-NAV: CATEGORÍAS + LINKS PRINCIPALES ═══════════ */}
      <div className="hidden lg:block relative z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-1 h-11">
            {/* Dropdown categorías */}
            <div ref={categoriesRef} className="relative">
              <button
                onClick={() => { setCategoriesOpen(!categoriesOpen); setNosotrosOpen(false); setAtencionOpen(false); }}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-brand-navy text-white text-sm font-semibold
                           hover:bg-brand-turquoise transition-colors"
                aria-expanded={categoriesOpen}
              >
                <LayoutGrid size={16} strokeWidth={2} />
                Todas las categorías
                <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl
                               border border-gray-100 overflow-hidden py-2 z-50
                               transition-all duration-200 origin-top-left
                               ${categoriesOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {categories.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-500">No hay categorías</p>
                )}
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalogo?categoria=${cat.slug}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700
                               hover:bg-brand-light hover:text-brand-turquoise transition-colors group/item"
                  >
                    {cat.name}
                    <ChevronDown size={12} strokeWidth={2.5} className="-rotate-90 text-gray-300 group-hover/item:text-brand-turquoise" />
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <Link
                    href="/catalogo"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-turquoise hover:bg-brand-light transition-colors"
                  >
                    Ver todo el catálogo
                    <ChevronDown size={12} strokeWidth={2.5} className="-rotate-90" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {/* Links principales */}
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/catalogo">Catálogo</NavLink>

            {/* Dropdown Nosotros */}
            <div ref={nosotrosRef} className="relative">
              <button onClick={() => { setNosotrosOpen(!nosotrosOpen); setAtencionOpen(false); setCategoriesOpen(false); }}
                className="relative flex items-center gap-1 font-semibold transition-colors py-2 px-3 group text-gray-700 hover:text-brand-navy"
                aria-expanded={nosotrosOpen}>
                Nosotros
                <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${nosotrosOpen ? 'rotate-180' : ''}`} />
                <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-0 bg-brand-turquoise transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
              </button>
              <div className={`absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl
                               border border-gray-100 overflow-hidden py-1 z-50
                               transition-all duration-200 origin-top-left
                               ${nosotrosOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {NOSOTROS_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setNosotrosOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                               hover:bg-brand-light hover:text-brand-turquoise transition-colors group/item">
                    <item.icon size={15} strokeWidth={2} className="text-gray-400 group-hover/item:text-brand-turquoise transition-colors flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dropdown Atención */}
            <div ref={atencionRef} className="relative">
              <button onClick={() => { setAtencionOpen(!atencionOpen); setNosotrosOpen(false); setCategoriesOpen(false); }}
                className="relative flex items-center gap-1 font-semibold transition-colors py-2 px-3 group text-gray-700 hover:text-brand-navy"
                aria-expanded={atencionOpen}>
                Atención
                <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${atencionOpen ? 'rotate-180' : ''}`} />
                <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-0 bg-brand-turquoise transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
              </button>
              <div className={`absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl
                               border border-gray-100 overflow-hidden py-1 z-50
                               transition-all duration-200 origin-top-left
                               ${atencionOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {ATENCION_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setAtencionOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                               hover:bg-brand-light hover:text-brand-turquoise transition-colors group/item">
                    <item.icon size={15} strokeWidth={2} className="text-gray-400 group-hover/item:text-brand-turquoise transition-colors flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ DRAWER MOBILE ═══════════ */}
      <div onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40
                    ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true" />

      <aside className={`lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white
                         shadow-2xl transition-transform duration-300 flex flex-col z-50
                         ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Menú principal">

        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <Image src="/logo-plastitex.png" alt="Plastitex" width={140} height={42} className="h-9 w-auto" />
          <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500 hover:text-brand-navy" aria-label="Cerrar menú">
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto py-2">
          <MobileLink href="/" onClick={() => setMobileOpen(false)}>Inicio</MobileLink>
          <MobileLink href="/catalogo" onClick={() => setMobileOpen(false)}>Catálogo</MobileLink>

          {/* Categorías mobile */}
          {categories.length > 0 && (
            <div className="border-t border-gray-100 mt-2">
              <p className="px-5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Categorías
              </p>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/catalogo?categoria=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-7 py-2.5 text-sm text-gray-600
                             hover:text-brand-turquoise transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Nosotros mobile */}
          <div className="border-t border-gray-100 mt-2">
            <button onClick={() => setMobileNosotros(!mobileNosotros)}
              className="w-full flex items-center justify-between px-5 py-3 text-base font-medium
                         text-gray-800 hover:bg-brand-light hover:text-brand-turquoise transition-colors">
              Nosotros
              <ChevronDown size={16} strokeWidth={2.5} className={`transition-transform duration-200 text-gray-400 ${mobileNosotros ? 'rotate-180' : ''}`} />
            </button>
            {mobileNosotros && (
              <div className="bg-gray-50">
                {NOSOTROS_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-7 py-2.5 text-sm text-gray-600
                               hover:text-brand-turquoise transition-colors">
                    <item.icon size={15} strokeWidth={2} className="text-gray-400 flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Atención mobile */}
          <div className="border-t border-gray-100">
            <button onClick={() => setMobileAtencion(!mobileAtencion)}
              className="w-full flex items-center justify-between px-5 py-3 text-base font-medium
                         text-gray-800 hover:bg-brand-light hover:text-brand-turquoise transition-colors">
              Atención
              <ChevronDown size={16} strokeWidth={2.5} className={`transition-transform duration-200 text-gray-400 ${mobileAtencion ? 'rotate-180' : ''}`} />
            </button>
            {mobileAtencion && (
              <div className="bg-gray-50">
                {ATENCION_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-7 py-2.5 text-sm text-gray-600
                               hover:text-brand-turquoise transition-colors">
                    <item.icon size={15} strokeWidth={2} className="text-gray-400 flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer drawer */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2.5 bg-brand-light/50">
          <a href={`tel:+51${COMPANY.phone}`}
            className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-brand-turquoise transition-colors">
            <Phone size={14} strokeWidth={2.5} />
            <span>{COMPANY.phoneDisplay} / {COMPANY.phoneSecondary}</span>
          </a>
          <a href={`mailto:${COMPANY.email}`}
            className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-brand-turquoise transition-colors break-all">
            <Mail size={14} strokeWidth={2.5} />
            <span>{COMPANY.email}</span>
          </a>
        </div>
      </aside>
    </header>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="relative font-semibold transition-colors py-2 px-3 group text-gray-700 hover:text-brand-navy">
      {children}
      <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-0 bg-brand-turquoise transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
    </Link>
  );
}

function MobileLink({ href, onClick, children }: {
  href: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="block px-5 py-3 text-base font-medium text-gray-800 hover:bg-brand-light hover:text-brand-turquoise transition-colors">
      {children}
    </Link>
  );
}
