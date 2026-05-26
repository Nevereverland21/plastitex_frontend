// app/page.tsx
// CAMBIO: el hero ahora pide exactamente 5 productos destacados.
// El backend devuelve array plano (sin paginar) gracias a ?featured=true&limit=5.

import { getProductsServer } from '@/lib/api';
import HeroCarousel from '@/components/ui/HeroCarousel';
import WhyUs from '@/components/ui/WhyUs';

export const revalidate = 60;

export default async function Home() {
  // Pide solo 5 destacados → el backend limita en DB, no viajan datos extra
  const featured = await getProductsServer({ featured: true, limit: 5 }).catch(() => []);

  return (
    <>
      <HeroCarousel products={featured} />
      <WhyUs />
    </>
  );
}