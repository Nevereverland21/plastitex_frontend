'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { getPaymentLinkByToken } from '@/lib/api';
import type { PaymentLink } from '@/types';
import LinkStatusBanner from './components/LinkStatusBanner';
import PaymentSummary from './components/PaymentSummary';
import PaymentMethods from './components/PaymentMethods';

interface PaymentLinkClientProps {
  initialLink: PaymentLink;
  token: string;
}

export default function PaymentLinkClient({ initialLink, token }: PaymentLinkClientProps) {
  const [link, setLink] = useState<PaymentLink>(initialLink);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await getPaymentLinkByToken(token);
      if (updated) {
        setLink(updated);
        setLastUpdated(new Date());
      }
    } catch {
      // Silencioso
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  // Polling cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Pago seguro</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Plastitex · Link de pago {link.link_type.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Estado del link */}
        <div className="mb-6">
          <LinkStatusBanner
            isActive={link.is_active}
            isUsed={!link.is_active && new Date(link.expires_at) > new Date()}
            expiresAt={link.expires_at}
          />
        </div>

        {/* Dos columnas en desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Columna izquierda: Resumen del pedido */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <PaymentSummary link={link} />
            </div>
          </div>

          {/* Columna derecha: Métodos de pago */}
          <div className="lg:col-span-2">
            {link.is_active && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <PaymentMethods link={link} token={token} onSubmitted={refresh} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
          <span>
            Última actualización: {lastUpdated.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 hover:text-gray-600 disabled:opacity-50 transition-colors"
            aria-label="Actualizar"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>
    </main>
  );
}
