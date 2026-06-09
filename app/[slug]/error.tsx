'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-navy">Error al cargar el producto</h2>
          <p className="text-sm text-gray-400 mt-1">
            No pudimos obtener la información de este producto. Intenta de nuevo.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-orange transition-colors"
        >
          <RefreshCw size={15} />
          Reintentar
        </button>
      </div>
    </div>
  );
}
