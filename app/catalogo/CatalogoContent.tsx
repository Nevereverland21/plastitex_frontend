'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { Search, PackageSearch, SlidersHorizontal, RefreshCw, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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

export default function CatalogoContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(categoryParam);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);

    getProducts(selected ? { category: selected } : undefined)
      .then((data) => {
        setProducts(data);
        setFiltered(data);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setProducts([]);
        setFiltered([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selected, retryCount]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(products);
      return;
    }
    const query = search.toLowerCase();
    setFiltered(
      products.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(query) ?? false;
        const descMatch = p.description?.toLowerCase().includes(query) ?? false;
        const catMatch = p.category?.name?.toLowerCase().includes(query) ?? false;
        return nameMatch || descMatch || catMatch;
      })
    );
  }, [search, products]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Barra búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
              <SlidersHorizontal size={16} />
              <span>
                {loading ? '...' : `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`}
              </span>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <CategoryFilter
                categories={categories}
                selected={selected}
                onSelect={(slug) => { setSelected(slug); setSearch(''); }}
              />
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>

        ) : error ? (
          /* Estado: error de conexión */
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
              <WifiOff size={36} strokeWidth={1.5} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-1">No se pudo cargar el catálogo</p>
              <p className="text-sm text-gray-400">Verifica tu conexión a internet e intenta de nuevo</p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-orange transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <RefreshCw size={15} />
              Reintentar
            </button>
          </div>

        ) : filtered.length === 0 && search ? (
          /* Estado: sin resultados de búsqueda */
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <PackageSearch size={36} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600 mb-1">
                Sin resultados para "{search}"
              </p>
              <p className="text-sm text-gray-400">Intenta con otro término o explora el catálogo completo</p>
            </div>
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-medium hover:border-brand-navy hover:text-brand-navy transition-all duration-200"
            >
              Limpiar búsqueda
            </button>
          </div>

        ) : filtered.length === 0 ? (
          /* Estado: catálogo vacío (sin productos en la API) */
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-24 h-24 bg-brand-navy/5 border-2 border-dashed border-brand-navy/20 rounded-full flex items-center justify-center">
              <PackageSearch size={40} strokeWidth={1} className="text-brand-navy/30" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-700 mb-2">
                Catálogo en construcción
              </p>
              <p className="text-sm text-gray-400 max-w-sm">
                Estamos preparando nuestros productos. Mientras tanto, puedes cotizar directamente por WhatsApp.
              </p>
            </div>
            <a
              href="https://wa.me/51959388698?text=Hola%2C%20quiero%20cotizar%20productos%20Plastitex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cotizar por WhatsApp
              <ArrowRight size={14} />
            </a>
          </div>

        ) : (
          /* Estado: productos cargados */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}