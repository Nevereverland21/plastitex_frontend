import { notFound } from 'next/navigation';
import { getProductBySlugServer } from '@/lib/api';
import type { LogoSurcharge } from '@/types';
import ProductPageClient from './ProductPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function getLogoSurchargesServer(): Promise<LogoSurcharge[]> {
  const res = await fetch(`${BASE_URL}/api/logo-surcharges/`, {
    next: { tags: ['logo-surcharges'], revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getProductBySlugServer(slug);
  if (!product) notFound();

  const surcharges = await getLogoSurchargesServer().catch((): LogoSurcharge[] => []);

  return <ProductPageClient product={product} surcharges={surcharges} />;
}