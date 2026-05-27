'use client';

// components/layout/Navbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO completo:
// 1. Top bar azul marino con datos de contacto (desktop only)
// 2. Navbar principal blanco con logo real, buscador y dropdown de categorías
// 3. Sticky con shadow al scrollear
// 4. Drawer mobile mejorado
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Truck,
  Clock,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect, useRef } from 'react';

// ─── Datos estáticos ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Tomatodos', slug: 'tomatodos' },
  { name: 'Llaveros', slug: 'llaveros' },
  { name: 'Mugs', slug: 'mugs' },
  { name: 'Pad Mouse', slug: 'pad-mouse' },
  { name: 'USB', slug: 'usb' },
  { name: 'Barmats', slug: 'barmats' },
];

const SEARCH_PLACEHOLDERS = [
  'Buscar tomatodos...',
  'Buscar mugs personalizados...',
  'Buscar llaveros...',
  'Buscar USB publicitarios...',
  'Buscar pad mouse...',
];

export default function Navbar() {
  const openCart = useCartStore((s) => s.openCart);
  // Usamos selector que devuelve el número directo → re-render solo cuando cambia el conteo real
  const count = useCartStore((s) => s.items.reduce((acc, it) => acc + it.quantity, 0));

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ─── Detectar scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Rotar placeholder del buscador ─────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─── Cerrar dropdown al hacer click fuera ───────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Bloquear scroll del body cuando el menú mobile está abierto ────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ─── Submit del buscador ────────────────────────────────────────────────────
  // TODO: cuando el endpoint de búsqueda esté listo, reemplazar el push() con
  // la llamada al endpoint y manejar resultados como prefieras (página dedicada
  // /buscar?q=, dropdown de resultados en vivo, etc).
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    router.push(`/catalogo?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ═══════════════════ TOP BAR (desktop only) ═══════════════════ */}
      <div className="hidden lg:block bg-brand-navy text-white/80 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-6">
              <a
                href="tel:+51999999999"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Phone size={12} strokeWidth={2.5} />
                <span>+51 999 999 999</span>
              </a>
              <a
                href="mailto:plastitex.panta@gmail.com"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Mail size={12} strokeWidth={2.5} />
                <span>plastitex.panta@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <Truck size={12} strokeWidth={2.5} />
                <span>Envíos a todo el Perú</span>
              </span>
              <span className="flex items-center gap-1.5 text-white/60">
                <Clock size={12} strokeWidth={2.5} />
                <span>L-V 9am - 6pm</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ NAVBAR PRINCIPAL ═══════════════════ */}
      <div
        className={`bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8 h-20">
            {/* ─── Logo ─────────────────────────────────────── */}
            <Link href="/" className="flex-shrink-0 flex items-center" aria-label="Plastitex - Inicio">
              {/* Desktop: logo completo */}
              <Image
                src="/logo-plastitex.png"
                alt="Plastitex"
                width={180}
                height={55}
                priority
                className="hidden sm:block h-11 w-auto"
              />
              {/* Mobile: solo isotipo (más compacto) */}
              <Image
                src="/isotipo-plastitex.png"
                alt="Plastitex"
                width={40}
                height={44}
                priority
                className="sm:hidden h-11 w-auto"
              />
            </Link>

            {/* ─── Buscador (desktop) ───────────────────────── */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-2xl"
              role="search"
            >
              <div className="relative flex w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
                  className="w-full h-11 pl-11 pr-28 text-sm bg-gray-50 border border-gray-200 rounded-full
                             placeholder:text-gray-400 placeholder:transition-opacity
                             focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15
                             transition-all"
                  aria-label="Buscar productos"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand-orange hover:bg-orange-600 text-white text-sm font-semibold px-5 h-9 rounded-full transition-colors active:scale-95"
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* ─── Navegación (desktop) ─────────────────────── */}
            <nav className="hidden lg:flex items-center gap-7 text-sm">
              <NavLink href="/">Inicio</NavLink>

              {/* Dropdown de categorías */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen((v) => !v)}
                  className={`flex items-center gap-1 font-medium transition-colors py-2 ${
                    categoriesOpen ? 'text-brand-orange' : 'text-gray-700 hover:text-brand-navy'
                  }`}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  Categorías
                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-200/80 py-2 transition-all origin-top ${
                    categoriesOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/catalogo?categoria=${cat.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-orange transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      href="/catalogo"
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-light transition-colors"
                    >
                      Ver todo el catálogo →
                    </Link>
                  </div>
                </div>
              </div>

              <NavLink href="/catalogo">Catálogo</NavLink>
            </nav>

            {/* ─── Acciones derecha (carrito + mobile menu) ─── */}
            <div className="flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-4 lg:px-5 h-11 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-sm hover:shadow-md"
                aria-label={`Abrir carrito${count > 0 ? `, ${count} productos` : ''}`}
              >
                <ShoppingCart size={18} strokeWidth={2.5} />
                <span className="hidden lg:inline">Carrito</span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-navy text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-brand-navy transition-colors"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* ─── Buscador mobile (segunda fila) ─────────────── */}
          <form onSubmit={handleSearch} className="md:hidden pb-3" role="search">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
                className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-full
                           placeholder:text-gray-400
                           focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15
                           transition-all"
                aria-label="Buscar productos"
              />
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════ DRAWER MOBILE ═══════════════════ */}
      {/* Overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menú principal"
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <Image
            src="/logo-plastitex.png"
            alt="Plastitex"
            width={140}
            height={42}
            className="h-9 w-auto"
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-gray-500 hover:text-brand-navy"
            aria-label="Cerrar menú"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto py-2">
          <MobileLink href="/" onClick={() => setMobileOpen(false)}>
            Inicio
          </MobileLink>
          <MobileLink href="/catalogo" onClick={() => setMobileOpen(false)}>
            Catálogo
          </MobileLink>

          <div className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            Categorías
          </div>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              onClick={() => setMobileOpen(false)}
              className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-orange transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Footer del drawer con contacto */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2.5 bg-brand-light/50">
          <a
            href="tel:+51999999999"
            className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-brand-orange"
          >
            <Phone size={14} strokeWidth={2.5} />
            <span>+51 999 999 999</span>
          </a>
          <a
            href="mailto:plastitex.panta@gmail.com"
            className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-brand-orange break-all"
          >
            <Mail size={14} strokeWidth={2.5} />
            <span>plastitex.panta@gmail.com</span>
          </a>
          <div className="flex items-center gap-2.5 text-sm text-gray-500">
            <MapPin size={14} strokeWidth={2.5} />
            <span>Perú</span>
          </div>
        </div>
      </aside>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative font-medium text-gray-700 hover:text-brand-navy transition-colors py-2 group"
    >
      {children}
      {/* Subrayado animado desde el centro */}
      <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-0 bg-brand-orange transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-5 py-3 text-base font-medium text-gray-800 hover:bg-brand-light hover:text-brand-orange transition-colors"
    >
      {children}
    </Link>
  );
}