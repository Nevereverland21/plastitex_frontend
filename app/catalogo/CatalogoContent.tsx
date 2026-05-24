'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { Search, PackageSearch, SlidersHorizontal } from 'lucide-react';

export default function CatalogoContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(categoryParam);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(selected ? { category: selected } : undefined)
      .then((data) => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [selected]);

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
              <span>{filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}</span>
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
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="w-full h-56 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-8 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <PackageSearch size={56} strokeWidth={1} />
            <p className="text-lg font-medium text-gray-500">No se encontraron productos</p>
            <p className="text-sm">Intenta con otro término o categoría</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}