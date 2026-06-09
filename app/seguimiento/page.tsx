'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageSearch, ArrowRight, ShieldCheck } from 'lucide-react';
import { COMPANY, WHATSAPP } from '@/lib/config';

export default function SeguimientoPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Ingresa un código de seguimiento.');
      return;
    }
    setError('');
    router.push(`/pedidos/${cleanToken}`);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/10 text-brand-orange mb-5">
            <PackageSearch size={32} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2">
            Seguimiento de pedidos
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Ingresa el código de seguimiento que recibiste por correo o WhatsApp para conocer el estado de tu pedido.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(''); }}
              placeholder="Ej: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
              className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-sm text-gray-800
                shadow-sm outline-none transition-all placeholder:text-gray-400
                focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20
                ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}
              autoFocus
            />
            <PackageSearch
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={!token.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3.5
              text-sm font-semibold text-white shadow-md transition-all
              hover:bg-brand-navy/90 hover:shadow-lg active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            Ver estado del pedido
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck size={14} />
          <span>Información segura y en tiempo real</span>
        </div>

        {/* Help */}
        <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50/60 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            ¿No tienes tu código?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            Revisa tu correo electrónico o los mensajes de WhatsApp de{' '}
            <strong className="text-brand-navy">{COMPANY.name}</strong>. El código se envió automáticamente al confirmar tu compra o cotización.
          </p>
          <a
            href={WHATSAPP.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline"
          >
            Escribenos por WhatsApp
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </main>
  );
}
