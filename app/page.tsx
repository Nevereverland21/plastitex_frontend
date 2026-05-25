'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import HeroCarousel from '@/components/ui/HeroCarousel';
import FeaturedProducts from '@/components/ui/FeaturedProducts';
import WhyUs from '@/components/ui/WhyUs';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // timeout 8s

    getProducts({ featured: true })
      .then((data) => {
        setFeatured(data);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Hero se muestra SIEMPRE de inmediato */}
      <HeroCarousel products={featured} />

      <WhyUs />
    </>
  );
}