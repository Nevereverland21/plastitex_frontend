'use client';

// components/ui/QuickFilters.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Accesos rápidos tipo chips justo debajo del banner. Cada chip filtra el
// catálogo según los query params que soporta el backend:
//   catalog_type, in_stock, allows_logo, ordering
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import {
  LayoutGrid,
  Star,
  Boxes,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

type Chip = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

const CHIPS: Chip[] = [
  { label: 'Todos', href: '/catalogo', icon: LayoutGrid, description: 'Ver todo el catálogo' },
  { label: 'Nuevos', href: '/catalogo?ordering=-created_at', icon: Star, description: 'Lo último en llegar' },
  { label: 'Venta por Mayor', href: '/catalogo?catalog_type=wholesale', icon: Boxes, description: 'Precios por volumen' },
  { label: 'Venta por Menor', href: '/catalogo?catalog_type=retail', icon: ShoppingBag, description: 'Desde 1 unidad' },
  { label: 'En Stock', href: '/catalogo?in_stock=true', icon: CheckCircle2, description: 'Entrega inmediata' },
  { label: 'Personalizados', href: '/catalogo?allows_logo=true', icon: Sparkles, description: 'Con tu logo' },
];

export default function QuickFilters() {
  return (
    <section aria-label="Accesos rápidos" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {CHIPS.map(({ label, href, icon: Icon, description }) => (
              <Link
                key={label}
                href={href}
                title={description}
                className="group shrink-0 inline-flex items-center gap-2 rounded-full
                           border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-navy
                           hover:border-brand-turquoise hover:bg-brand-turquoise hover:text-white
                           transition-all active:scale-95"
              >
                <Icon
                  size={15}
                  strokeWidth={2.4}
                  className="text-brand-turquoise group-hover:text-white transition-colors"
                />
                {label}
              </Link>
            ))}
          </div>

          {/* Link catálogo */}
          <Link
            href="/catalogo"
            className="hidden lg:inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold
                       text-brand-turquoise hover:text-brand-teal transition-all group"
          >
            Ver catálogo completo
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
