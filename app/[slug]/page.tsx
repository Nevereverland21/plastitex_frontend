import { notFound } from 'next/navigation';
import { getProductBySlugServer, cacheOptions } from '@/lib/api';
import type { LogoSurcharge } from '@/types';
import ProductPageClient from './ProductPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function getLogoSurchargesServer(): Promise<LogoSurcharge[]> {
  // Tag 'logo-surcharges' → lo invalida la signal de Django al guardar una
  // técnica. El revalidate corto es solo respaldo de auto-sanado.
  const res = await fetch(`${BASE_URL}/api/logo-surcharges/`, cacheOptions(['logo-surcharges'], 60));
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