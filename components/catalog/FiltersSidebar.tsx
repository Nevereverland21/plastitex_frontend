'use client';

// components/catalog/FiltersSidebar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sidebar de filtros del catálogo.
//
// Filtros:
//   - Categorías (multi-select checkbox)
//   - Rango de precio (slider dual)
//   - Solo con stock (toggle)
//
// Se usa tanto en desktop (sticky) como dentro del FiltersDrawer mobile.
// ─────────────────────────────────────────────────────────────────────────────

import { Check, RotateCcw } from 'lucide-react';
import type { Category } from '@/types';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import PriceRangeSlider from './PriceRangeSlider';

interface Props {
  categories: Category[];
  /** Precio máximo de los productos del backend (para los límites del slider) */
  priceRange: { min: number; max: number };
}

export default function FiltersSidebar({ categories, priceRange }: Props) {
  const {
    filters,
    setFilter,
    toggleCategory,
    selectedCategories,
    hasActiveFilters,
    clearFilters,
  } = useCatalogFilters();

  return (
    <aside className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-brand-navy">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:text-orange-600 transition-colors"
          >
            <RotateCcw size={12} strokeWidth={2.5} />
            Limpiar
          </button>
        )}
      </div>

      {/* ── Categorías ─────────────────────────────────────────────── */}
      <FilterSection title="Categorías">
        <ul className="space-y-2">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.slug);
            return (
              <li key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.slug)}
                  className="group w-full flex items-center gap-2.5 text-left text-sm
                             text-gray-700 hover:text-brand-navy transition-colors"
                >
                  {/* Checkbox custom */}
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded border transition-all
                                ${
                                  isSelected
                                    ? 'bg-brand-orange border-brand-orange'
                                    : 'bg-white border-gray-300 group-hover:border-gray-400'
                                }`}
                  >
                    {isSelected && (
                      <Check size={12} strokeWidth={3} className="text-white" />
                    )}
                  </span>
                  <span className={isSelected ? 'font-semibold text-brand-navy' : ''}>
                    {cat.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {/* ── Precio ─────────────────────────────────────────────────── */}
      <FilterSection title="Precio">
        <PriceRangeSlider
          min={priceRange.min}
          max={priceRange.max}
          value={[filters.minPrice, filters.maxPrice]}
          onChange={([minP, maxP]) => {
            // Si los valores son iguales a los extremos, los borramos de la URL
            const minToSet = minP <= priceRange.min ? undefined : minP;
            const maxToSet = maxP >= priceRange.max ? undefined : maxP;
            setFilter('minPrice', minToSet);
            setFilter('maxPrice', maxToSet);
          }}
        />
      </FilterSection>

      {/* ── Stock ──────────────────────────────────────────────────── */}
      <FilterSection title="Disponibilidad">
        <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer group">
          <span
            className={`flex-shrink-0 w-4 h-4 rounded border transition-all
                        ${
                          filters.inStock
                            ? 'bg-brand-orange border-brand-orange'
                            : 'bg-white border-gray-300 group-hover:border-gray-400'
                        }`}
          >
            {filters.inStock && (
              <Check size={12} strokeWidth={3} className="text-white" />
            )}
          </span>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => setFilter('inStock', e.target.checked)}
            className="sr-only"
          />
          <span className={filters.inStock ? 'font-semibold text-brand-navy' : ''}>
            Solo con stock
          </span>
        </label>
      </FilterSection>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: sección con título
// ─────────────────────────────────────────────────────────────────────────────
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-gray-100 pt-5 first-of-type:border-t-0 first-of-type:pt-0">
      <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-gray-500 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}