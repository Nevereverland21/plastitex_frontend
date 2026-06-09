'use client';

import { useState } from 'react';
import { FileText, Info, Ruler, ExternalLink } from 'lucide-react';
import type { ProductDetail } from '@/types';

interface ProductTabsProps {
  product: ProductDetail;
}

type Tab = 'descripcion' | 'especificaciones' | 'ficha';

export default function ProductTabs({ product }: ProductTabsProps) {
  const hasSpecs = !!(
    product.material ||
    product.capacity_ml ||
    product.height_cm ||
    product.diameter_cm ||
    product.weight_grams ||
    product.packaging
  );

  const isMinorist = product.catalog_type === 'retail'
  const hasPdf = !!product.technical_sheet?.pdf_file;

  const tabs = [
    { id: 'descripcion' as Tab, label: 'Descripción', icon: <Info size={14} />, show: true },
    { id: 'especificaciones' as Tab, label: 'Especificaciones', icon: <Ruler size={14} />, show: hasSpecs && !isMinorist },
    { id: 'ficha' as Tab, label: 'Ficha técnica', icon: <FileText size={14} />, show: hasPdf },
  ].filter((t) => t.show);

  const [active, setActive] = useState<Tab>('descripcion');

  return (
    <div className="mt-10 lg:mt-14">
      {/* Tab nav */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all duration-150
              ${active === tab.id
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-400 hover:text-brand-navy'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[120px]">

        {/* Descripción */}
        {active === 'descripcion' && (
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="text-gray-400 italic">Sin descripción disponible.</p>
            )}
          </div>
        )}

        {/* Especificaciones */}
        {active === 'especificaciones' && hasSpecs && !isMinorist && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.material && (
              <SpecRow label="Material" value={product.material} />
            )}
            {product.capacity_ml && (
              <SpecRow label="Capacidad" value={`${product.capacity_ml} ml`} />
            )}
            {product.height_cm && (
              <SpecRow label="Alto" value={`${product.height_cm} cm`} />
            )}
            {product.diameter_cm && (
              <SpecRow label="Diámetro" value={`${product.diameter_cm} cm`} />
            )}
            {product.weight_grams && (
              <SpecRow label="Peso" value={`${product.weight_grams} g`} />
            )}
            {product.packaging && (
              <SpecRow label="Empaque" value={product.packaging} />
            )}
          </div>
        )}

        {/* Ficha técnica */}
        {active === 'ficha' && hasPdf && (
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3 p-4 bg-brand-light rounded-2xl border border-gray-100 w-full">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-brand-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand-navy">Ficha técnica del producto</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Subida el {new Date(product.technical_sheet!.uploaded_at).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <a
                href={product.technical_sheet!.pdf_file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl
                           hover:bg-brand-orange transition-colors duration-200 flex-shrink-0"
              >
                <ExternalLink size={13} />
                Abrir PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-brand-light rounded-xl px-4 py-3 border border-gray-100">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-brand-navy">{value}</span>
    </div>
  );
}