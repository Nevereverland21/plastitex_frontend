'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories, PaginatedResponse } from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import {
  Search, PackageSearch, SlidersHorizontal,
  RefreshCw, WifiOff, ChevronLeft, ChevronRight,
  ArrowUpDown, X,
} from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { WHATSAPP } from '@/lib/config';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

const ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Más recientes' },
  { value: 'price',       label: 'Menor precio' },
  { value: '-price',      label: 'Mayor precio' },
  { value: 'name',        label: 'A → Z' },
  { value: '-name',       label: 'Z → A' },
] as const;

type OrderingValue = typeof ORDERING_OPTIONS[number]['value'];

// ─── Hook: debounce ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-9 bg-gray-200 rounded-full w-full mt-2" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CatalogoContent() {
  const searchParams = useSearchParams();

  // ── Estado de filtros ──────────────────────────────────────────────────────
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<string | null>(
    searchParams.get('category')
  );
  const [ordering, setOrdering]   = useState<OrderingValue>('-created_at');
  const [page, setPage]           = useState(1);

  // ── Estado de datos ────────────────────────────────────────────────────────
  const [data, setData]           = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Debounce del search: espera 400ms tras dejar de escribir
  const debouncedSearch = useDebounce(search, 400);

  // Ref para scroll al top del grid al cambiar página
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Cargar categorías una sola vez ─────────────────────────────────────────
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // ── Fetch productos cuando cambian los filtros ─────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(false);

    getProducts({
      ...(selected        && { category: selected }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ordering,
      page,
      page_size: PAGE_SIZE,
    })
      .then((res) => {
        setData(res);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [selected, debouncedSearch, ordering, page, retryCount]);

  // ── Resetear a page=1 cuando cambian filtros (no paginación) ──────────────
  const handleCategoryChange = useCallback((slug: string | null) => {
    setSelected(slug);
    setSearch('');
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleOrderingChange = useCallback((value: OrderingValue) => {
    setOrdering(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    // Scroll suave al tope del grid
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── Métricas de paginación ─────────────────────────────────────────────────
  const totalCount  = data?.count ?? 0;
  const totalPages  = Math.ceil(totalCount / PAGE_SIZE);
  const products    = data?.results ?? [];
  const hasFilters  = !!selected || !!debouncedSearch || ordering !== '-created_at';

  const clearFilters = () => {
    setSearch('');
    setSelected(null);
    setOrdering('-created_at');
    setPage(1);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Barra de filtros ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">

          {/* Fila superior: búsqueda + ordenamiento + contador */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Ordenamiento */}
            <div className="relative">
              <ArrowUpDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={ordering}
                onChange={(e) => handleOrderingChange(e.target.value as OrderingValue)}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy appearance-none cursor-pointer transition-all duration-200"
              >
                {ORDERING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Contador */}
            <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0 px-1">
              <SlidersHorizontal size={15} />
              <span>
                {loading
                  ? '...'
                  : `${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`
                }
              </span>
            </div>
          </div>

          {/* Filtros activos — badge para limpiar todo */}
          {hasFilters && !loading && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Filtros activos:</span>
              {selected && (
                <span className="inline-flex items-center gap-1 bg-brand-navy/8 text-brand-navy text-xs font-medium px-2.5 py-1 rounded-full">
                  {categories.find(c => c.slug === selected)?.name ?? selected}
                  <button onClick={() => handleCategoryChange(null)}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 bg-brand-navy/8 text-brand-navy text-xs font-medium px-2.5 py-1 rounded-full">
                  &quot;{debouncedSearch}&quot;
                  <button onClick={() => handleSearchChange('')}>
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-brand-orange underline ml-1 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Categorías */}
          {categories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <CategoryFilter
                categories={categories}
                selected={selected}
                onSelect={handleCategoryChange}
              />
            </div>
          )}
        </div>

        {/* ── Contenido principal ──────────────────────────────────────────── */}
        <div ref={gridRef}>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>

          ) : error ? (
            /* Error de conexión */
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                <WifiOff size={36} strokeWidth={1.5} className="text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-1">No se pudo cargar el catálogo</p>
                <p className="text-sm text-gray-400">Verifica tu conexión a internet e intenta de nuevo</p>
              </div>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-orange transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <RefreshCw size={15} />
                Reintentar
              </button>
            </div>

          ) : products.length === 0 && debouncedSearch ? (
            /* Sin resultados de búsqueda */
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <PackageSearch size={36} strokeWidth={1.5} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-600 mb-1">
                  Sin resultados para &quot;{debouncedSearch}&quot;
                </p>
                <p className="text-sm text-gray-400">Intenta con otro término o explora el catálogo completo</p>
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-medium hover:border-brand-navy hover:text-brand-navy transition-all duration-200"
              >
                Limpiar búsqueda
              </button>
            </div>

          ) : products.length === 0 ? (
            /* Catálogo vacío */
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-24 h-24 bg-brand-navy/5 border-2 border-dashed border-brand-navy/20 rounded-full flex items-center justify-center">
                <PackageSearch size={40} strokeWidth={1} className="text-brand-navy/30" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700 mb-2">Catálogo en construcción</p>
                <p className="text-sm text-gray-400 max-w-sm">
                  Estamos preparando nuestros productos. Mientras tanto, puedes cotizar directamente por WhatsApp.
                </p>
              </div>
              <a
                href={WHATSAPP.link('¡Hola! Quiero cotizar productos Plastitex.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Cotizar por WhatsApp <ArrowRight size={14} />
              </a>
            </div>

          ) : (
            /* ── Grid de productos ── */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* ── Paginación ── */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">

                  {/* Info */}
                  <p className="text-sm text-gray-400 order-2 sm:order-1">
                    Página <span className="font-semibold text-gray-600">{page}</span> de{' '}
                    <span className="font-semibold text-gray-600">{totalPages}</span>
                    {' '}·{' '}
                    <span className="font-semibold text-gray-600">{totalCount}</span> productos
                  </p>

                  {/* Botones */}
                  <div className="flex items-center gap-2 order-1 sm:order-2">

                    {/* Anterior */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-navy hover:text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronLeft size={16} /> Anterior
                    </button>

                    {/* Números de página — máximo 5 visibles */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          // Muestra: primera, última, actual y sus vecinos
                          return (
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1
                          );
                        })
                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                          // Inserta "..." entre saltos
                          if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                            acc.push('...');
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p as number)}
                              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                                p === page
                                  ? 'bg-brand-navy text-white shadow-sm'
                                  : 'border border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )
                      }
                    </div>

                    {/* Siguiente */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-navy hover:text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}