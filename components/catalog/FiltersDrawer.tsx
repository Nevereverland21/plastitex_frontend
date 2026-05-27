'use client';

// components/catalog/FiltersDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drawer lateral mobile que envuelve el FiltersSidebar.
//
// En desktop (lg+) el FiltersSidebar va en columna lateral fija.
// En mobile no cabe, así que se abre como overlay con animación.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { X } from 'lucide-react';
import FiltersSidebar from './FiltersSidebar';
import type { Category } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  priceRange: { min: number; max: number };
}

export default function FiltersDrawer({
  open,
  onClose,
  categories,
  priceRange,
}: Props) {
  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50
                    transition-opacity duration-300
                    ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[85%] max-w-sm
                    bg-white shadow-2xl z-50
                    flex flex-col
                    transition-transform duration-300
                    ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Filtros"
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100">
          <h2 className="text-base font-bold text-brand-navy">Filtros</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="p-2 -m-2 text-gray-500 hover:text-brand-navy transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FiltersSidebar
            categories={categories}
            priceRange={priceRange}
          />
        </div>

        {/* CTA aplicar */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full bg-brand-navy hover:bg-brand-orange text-white
                       py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Ver productos
          </button>
        </div>
      </aside>
    </>
  );
}