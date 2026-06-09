'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingBag, Building2 } from 'lucide-react';

export default function CatalogToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentType = searchParams.get('catalog_type') || 'all';

  const handleToggle = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') {
      params.delete('catalog_type');
    } else {
      params.set('catalog_type', type);
    }
    // Reseteamos a la página 1 al cambiar de catálogo
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-center w-full mb-8">
      <div className="inline-flex bg-gray-100/80 p-1.5 rounded-full border border-gray-200 shadow-inner">
        <button
          onClick={() => handleToggle('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            currentType === 'all' 
              ? 'bg-white text-brand-navy shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-brand-navy hover:bg-gray-200/50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => handleToggle('retail')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            currentType === 'retail' 
              ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-emerald-700 hover:bg-gray-200/50'
          }`}
        >
          <ShoppingBag size={16} />
          Minorista
        </button>
        <button
          onClick={() => handleToggle('wholesale')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            currentType === 'wholesale' 
              ? 'bg-white text-sky-700 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-sky-700 hover:bg-gray-200/50'
          }`}
        >
          <Building2 size={16} />
          Mayorista
        </button>
      </div>
    </div>
  );
}