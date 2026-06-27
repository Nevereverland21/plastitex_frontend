/**
 * Envuelve el contenido principal y aplica el offset del header fijo.
 * El header es sólido en todas las páginas e incluye:
 *   - Mobile: navbar (72px) + buscador mobile (~44px)  → ~116px
 *   - Tablet: navbar (72px)                            → 72px
 *   - Desktop: top bar (36px) + navbar (96px) + sub-nav (52px) → 184px
 */
export default function SiteMain({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="pt-[148px] md:pt-[92px] lg:pt-[188px]"
    >
      {children}
    </main>
  );
}
