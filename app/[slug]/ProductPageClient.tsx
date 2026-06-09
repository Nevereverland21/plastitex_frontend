'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, PenLine, Trash2, X } from 'lucide-react';
import type { ProductDetail, LogoSurcharge } from '@/types';
import type { CustomizationData } from '@/types/customizer';
import PurchasePanel from '@/components/product/PurchasePanel';
import ProductTabs from '@/components/product/ProductTabs';
import dynamic from 'next/dynamic';

const CustomizerModal = dynamic(
  () => import('@/components/customizer/CustomizerModal'),
  { ssr: false }
);

interface ProductPageClientProps {
  product: ProductDetail;
  surcharges: LogoSurcharge[];
}

export default function ProductPageClient({ product, surcharges }: ProductPageClientProps) {
  const [activeSurcharge, setActiveSurcharge] = useState<LogoSurcharge | null>(null);
  const [customization, setCustomization]     = useState<CustomizationData | null>(null);
  const [customizerOpen, setCustomizerOpen]   = useState(false);
  const [previewOpen, setPreviewOpen]         = useState(false);

  const handleSaveCustomization = useCallback((data: CustomizationData) => {
    setCustomization(data);
  }, []);

  const handleDeleteCustomization = useCallback(() => {
    setCustomization(null);
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand-navy transition-colors">Inicio</Link>
          <ChevronRight size={11} />
          <Link href="/catalogo" className="hover:text-brand-navy transition-colors">Catálogo</Link>
          {product.category && (
            <>
              <ChevronRight size={11} />
              <Link
                href={`/catalogo?category=${product.category.slug}`}
                className="hover:text-brand-navy transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={11} />
          <span className="text-brand-navy font-semibold truncate max-w-[180px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Layout principal: imagen + panel ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 lg:gap-10">

          {/* ════ COLUMNA IZQUIERDA — Imagen grande sticky ════ */}
          <div className="lg:sticky lg:top-24 lg:self-start">

            {/* Imagen principal */}
            <div className="relative bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100
                            rounded-3xl overflow-hidden border border-gray-100 shadow-sm
                            aspect-square lg:aspect-[4/5]">

              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-contain p-8 lg:p-12 transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Package size={96} strokeWidth={0.6} />
                </div>
              )}

              {/* Watermark sutil de categoría */}
              {product.category?.name && (
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {product.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Preview logo si hay personalización */}
            {customization?.logoPreviewUrl && (
              <div className="mt-3 rounded-2xl border border-brand-orange/20 bg-brand-orange/3
                              p-3 flex items-center gap-3">
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="relative flex-shrink-0 group"
                  title="Ver personalización en grande"
                >
                  <Image
                    src={customization.logoPreviewUrl}
                    alt="Vista previa logo"
                    width={48}
                    height={48}
                    className="rounded-xl object-contain border border-brand-orange/20 bg-white transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/10 rounded-xl transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-navy">Vista previa con tu logo</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {customization.customizationNotes || 'Sin notas adicionales'}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setCustomizerOpen(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-orange hover:bg-brand-orange/10 transition-colors"
                    title="Editar personalización"
                  >
                    <PenLine size={16} />
                  </button>
                  <button
                    onClick={handleDeleteCustomization}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Borrar personalización"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ════ COLUMNA DERECHA — Panel de compra sin scroll ════ */}
          {/* h fija en desktop para que el panel no haga scroll de página */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:h-[calc(100vh-7rem)] lg:max-h-[780px]">
            <div className="h-full bg-white border border-gray-100 rounded-3xl shadow-sm p-5 lg:p-6 flex flex-col">
              <PurchasePanel
                product={product}
                surcharges={surcharges}
                customization={customization}
                activeSurcharge={activeSurcharge}
                onActiveSurchargeChange={setActiveSurcharge}
                onCustomizationSave={handleSaveCustomization}
                onOpenCustomizer={() => setCustomizerOpen(true)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Tabs de info: descripción / specs / ficha ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductTabs product={product} />
      </div>

      {/* ── Lightbox de preview de personalización ── */}
      {previewOpen && customization?.logoPreviewUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="aspect-square relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customization.logoPreviewUrl}
                alt="Vista previa de personalización"
                className="w-full h-full object-contain p-6 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100"
              />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-navy">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {customization.customizationNotes || 'Sin notas adicionales'}
                </p>
              </div>
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  setCustomizerOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orange/90 transition-colors"
              >
                <PenLine size={13} />
                Editar diseño
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de personalización ── */}
      {customizerOpen && (
        <CustomizerModal
          isOpen={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          onSave={handleSaveCustomization}
          productName={product.name}
          productImageUrl={product.image ?? null}
          initialData={customization ?? undefined}
        />
      )}
    </div>
  );
}