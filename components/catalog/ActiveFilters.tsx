'use client';

// components/catalog/ActiveFilters.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Muestra los filtros activos como chips removibles.
// Cada chip tiene una X para quitar ese filtro individual.
// También incluye un "Limpiar todos" al final.
// ─────────────────────────────────────────────────────────────────────────────

import { X } from 'lucide-react';
import type { Category } from '@/types';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

interface Props {
  categories: Category[];
}

export default function ActiveFilters({ categories }: Props) {
  const {
    filters,
    selectedCategories,
    hasActiveFilters,
    setFilter,
    toggleCategory,
    clearFilters,
  } = useCatalogFilters();

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-xs text-gray-500 font-semibold mr-1">Filtros:</span>

      {/* Categorías */}
      {selectedCategories.map((slug) => {
        const cat = categories.find((c) => c.slug === slug);
        return (
          <Chip
            key={slug}
            label={cat?.name ?? slug}
            onRemove={() => toggleCategory(slug)}
          />
        );
      })}

      {/* Search */}
      {filters.search && (
        <Chip
          label={`"${filters.search}"`}
          onRemove={() => setFilter('search', undefined)}
        />
      )}

      {/* Precio */}
      {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
        <Chip
          label={`S/ ${filters.minPrice ?? '0'} — S/ ${filters.maxPrice ?? '∞'}`}
          onRemove={() => {
            setFilter('minPrice', undefined);
            setFilter('maxPrice', undefined);
          }}
        />
      )}

      {/* Stock */}
      {filters.inStock && (
        <Chip
          label="Solo con stock"
          onRemove={() => setFilter('inStock', false)}
        />
      )}

      {/* Destacados */}
      {filters.featured && (
        <Chip
          label="Destacados"
          onRemove={() => setFilter('featured', false)}
        />
      )}

      {/* Personalizables */}
      {filters.allowsLogo && (
        <Chip
          label="Personalizables"
          onRemove={() => setFilter('allowsLogo', false)}
        />
      )}

      {/* Limpiar todos */}
      <button
        onClick={clearFilters}
        className="text-xs font-semibold text-brand-orange hover:text-orange-600
                   underline underline-offset-2 ml-1 transition-colors"
      >
        Limpiar todos
      </button>
    </div>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand-light border border-gray-200
                     text-brand-navy text-xs font-semibold px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="text-gray-500 hover:text-brand-orange transition-colors"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  );
}