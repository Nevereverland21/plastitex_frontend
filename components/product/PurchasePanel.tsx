'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, Building2, Sparkles, Share2 } from 'lucide-react';
import type { ProductDetail, LogoSurcharge, QuoteResponse } from '@/types';
import type { CustomizationData } from '@/types/customizer';
import { getProductQuote } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import PricingTab from './PricingTab';
import CustomizerTab from './CustomizerTab';
import StickyTotal from './StickyTotal';
import QuoteRequestModal from './QuoteRequestModal';

type PanelTab = 'comprar' | 'personalizar';

interface PurchasePanelProps {
  product: ProductDetail;
  surcharges: LogoSurcharge[];
  customization: CustomizationData | null;
  activeSurcharge: LogoSurcharge | null;
  onActiveSurchargeChange: (s: LogoSurcharge | null) => void;
  onCustomizationSave: (data: CustomizationData) => void;
  onOpenCustomizer: () => void;
}

export default function PurchasePanel({
  product,
  surcharges,
  customization,
  activeSurcharge,
  onActiveSurchargeChange,
  onOpenCustomizer,
}: PurchasePanelProps) {
  const addItem = useCartStore((s) => s.addItem);

  const minUnits  = product.min_units ?? 1;
  const threshold = product.quote_threshold ?? 1000;
  const isRetail    = product.catalog_type === 'retail' || product.catalog_type === 'both';
  const isWholesale = product.catalog_type === 'wholesale' || product.catalog_type === 'both';

  // Solo mostrar personalización si el producto lo permite Y existen
  // recargos de logo configurados en el admin.
  const canCustomize = product.allows_logo && surcharges.length > 0;

  const [activeTab, setActiveTab]     = useState<PanelTab>('comprar');
  // Si el producto permite logo, inicializamos con la cantidad mínima para
  // desbloquear la personalización, evitando que el tab aparezca bloqueado.
  const initialQuantity = canCustomize
    ? Math.max(minUnits, product.min_units_for_logo ?? minUnits)
    : minUnits;
  const [quantity, setQuantity]       = useState(initialQuantity);
  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // ── Canal efectivo y modo mayorista ──────────────────────────────────────
  const wholesaleThreshold = product.wholesale_threshold ?? 100;
  // Mayorista si el producto ya es mayorista, o si la cantidad alcanza el umbral.
  const effectiveChannel: 'retail' | 'wholesale' =
    product.catalog_type === 'wholesale' || quantity >= wholesaleThreshold
      ? 'wholesale'
      : 'retail';
  // Un producto vendido como minorista que cruzó el umbral entra en modo mayorista.
  const wholesaleModeActive =
    product.catalog_type !== 'wholesale' && quantity >= wholesaleThreshold;

  // Técnicas visibles según canal: minorista solo DTF, mayorista DTF + serigrafía.
  const visibleSurcharges = surcharges.filter((s) =>
    effectiveChannel === 'wholesale'
      ? s.channel === 'wholesale' || s.channel === 'both'
      : s.channel === 'retail' || s.channel === 'both'
  );

  // Si la técnica seleccionada deja de ofrecerse al cambiar de canal
  // (ej. bajar de mayorista a minorista con serigrafía elegida), se limpia.
  useEffect(() => {
    if (activeSurcharge && !visibleSurcharges.some((s) => s.id === activeSurcharge.id)) {
      onActiveSurchargeChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveChannel, activeSurcharge?.id]);

  // ── CTA state ────────────────────────────────────────────────────────────
  const ctaState = (() => {
    if (quantity < minUnits) return 'disabled' as const;
    if (quantity >= threshold || !!activeSurcharge) return 'quote' as const;
    return 'cart' as const;
  })();

  // ── Quote con debounce ───────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (quantity < minUnits || quantity >= threshold) {
      setQuoteResult(null);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getProductQuote(product.slug, { quantity });
        setQuoteResult(result);
      } catch (e: unknown) {
        setError((e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al calcular precio');
        setQuoteResult(null);
      } finally {
        setLoading(false);
      }
    }, 380);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [quantity, product.slug, minUnits, threshold]);

  // ── Precios para el total sticky ─────────────────────────────────────────
  const unitPrice = quoteResult
    ? parseFloat(quoteResult.unit_price)
    : quantity >= minUnits
      ? parseFloat(String(product.starting_price))
      : null;

  const logoExtra = activeSurcharge
    ? activeSurcharge.price_extra * quantity
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    const notes: string[] = [];
    if (activeSurcharge) {
      notes.push(`Técnica: ${activeSurcharge.technique_display}${
        activeSurcharge.colors > 0
          ? ` (${activeSurcharge.colors} color${activeSurcharge.colors > 1 ? 'es' : ''})`
          : ' (full color)'
      }`);
    }
    if (customization?.customizationNotes) {
      notes.push(customization.customizationNotes);
    }

    addItem(product, {
      quantity,
      unit_price_override: quoteResult?.unit_price ?? String(product.base_price),
      customization_notes: notes.join(' | ') || undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }, [addItem, product, quantity, quoteResult, activeSurcharge, customization]);

  // Notas de personalización para la cotización (técnica + notas del cliente).
  const quoteLogoNotes = (() => {
    const notes: string[] = [];
    if (activeSurcharge) {
      notes.push(`Técnica: ${activeSurcharge.technique_display}${
        activeSurcharge.colors > 0 ? ` (${activeSurcharge.colors} colores)` : ' (full color)'
      }`);
    }
    if (customization?.customizationNotes) notes.push(customization.customizationNotes);
    return notes.join(' | ');
  })();

  const quoteWhatsappMessage = [
    `Hola, me interesa cotizar *${product.name}*`,
    `Cantidad: ${quantity} unidades`,
    quoteResult ? `Precio estimado: S/ ${parseFloat(quoteResult.total).toFixed(2).replace('.', ',')}` : '',
    quoteLogoNotes ? `Personalización: ${quoteLogoNotes}` : '',
    `Producto: ${typeof window !== 'undefined' ? window.location.href : ''}`,
  ].filter(Boolean).join('\n');

  // Abre el formulario: registra el Quote en el backend y luego abre WhatsApp.
  const handleRequestQuote = useCallback(() => setShowQuoteForm(true), []);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header: nombre + badges ── */}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {product.featured && (
            <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              ★ Destacado
            </span>
          )}
          {isRetail && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShoppingBag size={9} strokeWidth={2.5} /> Minorista
            </span>
          )}
          {isWholesale && (
            <span className="bg-brand-navy text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Building2 size={9} strokeWidth={2.5} /> Mayorista
            </span>
          )}
          {canCustomize && (
            <span className="bg-brand-orange/10 text-brand-orange border border-brand-orange/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={9} /> Personalizable
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-brand-navy leading-tight tracking-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">
            Stock: <strong className="text-brand-navy">{product.stock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} uds</strong>
          </span>
          <span className="text-gray-200 text-xs">|</span>
          <button
            onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy transition-colors"
          >
            <Share2 size={11} /> Compartir
          </button>
        </div>
      </div>

      {/* ── Tabs — solo si tiene personalización ── */}
      {canCustomize ? (
        <div className="flex mt-3 mb-0 bg-gray-100/70 rounded-xl p-1 gap-1">
          {([
            { id: 'comprar',      label: 'Comprar' },
            { id: 'personalizar', label: 'Personalizar' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3" />
      )}

      {/* ── Banner modo mayorista ── */}
      {wholesaleModeActive && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-navy/5 border border-brand-navy/15 px-3 py-2.5">
          <Building2 size={15} className="text-brand-navy flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-brand-navy leading-relaxed">
            <strong>Modo mayorista.</strong> Desde {wholesaleThreshold} unidades este pedido se cotiza
            como mayorista, con precios por volumen y opciones DTF + serigrafía.
          </p>
        </div>
      )}

      {/* ── Tab content (scrollable internamente si hace falta) ── */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2
                      scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {activeTab === 'comprar' && (
          <PricingTab
            product={product}
            quantity={quantity}
            quoteResult={quoteResult}
            loading={loading}
            error={error}
            onQuantityChange={setQuantity}
          />
        )}
        {activeTab === 'personalizar' && canCustomize && (
          <CustomizerTab
            surcharges={visibleSurcharges}
            active={activeSurcharge}
            quantity={quantity}
            minUnitsForLogo={product.min_units_for_logo ?? 100}
            onSelect={onActiveSurchargeChange}
            onOpenCustomizer={onOpenCustomizer}
            hasCustomization={!!customization?.hasCustomization}
          />
        )}
      </div>

      {/* ── Total sticky al fondo ── */}
      <StickyTotal
        unitPrice={unitPrice}
        quantity={quantity}
        logoExtra={logoExtra}
        loading={loading}
        ctaState={ctaState}
        addedToCart={addedToCart}
        productSlug={product.slug}
        onAddToCart={handleAddToCart}
        onRequestQuote={handleRequestQuote}
      />

      {showQuoteForm && (
        <QuoteRequestModal
          product={product}
          quantity={quantity}
          technique={activeSurcharge?.technique}
          logoNotes={quoteLogoNotes}
          estimatedTotal={quoteResult?.total ?? null}
          customizationPreview={customization?.logoPreviewUrl ?? null}
          whatsappMessage={quoteWhatsappMessage}
          onClose={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
}