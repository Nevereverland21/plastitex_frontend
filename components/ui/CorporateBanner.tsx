'use client';

import Link from 'next/link';
import { Building2, ArrowRight, MessageCircle } from 'lucide-react';
import { WHATSAPP } from '@/lib/config';

export default function CorporateBanner() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-navy">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-turquoise/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-turquoise/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" aria-hidden="true" />

          <div className="relative z-10 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-brand-turquoise/20 items-center justify-center shrink-0">
                <Building2 size={24} className="text-brand-turquoise" strokeWidth={2} />
              </div>
              <div>
                <p className="text-brand-turquoise text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
                  Para empresas y eventos
                </p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-1">
                  ¿Necesitas merchandising corporativo?
                </h2>
                <p className="text-sm text-white/70 max-w-lg">
                  Cotiza con nosotros y obtén precios especiales por volumen, personalización con tu logo y asesoría personalizada.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <Link
                href="/catalogo?catalog_type=wholesale"
                className="inline-flex items-center justify-center gap-2 bg-brand-turquoise hover:bg-brand-teal
                           text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all
                           hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-turquoise/20"
              >
                Ver productos por mayor
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>

              <a
                href={WHATSAPP.link('Hola Plastitex, quiero cotizar merchandising corporativo para mi empresa.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20
                           backdrop-blur-sm text-white border border-white/20
                           px-6 py-2.5 rounded-full text-sm font-semibold transition-all
                           hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle size={16} strokeWidth={2} />
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
