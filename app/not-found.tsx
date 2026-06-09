import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-brand-light border border-gray-200 rounded-2xl flex items-center justify-center mx-auto">
          <Package size={28} className="text-brand-navy" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-navy">Página no encontrada</h2>
          <p className="text-sm text-gray-400 mt-1">
            El producto o página que buscas no existe o fue movido.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-orange transition-colors"
        >
          Ir al catálogo
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
