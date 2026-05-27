'use client';

// components/catalog/EmptyResults.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Estados vacíos del catálogo:
//   - "no-results": hay filtros activos pero no hay productos que matcheen
//   - "no-search": el search del usuario no devolvió nada
//   - "empty-catalog": no hay productos en la BD aún
// ─────────────────────────────────────────────────────────────────────────────

import { PackageSearch, ArrowRight } from 'lucide-react';
import { WHATSAPP } from '@/lib/config';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

interface Props {
  /** Si hay query de búsqueda, mostramos UX específica de "sin resultados" */
  searchQuery?: string;
  /** Si hay filtros activos pero no es búsqueda específicamente */
  hasFilters?: boolean;
}

export default function EmptyResults({ searchQuery, hasFilters }: Props) {
  const { clearFilters } = useCatalogFilters();

  // ─── Caso 1: búsqueda sin resultados ──────────────────────────────────────
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <PackageSearch size={36} strokeWidth={1.5} className="text-gray-400" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-lg font-bold text-brand-navy mb-1">
            Sin resultados para &quot;{searchQuery}&quot;
          </p>
          <p className="text-sm text-gray-500">
            Intenta con otro término, revisa los filtros, o explora todo el catálogo.
          </p>
        </div>
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-orange text-white
                     px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          Ver todo el catálogo
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  // ─── Caso 2: filtros activos sin resultados ───────────────────────────────
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <PackageSearch size={36} strokeWidth={1.5} className="text-gray-400" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-lg font-bold text-brand-navy mb-1">
            No hay productos con esos filtros
          </p>
          <p className="text-sm text-gray-500">
            Prueba relajar algún filtro o ver el catálogo completo.
          </p>
        </div>
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-orange text-white
                     px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    );
  }

  // ─── Caso 3: catálogo completamente vacío ─────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="w-24 h-24 bg-brand-navy/5 border-2 border-dashed border-brand-navy/20
                      rounded-full flex items-center justify-center">
        <PackageSearch size={40} strokeWidth={1} className="text-brand-navy/30" />
      </div>
      <div className="text-center max-w-md">
        <p className="text-xl font-bold text-brand-navy mb-1">
          Catálogo en construcción
        </p>
        <p className="text-sm text-gray-500">
          Estamos preparando nuestros productos. Mientras tanto, puedes cotizar
          directamente por WhatsApp.
        </p>
      </div>
      <a
        href={WHATSAPP.link('¡Hola! Quiero cotizar productos Plastitex.')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white
                   px-6 py-3 rounded-full text-sm font-semibold transition-all
                   hover:scale-105 active:scale-95 shadow-md shadow-green-500/25"
      >
        Cotizar por WhatsApp
        <ArrowRight size={14} strokeWidth={2.5} />
      </a>
    </div>
  );
}