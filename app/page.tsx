import { getProductsServer, getCategoriesServer } from '@/lib/api';
import HeroCarousel from '@/components/ui/HeroCarousel';
import CategoriesStrip from '@/components/ui/CategoriesStrip';
import FeaturedProducts from '@/components/ui/FeaturedProducts';
import ClientLogos from '@/components/ui/ClientLogos';
import WhyUs from '@/components/ui/WhyUs';

export default async function Home() {
  // Cargar categorías y productos en paralelo (no en cascada)
  const [categories, featured] = await Promise.all([
    getCategoriesServer().catch(() => []),
    getProductsServer({ featured: true, limit: 8 }).catch(() => []),
  ]);

  return (
    <>
      <HeroCarousel />
      <CategoriesStrip categories={categories} />
      <FeaturedProducts products={featured} />
      <ClientLogos />
      <WhyUs />
    </>
  );
}