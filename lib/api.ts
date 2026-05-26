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
  category?: string;   // slug de categoría
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

// ─── Instancia axios (Client Components) ─────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── CLIENT SIDE (axios) — para catálogo con filtros dinámicos ───────────────

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/api/categories/');
  return data;
}

/**
 * Productos paginados para el catálogo client-side.
 * Devuelve PaginatedResponse con count, next, previous, results.
 */
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

// ─── SERVER SIDE (fetch nativo con caché de Next.js) ─────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Para el HERO: pide ?featured=true&limit=5
 * El backend devuelve array plano (sin paginar).
 * Caché de 60s — los destacados cambian poco.
 */
export async function getProductsServer(params?: {
  featured?: boolean;
  limit?: number;
  revalidate?: number;
}): Promise<Product[]> {
  const { revalidate = 60, ...filters } = params ?? {};

  const url = new URL(`${BASE_URL}/api/products/`);
  if (filters.featured !== undefined) {
    url.searchParams.set('featured', String(filters.featured));
  }
  if (filters.limit) {
    url.searchParams.set('limit', String(filters.limit));
  }

  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/**
 * Para el CATÁLOGO server-side: devuelve respuesta paginada.
 * Caché corto (30s) porque los filtros varían por URL.
 */
export async function getProductsPaginated(
  filters?: ProductFilters,
  revalidate = 30
): Promise<PaginatedResponse<Product>> {
  const url = new URL(`${BASE_URL}/api/products/`);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/**
 * Categorías server-side.
 * Caché largo (5 min) — las categorías cambian muy poco.
 */
export async function getCategoriesServer(revalidate = 300): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories/`, {
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}