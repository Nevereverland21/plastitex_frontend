// app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orden de secciones del home:
//   1. HeroCarousel        — banner principal
//   2. FeaturedProducts    — productos destacados (desde el backend)
//   3. ClientLogos         — marcas que confían (reemplaza la franja azul fea)
//   4. WhyUs               — diferenciales / nuestra promesa
//
// Si el cliente decide después mover la sección de empresas a la página
// corporativa/mayorista, solo es quitar <ClientLogos /> de aquí.
// ─────────────────────────────────────────────────────────────────────────────

import { getProductsServer } from '@/lib/api';
import HeroCarousel from '@/components/ui/HeroCarousel';
import FeaturedProducts from '@/components/ui/FeaturedProducts';
import ClientLogos from '@/components/ui/ClientLogos';
import WhyUs from '@/components/ui/WhyUs';

export const revalidate = 60;

export default async function Home() {
  // Productos destacados — pedimos hasta 8 (el componente recorta a MAX_VISIBLE)
  const featured = await getProductsServer({
    featured: true,
    limit: 8,
  }).catch(() => []);

  return (
    <>
      <HeroCarousel />
      <FeaturedProducts products={featured} />
      <ClientLogos />
      <WhyUs />
    </>
  );
}