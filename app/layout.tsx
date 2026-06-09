import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/ui/WhatsAppButton';


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
    icons: {
    icon: '/isotipo-plastitex.png',
    shortcut: '/isotipo-plastitex.png',
    apple: '/isotipo-plastitex.png',
  },

};

// Viewport separado de metadata (Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B2B5E', // brand-navy → color de la barra del navegador en móvil
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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold">
          Saltar al contenido
        </a>
        <Navbar />
        <CartSidebar />
        <WhatsAppButton />
        <main id="main-content" className="pt-[132px] md:pt-20 lg:pt-[112px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}