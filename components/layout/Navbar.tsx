'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { openCart, totalItems } = useCartStore();
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCount(totalItems());
  }, [totalItems()]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-brand-navy shadow-lg' : 'bg-brand-navy/95 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold tracking-tight text-white">Plasti</span>
            <span className="text-2xl font-bold tracking-tight text-brand-orange">tex</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
              Inicio
            </Link>
            <Link href="/catalogo" className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
              Catálogo
            </Link>
          </nav>

          {/* Carrito + mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-brand-orange hover:bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-brand-navy text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white hover:text-brand-orange transition-colors duration-200"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú mobile */}
      <div className={`md:hidden bg-brand-navy border-t border-white/10 transition-all duration-300 overflow-hidden ${
        mobileOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="flex flex-col px-4 py-4 gap-4">
          <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
            Inicio
          </Link>
          <Link href="/catalogo" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
            Catálogo
          </Link>
        </nav>
      </div>
    </header>
  );
}