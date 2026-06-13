import { Suspense } from 'react';
import { getProductBySlugServer } from '@/lib/api';
import type { CartItem } from '@/types';
import CheckoutClient from './CheckoutClient';

interface PageProps {
  searchParams: Promise<{
    buy_now?: string;
    qty?: string;
    unit_price?: string;
    price?: string;
  }>;
}

async function getCheckoutData(searchParams: Awaited<PageProps['searchParams']>): Promise<CartItem | undefined> {
  const { buy_now, qty, unit_price, price } = searchParams;
  if (!buy_now || !qty) return undefined;

  try {
    const product = await getProductBySlugServer(buy_now);
    if (!product) return undefined;
    const quantity = Math.max(1, parseInt(qty, 10));
    const finalUnitPrice = unit_price ?? price ?? String(product.base_price);

    return {
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        base_price: String(product.base_price),
        starting_price: String(product.starting_price),
        image: product.image,
        stock: product.stock,
        featured: product.featured,
        catalog_type: product.catalog_type,
        min_units: product.min_units,
        quote_threshold: product.quote_threshold,
        wholesale_threshold: product.wholesale_threshold,
        allows_logo: product.allows_logo,
        min_units_for_logo: product.min_units_for_logo,
        category_name: product.category?.name ?? '',
        category_slug: product.category?.slug ?? '',
        pricing_tiers: product.pricing_tiers,
        colors: product.colors,
      },
      quantity,
      unit_price: finalUnitPrice,
      unit_price_override: price ?? undefined,
    } satisfies CartItem;
  } catch {
    return undefined;
  }
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const buyNowItem = await getCheckoutData(params);

  return (
    <Suspense>
      <CheckoutClient buyNowItem={buyNowItem} />
    </Suspense>
  );
}