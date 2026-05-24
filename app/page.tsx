'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import HeroCarousel from '@/components/ui/HeroCarousel';
import WhyUs from '@/components/ui/WhyUs';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: true })
      .then(setFeatured)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-brand-orange rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroCarousel products={featured} />
      <WhyUs />
    </>
  );
}