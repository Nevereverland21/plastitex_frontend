'use client';

import { usePathname } from 'next/navigation';

/**
 * Envuelve el contenido principal y aplica el offset del header fijo.
 * En la home el hero ocupa toda la altura bajo un header transparente,
 * por lo que NO lleva padding superior; el resto de páginas sí.
 */
export default function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main
      id="main-content"
      className={isHome ? '' : 'pt-[132px] md:pt-20 lg:pt-[112px]'}
    >
      {children}
    </main>
  );
}
