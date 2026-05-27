'use client';

// components/catalog/Pagination.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Paginación numerada estilo Amazon/Mercado Libre.
//
// Muestra: prev · 1 · ... · 4 · 5 · 6 · ... · 10 · next
//   - Primera y última página siempre visibles
//   - Página actual y vecinos siempre visibles
//   - "..." entre saltos
//
// Cambiar de página actualiza la URL (?page=N) y scrollea al top del grid.
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

interface Props {
  totalPages: number;
  totalCount: number;
  pageSize: number;
  /** Ref del grid para scroll suave al cambiar página */
  scrollTargetRef?: React.RefObject<HTMLElement | null>;
}

export default function Pagination({
  totalPages,
  totalCount,
  pageSize,
  scrollTargetRef,
}: Props) {
  const { filters, setFilter } = useCatalogFilters();
  const page = filters.page;

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setFilter('page', newPage);
    // Scroll suave al top del grid
    setTimeout(() => {
      scrollTargetRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  // Calcular qué páginas mostrar
  const visiblePages = computeVisiblePages(page, totalPages);

  // Rango actual de productos visibles
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info de rango */}
      <p className="text-sm text-gray-500 order-2 sm:order-1">
        Mostrando{' '}
        <span className="font-semibold text-brand-navy">
          {start}–{end}
        </span>{' '}
        de <span className="font-semibold text-brand-navy">{totalCount}</span>
      </p>

      {/* Botones */}
      <nav
        className="flex items-center gap-1.5 order-1 sm:order-2"
        aria-label="Paginación del catálogo"
      >
        {/* Anterior */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
          className="inline-flex items-center gap-1 px-3 sm:px-4 h-10 rounded-xl
                     border border-gray-200 text-sm font-medium text-gray-700
                     hover:border-brand-navy hover:text-brand-navy
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números */}
        <div className="hidden sm:flex items-center gap-1">
          {visiblePages.map((p, idx) =>
            p === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-gray-400 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                aria-label={`Ir a página ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
                            ${
                              p === page
                                ? 'bg-brand-navy text-white shadow-sm'
                                : 'border border-gray-200 text-gray-700 hover:border-brand-navy hover:text-brand-navy'
                            }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* En mobile: solo "Página N de M" */}
        <div className="sm:hidden text-sm text-gray-600 font-medium px-2">
          {page} <span className="text-gray-400">/</span> {totalPages}
        </div>

        {/* Siguiente */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
          className="inline-flex items-center gap-1 px-3 sm:px-4 h-10 rounded-xl
                     border border-gray-200 text-sm font-medium text-gray-700
                     hover:border-brand-navy hover:text-brand-navy
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calcula qué páginas mostrar con ellipsis
// Patrón: 1 · ... · current-1 · current · current+1 · ... · last
// ─────────────────────────────────────────────────────────────────────────────
function computeVisiblePages(
  current: number,
  total: number,
): (number | '...')[] {
  const pages: (number | '...')[] = [];
  const range = 1; // vecinos visibles a cada lado de current

  for (let i = 1; i <= total; i++) {
    const isEdge = i === 1 || i === total;
    const isNearCurrent = Math.abs(i - current) <= range;
    if (isEdge || isNearCurrent) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
}