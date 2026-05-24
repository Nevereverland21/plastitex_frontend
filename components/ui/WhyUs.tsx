import { ShieldCheck, Truck, HeadphonesIcon, BadgePercent } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Calidad garantizada',
    description: 'Todos nuestros productos pasan por un control de calidad estricto antes de llegar a tus manos.',
  },
  {
    icon: Truck,
    title: 'Envío a todo el Perú',
    description: 'Despachamos a cualquier provincia. Rápido, seguro y con seguimiento de tu pedido.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Soporte 24/7',
    description: 'Nuestro equipo está siempre disponible para ayudarte por WhatsApp o correo.',
  },
  {
    icon: BadgePercent,
    title: 'Mejores precios',
    description: 'Precios competitivos directamente del fabricante, sin intermediarios.',
  },
];

export default function WhyUs() {
  return (
    <section className="relative bg-white">

      {/* Onda superior — transición desde brand-navy */}
      <div className="w-full overflow-hidden leading-none -mt-1">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 sm:h-20"
        >
          <path
            d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,0 L0,0 Z"
            fill="#1B2B5E"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-brand-orange text-sm font-semibold uppercase tracking-widest mb-2">
            Nuestra promesa
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy">
            ¿Por qué elegir Plastitex?
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Años de experiencia nos respaldan. Confianza, calidad y servicio en cada pedido.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-brand-light hover:bg-white border border-gray-100 hover:border-brand-orange/30 hover:shadow-lg rounded-2xl p-6 transition-all duration-300"
            >
              {/* Ícono */}
              <div className="w-12 h-12 bg-brand-orange/10 group-hover:bg-brand-orange rounded-xl flex items-center justify-center mb-4 transition-all duration-300">
                <feature.icon
                  size={22}
                  className="text-brand-orange group-hover:text-white transition-colors duration-300"
                />
              </div>

              <h3 className="text-brand-navy font-semibold text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}