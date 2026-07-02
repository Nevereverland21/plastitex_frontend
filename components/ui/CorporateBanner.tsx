'use client';

import Link from 'next/link';
import { Building2, ArrowRight, MessageCircle } from 'lucide-react';
import { WHATSAPP } from '@/lib/config';

export default function CorporateBanner() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-navy">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-turquoise/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand-turquoise/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" aria-hidden="true" />

          <div className="relative z-10 px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-14 h-14 rounded-xl bg-brand-turquoise/20 items-center justify-center shrink-0">
                <Building2 size={28} className="text-brand-turquoise" strokeWidth={2} />
              </div>
              <div>
                <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
                  Para empresas y eventos
                </p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2">
                  ¿Necesitas merchandising corporativo?
                </h2>
                <p className="text-sm sm:text-base text-white/70 max-w-xl">
                  Cotiza con nosotros y obtén precios especiales por volumen, personalización con tu logo y asesoría personalizada.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/catalogo?mayorista=1"
                className="inline-flex items-center justify-center gap-2 bg-brand-turquoise hover:bg-brand-teal
                           text-white px-7 py-3 rounded-full text-sm font-semibold transition-all
                           hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-turquoise/20"
              >
                Ver productos por mayor
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>

              <a
                href={WHATSAPP.link('Hola Plastitex, quiero cotizar merchandising corporativo para mi empresa.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20
                           backdrop-blur-sm text-white border border-white/20
                           px-7 py-3 rounded-full text-sm font-semibold transition-all
                           hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle size={18} strokeWidth={2} />
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
