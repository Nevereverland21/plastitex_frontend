// components/ui/WhyUs.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CAMBIO: eliminé la ola SVG superior que asumía un fondo navy arriba.
// Ahora el fondo es brand-light (claro) que da contraste suave con las
// secciones blancas de arriba (FeaturedProducts, ClientLogos).
//
// El resto del componente queda igual, solo cambios cosméticos menores:
//   - text-gray-400 → text-gray-600 para mejor legibilidad
//   - Mejor jerarquía visual de cards
// ─────────────────────────────────────────────────────────────────────────────

import { ShieldCheck, Truck, HeadphonesIcon, BadgePercent } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Calidad garantizada',
    description:
      'Todos nuestros productos pasan por un control de calidad estricto antes de llegar a tus manos.',
  },
  {
    icon: Truck,
    title: 'Envío a todo el Perú',
    description:
      'Despachamos a cualquier provincia. Rápido, seguro y con seguimiento de tu pedido.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Soporte directo',
    description:
      'Nuestro equipo está disponible para ayudarte por WhatsApp o correo cuando lo necesites.',
  },
  {
    icon: BadgePercent,
    title: 'Compra desde 1 unidad',
    description:
      'Pedidos pequeños, sin mínimos. Ideal para regalar, llevar o probar antes de comprar más.',
  },
];

export default function WhyUs() {
  return (
    <section
      className="bg-brand-light py-16 md:py-20"
      aria-labelledby="why-us-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12 md:mb-14">
          <p className="text-brand-orange text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Nuestra promesa
          </p>
          <h2
            id="why-us-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy tracking-tight"
          >
            ¿Por qué elegir Plastitex?
          </h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Confianza, calidad y servicio en cada pedido.
          </p>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group bg-white hover:bg-white
                         border border-gray-100 hover:border-brand-orange/40
                         hover:shadow-lg rounded-2xl p-6
                         transition-all duration-300 hover:-translate-y-1"
            >
              {/* Ícono */}
              <div
                className="w-12 h-12 bg-brand-orange/10 group-hover:bg-brand-orange
                              rounded-xl flex items-center justify-center mb-4
                              transition-all duration-300 group-hover:scale-110"
              >
                <feature.icon
                  size={22}
                  strokeWidth={2}
                  className="text-brand-orange group-hover:text-white transition-colors"
                />
              </div>

              <h3 className="text-brand-navy font-bold text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}