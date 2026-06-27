'use client';

import Image from 'next/image';

type Client = {
  name: string;
  src: string; 
  width?: number;
};

// ─── EDITAR ESTA LISTA ────────────────────────────────────────────────────
const CLIENTS: Client[] = [
    { name: 'BCP',           src: '/clients/bcp_logo.png',           width: 100 },
    { name: 'InDrive',       src: '/clients/indrive-logo.svg',       width: 130 },
    { name: 'Sublime',         src: '/clients/Sublime-Logo.png',         width: 90  },
    { name: 'Alpaca',           src: '/clients/alpaca-logo.png',           width: 100 },
    { name: 'Caja Huancayo', src: '/clients/caja-huancayo-logo.png', width: 130 },
    { name: 'American Colors', src: '/clients/American-logo.svg', width: 120 },
    { name: 'Entel', src: '/clients/Entel_logo_pe.webp', width: 100 },
    { name: 'Claro', src: '/clients/claro_logo.webp', width: 90 },
    { name: 'Demonio', src: '/clients/demonio2_logo.webp', width: 90 },
    { name: 'Coca Cola', src: '/clients/cocacola_logo.png', width: 120 },
    { name: 'Interseguro', src: '/clients/interseguro_logo.webp', width: 100 },
    { name: 'Samsung', src: '/clients/Samsung_logo2.webp', width: 130 },
    { name: 'SmartFit', src: '/clients/Smart_Fit_logo.webp', width: 100 },
    { name: 'Dominos Pizza', src: '/clients/Dominos_pizza_logo.webp', width: 100 },
    { name: 'PetroPeru', src: '/clients/Petroperu_logo.webp', width: 100 },
    { name: 'Movistar', src: '/clients/movistar_logo.webp', width: 100 },
    { name: 'Rimac', src: '/clients/rimac_logo.webp', width: 100 },
];


const TRACK_CLASSES = 'gap-10 pr-10'; // 10 * 4 = 40px

export default function ClientLogos() {
  if (CLIENTS.length === 0) return null;

  return (
    <section
      className="bg-white py-8 md:py-10 border-t border-gray-100"
      aria-labelledby="clients-heading"
    >
      <div className="container-wide">
        {/* Header */}
        <header className="text-center mb-6">
          <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
            Confían en nosotros
          </p>
          <h2
            id="clients-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy tracking-tight"
          >
            Marcas que llevan nuestro merchandising
          </h2>
        </header>

        {/* Marquee — contenedor con máscara fade en los extremos */}
        <div
          className="group relative overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          {/* Dos tracks idénticos pegados (sin gap entre tracks) */}
          <div className="flex w-max">
            <MarqueeTrack ariaHidden={false} />
            <MarqueeTrack ariaHidden={true} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
        :global(.marquee-track) {
          animation: marquee 40s linear infinite;
          flex-shrink: 0;
        }
        /* Pausa al hover sobre el contenedor padre */
        :global(.group:hover .marquee-track) {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.marquee-track) {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Un track del marquee ─────────────────────────────────────────────────
// Cada track se anima de translateX(0) a translateX(-100%) de su propio
// ancho. Hay 2 tracks lado a lado: cuando el primero termina su recorrido,
// el segundo está exactamente donde estaba el primero → loop invisible.
function MarqueeTrack({ ariaHidden }: { ariaHidden: boolean }) {
  return (
    <div
      className={`marquee-track flex items-center ${TRACK_CLASSES}`}
      aria-hidden={ariaHidden}
    >
      {CLIENTS.map((client, i) => (
        <div
          key={`${client.name}-${i}`}
          className="flex-shrink-0 flex items-center justify-center
                     h-12 md:h-14
                     grayscale opacity-60 hover:grayscale-0 hover:opacity-100
                     transition-all duration-300"
          style={{ width: client.width ?? 120 }}
        >
          <Image
            src={client.src}
            alt={ariaHidden ? '' : client.name}
            width={client.width ?? 120}
            height={56}
            className="max-h-full w-auto object-contain"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}