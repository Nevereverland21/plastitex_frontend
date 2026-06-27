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
      className="bg-brand-light py-10 md:py-12"
      aria-labelledby="why-us-heading"
    >
      <div className="container-wide">
        {/* Header */}
        <header className="text-center mb-8 md:mb-10">
          <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
            Nuestra promesa
          </p>
          <h2
            id="why-us-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy tracking-tight"
          >
            ¿Por qué elegir Plastitex?
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Confianza, calidad y servicio en cada pedido.
          </p>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group bg-white
                         border border-gray-100 hover:border-brand-turquoise/40
                         hover:shadow-lg rounded-xl p-5 sm:p-6
                         transition-all duration-300 hover:-translate-y-1"
            >
              {/* Ícono */}
              <div
                className="w-12 h-12 bg-brand-turquoise/10 group-hover:bg-brand-turquoise
                              rounded-xl flex items-center justify-center mb-4
                              transition-all duration-300 group-hover:scale-110"
              >
                <feature.icon
                  size={22}
                  strokeWidth={2}
                  className="text-brand-turquoise group-hover:text-white transition-colors"
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