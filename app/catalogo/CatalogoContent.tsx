'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import type { Product, Category, CatalogType } from '@/types';
import type { PaginatedResponse } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import FiltersSidebar from '@/components/catalog/FiltersSidebar';
import FiltersDrawer from '@/components/catalog/FiltersDrawer';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import CatalogToggle from '@/components/catalog/CatalogToggle';
import ActiveFilters from '@/components/catalog/ActiveFilters';
import Pagination from '@/components/catalog/Pagination';
import EmptyResults from '@/components/catalog/EmptyResults';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

const PAGE_SIZE = 24;

interface Props {
  initialData: PaginatedResponse<Product> | null;
  categories: Category[];
  priceRange: { min: number; max: number };
  catalogType: CatalogType | 'all';
}

export default function CatalogoContent({
  initialData,
  categories,
  priceRange,
  catalogType,
}: Props) {
  const { filters, setFilter, hasActiveFilters, selectedCategories } =
    useCatalogFilters();

  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === (filters.search ?? '')) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        setFilter('search', searchInput || undefined);
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const products = initialData?.results ?? [];
  const totalCount = initialData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const activeFiltersCount =
    selectedCategories.length +
    (filters.search ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* ═══════════════ HEADER ═══════════════ */}
        <header className="mb-6">
          <p className="text-brand-orange text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Catálogo
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy tracking-tight">
            {catalogType === 'retail'
              ? 'Productos Minoristas'
              : catalogType === 'wholesale'
              ? 'Productos Mayoristas'
              : 'Todos los productos'}
          </h1>
        </header>

        {/* ═══════════════ TOGGLE MINORISTA / MAYORISTA ═══════════════ */}
        <CatalogToggle />

        {/* ═══════════════ BUSCADOR ═══════════════ */}
        <div className="mb-6 max-w-2xl">
          <div className="relative">
            <Search
              size={18}
              strokeWidth={2.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar productos por nombre o descripción..."
              className="w-full h-12 pl-12 pr-12 text-sm bg-brand-light
                         border border-gray-200 rounded-full
                         placeholder:text-gray-400
                         focus:outline-none focus:bg-white focus:border-brand-orange
                         focus:ring-2 focus:ring-brand-orange/15
                         transition-all"
              aria-label="Buscar productos"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-brand-navy transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════ LAYOUT: sidebar + grid ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">

          {/* ─── Sidebar desktop (sticky) ─── */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <FiltersSidebar
                categories={categories}
                priceRange={priceRange}
              />
            </div>
          </div>

          {/* ─── Contenido principal ─── */}
          <div>
            <CatalogToolbar
              totalCount={totalCount}
              loading={isPending}
              onOpenFilters={() => setDrawerOpen(true)}
              activeFiltersCount={activeFiltersCount}
            />

            <ActiveFilters categories={categories} />

            <div ref={gridRef} className="min-h-[400px]">
              {isPending && initialData === null ? (
                <ProductGridSkeleton count={8} />
              ) : products.length === 0 ? (
                <EmptyResults
                  searchQuery={filters.search}
                  hasFilters={hasActiveFilters && !filters.search}
                />
              ) : (
                <>
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5
                                ${isPending ? 'opacity-50 pointer-events-none' : ''}
                                transition-opacity duration-200`}
                  >
                    {products.map((product, i) => (
                      <div
                        key={product.id}
                        className="animate-fade-in-up"
                        style={{
                          animationDelay: `${i * 40}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  <Pagination
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    scrollTargetRef={gridRef}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        priceRange={priceRange}
      />
    </div>
  );
}

// ─── Skeleton actualizado ──────────────────────────────────────────────────────
function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
        >
          {/* Imagen */}
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite]
                          bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
          {/* Contenido */}
          <div className="p-4 space-y-3">
            {/* Categoría */}
            <div className="h-2.5 bg-orange-100 rounded-full w-1/3" />
            {/* Nombre */}
            <div className="h-4 bg-gray-200 rounded-full w-4/5" />
            <div className="h-4 bg-gray-100 rounded-full w-3/5" />
            {/* Tiers — 3 chips */}
            <div className="flex gap-1.5 mt-1">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-5 w-16 bg-gray-100 rounded-full" />
              ))}
            </div>
            {/* Footer: colores + precio */}
            <div className="flex items-end justify-between pt-2 border-t border-gray-50">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-4 h-4 rounded-full bg-gray-200" />
                ))}
              </div>
              <div className="text-right space-y-1">
                <div className="h-2 bg-gray-100 rounded-full w-8 ml-auto" />
                <div className="h-5 bg-gray-200 rounded-full w-14" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}