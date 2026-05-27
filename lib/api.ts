import axios from 'axios';
import { Category, Product, CreateOrderPayload, Order } from '@/types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;       // total de items en la DB
  next: string | null; // URL de la siguiente página (null si es la última)
  previous: string | null;
  results: T[];        // items de esta página
}

export interface ProductFilters {
  category?: string;   // slug de categoría (o varios separados por coma)
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  search?: string;
  ordering?: 'price' | '-price' | 'name' | '-name' | 'created_at' | '-created_at';
  page?: number;
  page_size?: number;
  limit?: number;      // solo para modo hero (sin paginación)
}

// ─── Helper: normalizar respuestas que pueden venir paginadas o planas ───────
function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

const isDev = process.env.NODE_ENV === 'development';

function cacheOptions(tags: string[]): RequestInit {
  if (isDev) {
    return { cache: 'no-store' };
  }
  return {
    next: {
      tags,
      // Fallback: aunque no llegue la señal de revalidación, refresca cada hora
      revalidate: 3600,
    },
  };
}

// ─── Instancia axios (Client Components) ─────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── CLIENT SIDE (axios) — para catálogo con filtros dinámicos ───────────────
// El cliente no necesita tags porque hace fetch en cada interacción del usuario.

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/api/categories/');
  return unwrapList<Category>(data);
}

export async function getProducts(
  filters?: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get('/api/products/', { params: filters });
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get(`/api/products/${slug}/`);
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/api/orders/', payload);
  return data;
}

// ─── SERVER SIDE (fetch nativo con caché + tags revalidables) ────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Para el HERO: pide ?featured=true&limit=5
 * Tags: 'products-featured', 'products'
 *
 * Cuando Django avisa que cambió un producto destacado, este fetch se invalida
 * y el próximo render muestra los datos nuevos.
 */
export async function getProductsServer(params?: {
  featured?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const url = new URL(`${BASE_URL}/api/products/`);
  if (params?.featured !== undefined) {
    url.searchParams.set('featured', String(params.featured));
  }
  if (params?.limit) {
    url.searchParams.set('limit', String(params.limit));
  }

  // Tags: si es featured, incluye el tag específico
  const tags = params?.featured
    ? ['products', 'products-featured']
    : ['products'];

  const res = await fetch(url.toString(), cacheOptions(tags));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return unwrapList<Product>(data);
}

/**
 * Para el CATÁLOGO server-side: devuelve respuesta paginada.
 * Tags: 'products'
 */
export async function getProductsPaginated(
  filters?: ProductFilters,
): Promise<PaginatedResponse<Product>> {
  const url = new URL(`${BASE_URL}/api/products/`);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), cacheOptions(['products']));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/**
 * Categorías server-side.
 * Tags: 'categories'
 *
 * Cuando Django avisa que cambió una categoría, este fetch se invalida.
 */
export async function getCategoriesServer(): Promise<Category[]> {
  const res = await fetch(
    `${BASE_URL}/api/categories/`,
    cacheOptions(['categories']),
  );
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return unwrapList<Category>(data);
}

/**
 * Detalle de producto server-side.
 * Tags: 'product:{slug}'
 */
export async function getProductBySlugServer(slug: string): Promise<Product> {
  const res = await fetch(
    `${BASE_URL}/api/products/${slug}/`,
    cacheOptions(['products', `product:${slug}`]),
  );
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}