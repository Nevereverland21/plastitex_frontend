'use client';

import { AlertTriangle } from 'lucide-react';
import { WHATSAPP } from '@/lib/config';

interface CancelledBannerProps {
  updatedAt: string;
}

export default function CancelledBanner({ updatedAt }: CancelledBannerProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-red-800">Pedido cancelado</h3>
          <p className="mt-1 text-sm text-red-700">
            Este pedido fue cancelado el{' '}
            {new Date(updatedAt).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
            .
          </p>
          <p className="mt-2 text-sm text-red-600">
            Si tienes dudas o crees que esto fue un error, contáctanos.
          </p>
          <a
            href={WHATSAPP.link('Hola, tengo una duda sobre mi pedido cancelado.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
