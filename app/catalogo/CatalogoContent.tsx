'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import type { Product, Category } from '@/types';
import type { PaginatedResponse } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import FiltersSidebar from '@/components/catalog/FiltersSidebar';
import FiltersDrawer from '@/components/catalog/FiltersDrawer';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import ActiveFilters from '@/components/catalog/ActiveFilters';
import Pagination from '@/components/catalog/Pagination';
import EmptyResults from '@/components/catalog/EmptyResults';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

const PAGE_SIZE = 24;

interface Props {
  initialData: PaginatedResponse<Product> | null;
  categories: Category[];
  priceRange: { min: number; max: number };
}

export default function CatalogoContent({
  initialData,
  categories,
  priceRange,
}: Props) {
  const { filters, setFilter, hasActiveFilters, selectedCategories } =
    useCatalogFilters();

  // useTransition marca el componente como "pendiente" cuando navegamos —
  // sirve para mostrar skeleton mientras llega la nueva data del server.
  const [isPending, startTransition] = useTransition();

  // Estado del drawer mobile
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Estado local del input de búsqueda (debounced antes de aplicar)
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  // Ref para scroll suave al cambiar de página
  const gridRef = useRef<HTMLDivElement>(null);

  // Sincronizar input cuando cambia el filtro desde fuera (ej. limpiar)
  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  // Debounce del input de búsqueda → URL
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

  // ─── Refrescar la data del server cuando cambian los filtros ──────────────
  // Como filters depende de la URL, y la URL cambia con router.push, Next.js
  // automáticamente re-ejecuta el server component padre. No necesitamos
  // refetch manual — solo asegurarnos de que el initialData se actualice.

  // ─── Métricas de paginación ───────────────────────────────────────────────
  const products = initialData?.results ?? [];
  const totalCount = initialData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Cuántos filtros activos (para badge del botón mobile)
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
            Todos los productos
          </h1>
        </header>

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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors"
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
              {/* ─── Estados ─── */}
              {isPending && initialData === null ? (
                <ProductGridSkeleton count={6} />
              ) : products.length === 0 ? (
                <EmptyResults
                  searchQuery={filters.search}
                  hasFilters={hasActiveFilters && !filters.search}
                />
              ) : (
                <>
                  {/* Grid de productos */}
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

      {/* ─── Drawer mobile de filtros ─── */}
      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        priceRange={priceRange}
      />
    </div>
  );
}

// ─── Skeleton del grid ───────────────────────────────────────────────────────
function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
        >
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
                            bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-full" />
            <div className="h-9 bg-gray-200 rounded-xl w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}