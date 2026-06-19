/**
 * Envuelve el contenido principal y aplica el offset del header fijo.
 * El header es sólido en todas las páginas (incluida la home, cuyo hero es
 * claro y va debajo del navbar), por lo que el offset superior es uniforme.
 */
export default function SiteMain({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="pt-[132px] md:pt-20 lg:pt-[112px]"
    >
      {children}
    </main>
  );
}
