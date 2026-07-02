import {
  getProductsPaginated,
  getCategoriesServer,
  type ProductFilters,
} from '@/lib/api';
import CatalogoContent from './CatalogoContent';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    categoria?: string;
    search?: string;
    q?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    featured?: string;
    allows_logo?: string;
    ordering?: string;
    page?: string;
    mayorista?: string;
  }>;
}

export const revalidate = 30;

function isValidOrdering(v: unknown): v is ProductFilters['ordering'] {
  return (
    v === 'base_price' ||
    v === '-base_price' ||
    v === 'name' ||
    v === '-name' ||
    v === 'created_at' ||
    v === '-created_at'
  );
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: ProductFilters = {
    category: params.category ?? params.categoria,
    search: params.search ?? params.q,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    in_stock: params.in_stock === 'true' || params.in_stock === '1',
    featured: params.featured === 'true' || params.featured === '1',
    allows_logo: params.allows_logo === 'true' || params.allows_logo === '1',
    ordering: isValidOrdering(params.ordering) ? params.ordering : '-created_at',
    page: params.page ? Math.max(1, Number(params.page)) : 1,
    page_size: 24,
  };

  const initialData = await getProductsPaginated(filters);
  const categories = await getCategoriesServer().catch(() => []);

  const priceRange = { min: 0, max: 200 };

  return (
    <CatalogoContent
      initialData={initialData}
      categories={categories}
      priceRange={priceRange}
      wholesale={params.mayorista === '1' || params.mayorista === 'true'}
    />
  );
}