import axios from 'axios';
import type {
  Category,
  Product,
  ProductDetail,
  QuoteResponse,
  CreateOrderPayload,
  Order,
  CreateComplaintPayload,
  CreateJobApplicationPayload,
} from '@/types';

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  search?: string;
  ordering?: 'base_price' | '-base_price' | 'name' | '-name' | 'created_at' | '-created_at';
  page?: number;
  page_size?: number;
  limit?: number;
}

export interface QuoteParams {
  quantity: number;
  extra_ids?: number[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

const isDev = process.env.NODE_ENV === 'development';

function cacheOptions(tags: string[]): RequestInit {
  if (isDev) return { cache: 'no-store' };
  return { next: { tags, revalidate: 3600 } };
}

// ─── Instancia axios (Client Components) ──────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── CLIENT SIDE (axios) ──────────────────────────────────────────────────────

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

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const { data } = await api.get(`/api/products/${slug}/`);
  return data;
}

/**
 * Cotizador en tiempo real.
 * Llama a GET /api/products/{slug}/quote/?quantity=500&extra_ids=1,2
 */
export async function getProductQuote(
  slug: string,
  params: QuoteParams
): Promise<QuoteResponse> {
  const queryParams: Record<string, string> = {
    quantity: String(params.quantity),
  };
  if (params.extra_ids && params.extra_ids.length > 0) {
    queryParams.extra_ids = params.extra_ids.join(',');
  }
  const { data } = await api.get(`/api/products/${slug}/quote/`, {
    params: queryParams,
  });
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/api/orders/', payload);
  return data;
}

/**
 * Estado del pedido (semáforo).
 * Llama a GET /api/orders/{id}/
 */
export async function getOrderStatus(orderId: number): Promise<Order> {
  const { data } = await api.get(`/api/orders/${orderId}/`);
  return data;
}

/**
 * Enviar reclamo desde el footer.
 */
export async function createComplaint(
  payload: CreateComplaintPayload
): Promise<{ message: string }> {
  const { data } = await api.post('/api/complaints/', payload);
  return data;
}

/**
 * Enviar postulación desde "Trabaja con nosotros".
 * Usa FormData para soportar subida de CV en PDF.
 */
export async function createJobApplication(
  payload: CreateJobApplicationPayload,
  cvFile?: File
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('full_name', payload.full_name);
  formData.append('email', payload.email);
  formData.append('phone', payload.phone);
  if (payload.position) formData.append('position', payload.position);
  if (payload.message) formData.append('message', payload.message);
  if (cvFile) formData.append('cv_file', cvFile);

  const { data } = await api.post('/api/job-applications/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ─── SERVER SIDE (fetch nativo con caché + tags revalidables) ─────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

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
  const tags = params?.featured
    ? ['products', 'products-featured']
    : ['products'];
  const res = await fetch(url.toString(), cacheOptions(tags));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return unwrapList<Product>(data);
}

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
 * Usado en /productos/[slug] para SSR + ISR.
 */
export async function getProductDetailServer(slug: string): Promise<ProductDetail> {
  const res = await fetch(
    `${BASE_URL}/api/products/${slug}/`,
    cacheOptions(['products', `product:${slug}`]),
  );
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Alias para compatibilidad con código existente
export async function getProductBySlugServer(slug: string): Promise<ProductDetail> {
  return getProductDetailServer(slug);
}