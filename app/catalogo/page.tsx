
import {
  getProductsPaginated,
  getCategoriesServer,
  type ProductFilters,
} from '@/lib/api';
import CatalogoContent from './CatalogoContent';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    categoria?: string;     // alias legacy de la tira
    search?: string;
    q?: string;             // alias del navbar
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    ordering?: string;
    page?: string;
  }>;
}

// Cache corto porque los filtros varían
export const revalidate = 30;

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // ─── Normalizar searchParams ─────────────────────────────────────────────
  // Convertir los aliases (categoria → category, q → search) a los nombres
  // que espera el backend
  const filters: ProductFilters = {
    category: params.category ?? params.categoria,
    search: params.search ?? params.q,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    in_stock: params.in_stock === 'true' || params.in_stock === '1',
    ordering: isValidOrdering(params.ordering)
      ? params.ordering
      : '-created_at',
    page: params.page ? Math.max(1, Number(params.page)) : 1,
    page_size: 24,
  };

  // ─── Fetch en paralelo ───────────────────────────────────────────────────
  const [initialData, categories] = await Promise.all([
    getProductsPaginated(filters).catch(() => null),
    getCategoriesServer().catch(() => []),
  ]);

  // ─── Calcular rango de precios reales del catálogo ───────────────────────
  // Idealmente esto vendría del backend con un endpoint /api/products/price-range
  // pero por ahora usamos un rango fijo razonable para el slider.
  // TODO: agregar endpoint que devuelva min/max real
  const priceRange = { min: 0, max: 200 };

  return (
    <CatalogoContent
      initialData={initialData}
      categories={categories}
      priceRange={priceRange}
    />
  );
}

// ─── Validador del ordering ──────────────────────────────────────────────────
function isValidOrdering(v: unknown): v is ProductFilters['ordering'] {
  return (
    v === 'price' ||
    v === '-price' ||
    v === 'name' ||
    v === '-name' ||
    v === 'created_at' ||
    v === '-created_at'
  );
}