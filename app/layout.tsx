// app/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CAMBIOS vs versión anterior:
//
// 1. suppressHydrationWarning en <html> → elimina warnings de hidratación que
//    generan renders extra y contribuyen al flash visual.
//
// 2. Inter con display: 'swap' → la fuente no bloquea el render. El texto
//    aparece de inmediato con fuente del sistema y swapea sin reflow visible.
//
// 3. viewport meta explícito → controla el comportamiento inicial del viewport
//    en móvil para evitar zooms/reflows al cargar.
//
// 4. Metadata mejorada con Open Graph → mejor SEO y preview en redes sociales.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import CartProvider from '@/components/cart/CartProvider';

// display: 'swap' → no bloquea render mientras carga la fuente
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Plastitex — Artículos Publicitarios y Merchandising',
    template: '%s | Plastitex',
  },
  description:
    'Fabricantes de artículos publicitarios y merchandising. Calidad garantizada, envío a todo el Perú.',
  openGraph: {
    title: 'Plastitex — Transformamos ideas en Merchandising',
    description: 'Fabricantes de artículos publicitarios. Envío a todo el Perú.',
    locale: 'es_PE',
    type: 'website',
  },
};

// Viewport separado de metadata (Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a2540', // brand-navy → color de la barra del navegador en móvil
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning → evita mismatch de hidratación por extensiones del browser
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <WhatsAppButton />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}