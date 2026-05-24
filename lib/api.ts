import axios from 'axios';
import { Category, Product, CreateOrderPayload, Order } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Categorías ───────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/api/categories/');
  return data;
}

// ─── Productos ────────────────────────────────────────────
export async function getProducts(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const { data } = await api.get('/api/products/', { params });
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get(`/api/products/${slug}/`);
  return data;
}

// ─── Órdenes ──────────────────────────────────────────────
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/api/orders/', payload);
  return data;
}