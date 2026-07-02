'use client';


import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type UrlUpdates = Partial<Record<string, string | number | boolean | undefined>>;

export type OrderingValue =
  | '-created_at'
  | 'created_at'
  | 'price'
  | '-price'
  | 'name'
  | '-name';

export interface CatalogFilters {
  category?: string;      // 'mugs' o 'mugs,tomatodos'
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  featured: boolean;
  allowsLogo: boolean;
  ordering: OrderingValue;
  page: number;
}

const DEFAULTS = {
  ordering: '-created_at' as OrderingValue,
  page: 1,
  inStock: false,
};

export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ─── Leer filtros desde la URL ────────────────────────────────────────────
  const filters: CatalogFilters = useMemo(() => {
    // Soporta tanto `category` como `categoria` (legacy del link de la tira)
    const category =
      searchParams.get('category') ?? searchParams.get('categoria') ?? undefined;

    // Soporta tanto `search` como `q` (el navbar usa `q`)
    const search =
      searchParams.get('search') ?? searchParams.get('q') ?? undefined;

    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const inStockParam = searchParams.get('in_stock');
    const featuredParam = searchParams.get('featured');
    const allowsLogoParam = searchParams.get('allows_logo');
    const orderingParam = searchParams.get('ordering') as OrderingValue | null;
    const pageParam = searchParams.get('page');

    return {
      category: category || undefined,
      search: search || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStockParam === 'true' || inStockParam === '1',
      featured: featuredParam === 'true' || featuredParam === '1',
      allowsLogo: allowsLogoParam === 'true' || allowsLogoParam === '1',
      ordering: isValidOrdering(orderingParam) ? orderingParam : DEFAULTS.ordering,
      page: pageParam ? Math.max(1, Number(pageParam)) : DEFAULTS.page,
    };
  }, [searchParams]);

  // ─── Helper para construir nueva URL ──────────────────────────────────────
  const buildUrl = useCallback(
    (updates: Partial<Record<string, string | number | boolean | undefined>>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Normalizar: si viene `categoria` lo convertimos a `category`
      if (params.has('categoria') && !updates.category) {
        const value = params.get('categoria');
        params.delete('categoria');
        if (value) params.set('category', value);
      }
      // Normalizar: si viene `q` lo convertimos a `search`
      if (params.has('q') && !updates.search) {
        const value = params.get('q');
        params.delete('q');
        if (value) params.set('search', value);
      }

      // Aplicar updates
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          value === false ||
          (key === 'page' && value === 1) // page=1 es default, no ensucia URL
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [pathname, searchParams],
  );

  // ─── Setter de un solo filtro ─────────────────────────────────────────────
  const setFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
      // Mapeo de keys camelCase → snake_case para la URL
      const urlKey = mapKeyToUrl(key);
      const updates: UrlUpdates = { [urlKey]: value };

      // Si cambia cualquier filtro que no sea `page`, resetear a página 1
      if (key !== 'page') {
        updates.page = 1;
      }

      router.push(buildUrl(updates), { scroll: false });
    },
    [router, buildUrl],
  );

  // ─── Setter múltiple ──────────────────────────────────────────────────────
  const setFilters = useCallback(
    (updates: Partial<CatalogFilters>) => {
        
      const urlUpdates: UrlUpdates = {};
      let touchedNonPage = false;

      (Object.keys(updates) as (keyof CatalogFilters)[]).forEach((key) => {
        urlUpdates[mapKeyToUrl(key)] = updates[key];
        if (key !== 'page') touchedNonPage = true;
      });

      if (touchedNonPage && updates.page === undefined) {
        urlUpdates.page = 1;
      }

      router.push(buildUrl(urlUpdates), { scroll: false });
    },
    [router, buildUrl],
  );

  // ─── Limpiar todos los filtros ────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // ─── Toggle helper para categorías (multi-select) ─────────────────────────
  const toggleCategory = useCallback(
    (slug: string) => {
      const current = filters.category?.split(',').filter(Boolean) ?? [];
      const exists = current.includes(slug);
      const next = exists ? current.filter((s) => s !== slug) : [...current, slug];
      setFilter('category', next.length > 0 ? next.join(',') : undefined);
    },
    [filters.category, setFilter],
  );

  // ─── Helpers derivados ────────────────────────────────────────────────────
  const selectedCategories = useMemo(
    () => filters.category?.split(',').filter(Boolean) ?? [],
    [filters.category],
  );

  const hasActiveFilters = useMemo(
    () =>
      !!filters.category ||
      !!filters.search ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.inStock ||
      filters.featured ||
      filters.allowsLogo,
    [filters],
  );

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    toggleCategory,
    selectedCategories,
    hasActiveFilters,
  };
}

// ─── Helpers privados ────────────────────────────────────────────────────────

function isValidOrdering(v: string | null): v is OrderingValue {
  return (
    v === '-created_at' ||
    v === 'created_at' ||
    v === 'price' ||
    v === '-price' ||
    v === 'name' ||
    v === '-name'
  );
}

// Mapea las keys del estado (camelCase) a los nombres de URL (snake_case)
function mapKeyToUrl(key: keyof CatalogFilters): string {
  switch (key) {
    case 'minPrice':
      return 'min_price';
    case 'maxPrice':
      return 'max_price';
    case 'inStock':
      return 'in_stock';
    case 'allowsLogo':
      return 'allows_logo';
    default:
      return key;
  }
}