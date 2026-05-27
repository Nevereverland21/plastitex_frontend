'use client';

// components/catalog/CatalogToolbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Toolbar superior del catálogo:
//   - Botón "Filtros" (solo mobile, abre drawer)
//   - Contador de resultados
//   - Selector de ordenamiento
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import {
  useCatalogFilters,
  type OrderingValue,
} from '@/hooks/useCatalogFilters';

const ORDERING_OPTIONS: { value: OrderingValue; label: string }[] = [
  { value: '-created_at', label: 'Más recientes' },
  { value: 'price',       label: 'Menor precio' },
  { value: '-price',      label: 'Mayor precio' },
  { value: 'name',        label: 'A → Z' },
  { value: '-name',       label: 'Z → A' },
];

interface Props {
  totalCount: number;
  loading?: boolean;
  /** Callback para abrir el drawer de filtros (solo mobile) */
  onOpenFilters: () => void;
  /** Cantidad de filtros activos — para badge en el botón mobile */
  activeFiltersCount: number;
}

export default function CatalogToolbar({
  totalCount,
  loading = false,
  onOpenFilters,
  activeFiltersCount,
}: Props) {
  const { filters, setFilter } = useCatalogFilters();

  return (
    <div className="flex items-center gap-3 mb-5">
      {/* Botón "Filtros" — solo mobile */}
      <button
        onClick={onOpenFilters}
        className="lg:hidden relative inline-flex items-center gap-2
                   bg-white border border-gray-200 hover:border-brand-navy
                   px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-navy
                   transition-colors"
      >
        <SlidersHorizontal size={15} strokeWidth={2.5} />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold
                           min-w-[18px] h-[18px] px-1 rounded-full
                           flex items-center justify-center ring-2 ring-white">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Contador */}
      <div className="flex-1 text-sm text-gray-600">
        {loading ? (
          <span className="text-gray-400">Cargando…</span>
        ) : (
          <>
            <span className="font-bold text-brand-navy">{totalCount}</span>{' '}
            {totalCount === 1 ? 'producto' : 'productos'}
          </>
        )}
      </div>

      {/* Ordering */}
      <div className="relative">
        <ArrowUpDown
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          strokeWidth={2.5}
        />
        <select
          value={filters.ordering}
          onChange={(e) => setFilter('ordering', e.target.value as OrderingValue)}
          className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 hover:border-gray-300
                     rounded-xl text-sm font-medium text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
                     appearance-none cursor-pointer transition-colors"
          aria-label="Ordenar productos"
        >
          {ORDERING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}