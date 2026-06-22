/**
 * Envuelve el contenido principal y aplica el offset del header fijo.
 * El header es sólido en todas las páginas e incluye:
 *   - Mobile: navbar (80px) + buscador mobile (~40px)  → ~120px
 *   - Tablet: navbar (80px)                            → 80px
 *   - Desktop: top bar (32px) + navbar (80px) + sub-nav (44px) → 156px
 */
export default function SiteMain({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="pt-[132px] md:pt-20 lg:pt-[156px]"
    >
      {children}
    </main>
  );
}
