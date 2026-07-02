import axios from 'axios';
import type {
  Category,
  Product,
  ProductDetail,
  QuoteResponse,
  CreateOrderPayload,
  CreateQuotePayload,
  Order,
  PublicOrder,
  CreateComplaintPayload,
  CreateJobApplicationPayload,
  LogoSurcharge,
  StoreLocation,
  StorePolicy,
  PaymentLink,
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
  allows_logo?: boolean;
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

export function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

const isDev = process.env.NODE_ENV === 'development';

// Caché de fetch en server components. La fuente de verdad de la frescura es la
// invalidación por TAG (las signals de Django llaman a /api/revalidate al
// guardar). El `revalidate` es solo un respaldo de auto-sanado por si el webhook
// falla: lo mantenemos corto (5 min) para que ningún dato (precio/stock/recargo)
// quede viejo mucho tiempo. En dev siempre se pide fresco.
// Timeout de seguridad: si la API no responde (backend caído/colgado), el fetch
// se aborta y el `.catch(() => [])` de quien llama puede renderizar igual en vez
// de dejar la página colgada "cargando" para siempre.
const SERVER_FETCH_TIMEOUT_MS = 8000;

export function cacheOptions(tags: string[], revalidate = 300): RequestInit {
  const signal = AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS);
  if (isDev) return { cache: 'no-store', signal };
  return { next: { tags, revalidate }, signal };
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

export async function getLogoSurcharges(): Promise<LogoSurcharge[]> {
  const { data } = await api.get('/api/logo-surcharges/');
  return unwrapList<LogoSurcharge>(data);
}

export async function getStoreLocations(): Promise<StoreLocation[]> {
  const { data } = await api.get('/api/store-locations/');
  return unwrapList<StoreLocation>(data);
}

export async function getStorePolicy(): Promise<StorePolicy> {
  const { data } = await api.get('/api/store-policy/');
  return data;
}

export async function getPaymentLink(token: string): Promise<PaymentLink> {
  const { data } = await api.get(`/api/payment-links/${token}/`);
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/api/orders/', payload);
  return data;
}

export async function createQuote(
  payload: CreateQuotePayload
): Promise<{ message: string }> {
  const { data } = await api.post('/api/quotes/', payload);
  return data;
}

export async function createComplaint(
  payload: CreateComplaintPayload
): Promise<{ message: string }> {
  const { data } = await api.post('/api/complaints/', payload);
  return data;
}

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

export async function getProductDetailServer(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(
    `${BASE_URL}/api/products/${slug}/`,
    cacheOptions(['products', `product:${slug}`]),
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getProductBySlugServer(slug: string): Promise<ProductDetail | null> {
  return getProductDetailServer(slug);
}

export async function getOrderByToken(token: string): Promise<PublicOrder | null> {
  try {
    // Polling del seguimiento: el parámetro único `_` hace la URL distinta en
    // cada llamada → el navegador nunca la sirve de caché. (No mandamos header
    // Cache-Control: dispara preflight CORS y no es necesario.)
    const { data } = await api.get(`/api/orders/public/${token}/`, {
      params: { _: Date.now() },
    });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function getOrderByTokenServer(token: string): Promise<PublicOrder | null> {
  const res = await fetch(
    `${BASE_URL}/api/orders/public/${token}/`,
    { cache: 'no-store' },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getPaymentLinkByToken(token: string): Promise<PaymentLink | null> {
  try {
    const { data } = await api.get(`/api/payment-links/${token}/`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Sube el comprobante de una transferencia bancaria desde el link de pago.
 * multipart/form-data (archivo + datos). El pago queda 'pendiente' hasta que
 * un encargado lo aprueba en el admin.
 */
export async function submitTransferProof(
  token: string,
  data: { voucher: File; operation_number?: string },
): Promise<{ status: string; message: string }> {
  const fd = new FormData();
  fd.append('voucher', data.voucher);
  if (data.operation_number) fd.append('operation_number', data.operation_number);

  const { data: res } = await api.post(
    `/api/payment-links/${token}/transfer-proof/`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res;
}

export async function getPaymentLinkByTokenServer(token: string): Promise<PaymentLink | null> {
  const res = await fetch(
    `${BASE_URL}/api/payment-links/${token}/`,
    { cache: 'no-store' },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}