'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, CheckCircle,
  ChevronDown, ChevronUp, Download, MessageCircle,
  ShoppingCart, Loader2, Info, Truck, Store,
  BadgeCheck, Clock,
  Sparkles, PenLine,
  // ── NUEVO: layout compacto + zoom ──
  ZoomIn, X,
} from 'lucide-react';
import { getProductBySlug, getProductQuote } from '@/lib/api';
import type { ProductDetail, PricingTier, QuoteResponse } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { WHATSAPP } from '@/lib/config';
// ── NUEVOS imports ────────────────────────────────────────────────────────────
import dynamic from 'next/dynamic';

const CustomizerModal = dynamic(
  () => import('@/components/customizer/CustomizerModal'),
  { ssr: false }
);
import type { CustomizationData } from '@/types/customizer';
import { EMPTY_CUSTOMIZATION } from '@/types/customizer';

// ─── Constante mayorista ──────────────────────────────────────────────────────
const WHOLESALE_THRESHOLD = 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: string | number) {
  return parseFloat(String(value)).toFixed(2);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  // ── Estado del producto ──────────────────────────────────────────────────
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Configurador ────────────────────────────────────────────────────────
  const [quantity, setQuantity] = useState(100);
  const [quantityInput, setQuantityInput] = useState('100');
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);

  // ── Cotización ──────────────────────────────────────────────────────────
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // ── Delivery ────────────────────────────────────────────────────────────
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');

  // ── UI ───────────────────────────────────────────────────────────────────
  const [specsOpen, setSpecsOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const configuratorRef = useRef<HTMLDivElement>(null);

  // ── NUEVO: Estado del personalizador ─────────────────────────────────────
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customization, setCustomization] = useState<CustomizationData>(EMPTY_CUSTOMIZATION);

  // ── NUEVO: lightbox de zoom de imagen ────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Debounce de cantidad para no llamar a la API en cada tecla
  const debouncedQuantity = useDebounce(quantity, 400);
  const debouncedExtras = useDebounce(selectedExtras, 300);

  // ── Cargar producto ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        const firstTier = p.pricing_tiers?.[0];
        if (firstTier) {
          setQuantity(firstTier.min_quantity);
          setQuantityInput(String(firstTier.min_quantity));
        }
      })
      .catch(() => router.push('/catalogo'))
      .finally(() => setLoading(false));
  }, [router, slug]);

  // ── Cotizar en tiempo real ────────────────────────────────────────────────
  useEffect(() => {
    if (!product || debouncedQuantity < 1) return;
    setQuoteLoading(true);
    getProductQuote(product.slug, {
      quantity: debouncedQuantity,
      extra_ids: debouncedExtras,
    })
      .then(setQuote)
      .catch(console.error)
      .finally(() => setQuoteLoading(false));
  }, [product, debouncedQuantity, debouncedExtras]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleQuantityChange = (val: string) => {
    setQuantityInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) setQuantity(n);
  };

  const handleQuantityBlur = () => {
    const n = parseInt(quantityInput, 10);
    if (isNaN(n) || n < 1) {
      setQuantity(100);
      setQuantityInput('100');
    }
  };

  const handleTierClick = (tier: PricingTier) => {
    setQuantity(tier.min_quantity);
    setQuantityInput(String(tier.min_quantity));
  };

  const toggleExtra = (id: number) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── MODIFICADO: handleAddToCart incluye customization_notes ──────────────
  const handleAddToCart = () => {
    if (!product || !quote) return;

    // Construir nota de personalización combinando logo + notas libres
    let custNotes = '';
    if (customization.hasCustomization) {
      if (customization.logoDataUrl) custNotes += '[Logo personalizado adjunto] ';
      if (customization.customizationNotes) custNotes += customization.customizationNotes;
    }
    if (selectedExtras.length > 0) {
      const extrasText = `Extras: ${quote.extras_detail.map((e) => e.name).join(', ')}`;
      custNotes = custNotes ? `${custNotes} | ${extrasText}` : extrasText;
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        base_price: product.base_price,
        starting_price: product.base_price,
        image: customization.logoPreviewUrl ?? product.image, // ← preview con logo si existe
        stock: product.stock,
        featured: product.featured,
        category_name: product.category.name,
        category_slug: product.category.slug,
        pricing_tiers: product.pricing_tiers,
      },
      {
        quantity,
        unit_price_override: quote.unit_price,
        selected_extras: quote.extras_detail,
        customization_notes: custNotes || undefined,
      }
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWhatsAppQuote = () => {
    if (!product || !quote) return;
    const extrasText = quote.extras_detail.length > 0
      ? `\nExtras: ${quote.extras_detail.map((e) => e.name).join(', ')}`
      : '';
    // ── NUEVO: incluir notas de personalización en el mensaje de WA ──
    const custText = customization.customizationNotes
      ? `\n🎨 Personalización: ${customization.customizationNotes}`
      : '';
    const logoText = customization.logoDataUrl ? '\n🖼️ Logo: adjunto al confirmar pedido' : '';

    const msg =
      `Hola, me interesa cotizar:\n\n` +
      `📦 *${product.name}*\n` +
      `🔢 Cantidad: ${quantity.toLocaleString()} unidades\n` +
      `💰 Precio unitario aprox: S/ ${formatPrice(quote.unit_price)}${extrasText}${custText}${logoText}\n` +
      `💵 Total estimado: S/ ${formatPrice(quote.total)}\n\n` +
      `¿Pueden confirmar disponibilidad y condiciones?`;
    window.open(WHATSAPP.link(msg), '_blank');
  };

  // ── NUEVO: guardar personalización desde el modal ─────────────────────────
  const handleSaveCustomization = useCallback((data: CustomizationData) => {
    setCustomization(data);
  }, []);

  // ── Obtener tier activo ───────────────────────────────────────────────────
  const getActiveTier = useCallback(
    (tiers: PricingTier[], qty: number): PricingTier | null => {
      const eligible = tiers.filter((t) => t.min_quantity <= qty);
      if (eligible.length === 0) return null;
      return eligible.reduce((a, b) =>
        a.min_quantity > b.min_quantity ? a : b
      );
    },
    []
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-navy rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isWholesale = quantity >= WHOLESALE_THRESHOLD;
  const activeTier = getActiveTier(product.pricing_tiers, quantity);
  const hasSpecs = product.material || product.capacity_ml || product.height_cm || product.weight_grams;
  // Imagen que se muestra (preview personalizado o imagen del producto)
  const displayImage = customization.logoPreviewUrl ?? product.image;

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/" className="hover:text-brand-navy transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-brand-navy transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-brand-navy font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ─── Layout principal ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-6 xl:gap-10 items-start">

          {/* ══════════════ COLUMNA IZQUIERDA — IMAGEN STICKY ══════════════ */}
          <div className="lg:sticky lg:top-6 space-y-3">

            {/* Imagen principal con zoom */}
            <div className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              {displayImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                  />
                  {/* Badge de personalización / destacado */}
                  {customization.logoPreviewUrl ? (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      <Sparkles size={11} /> Tu diseño
                    </div>
                  ) : product.featured && (
                    <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      ⭐ Destacado
                    </span>
                  )}
                  {/* Botón de zoom */}
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm
                               border border-gray-100 flex items-center justify-center text-gray-500
                               opacity-0 group-hover:opacity-100 hover:bg-white hover:text-brand-navy
                               shadow-sm transition-all"
                    title="Ampliar imagen"
                  >
                    <ZoomIn size={16} />
                  </button>
                  {/* Botón editar diseño (solo si personalizado) */}
                  {customization.logoPreviewUrl && (
                    <button
                      onClick={() => setCustomizerOpen(true)}
                      className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm
                                 text-brand-navy text-xs font-semibold px-3 py-2 rounded-xl shadow-sm
                                 border border-gray-100 hover:bg-white hover:shadow-md transition-all"
                    >
                      <PenLine size={12} /> Editar diseño
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200">
                  <Package size={80} strokeWidth={1} />
                  <p className="text-sm mt-3 text-gray-300">Sin imagen</p>
                </div>
              )}
            </div>

            {/* Botón de personalización — compacto */}
            <button
              onClick={() => setCustomizerOpen(true)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all group
                ${customization.hasCustomization
                  ? 'border-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10'
                  : 'border-dashed border-gray-300 bg-white hover:border-brand-orange hover:bg-brand-orange/5'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0
                  ${customization.hasCustomization
                    ? 'bg-brand-orange text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-brand-orange/15 group-hover:text-brand-orange'}`}>
                  <Sparkles size={16} />
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-sm font-bold truncate ${customization.hasCustomization ? 'text-brand-orange' : 'text-brand-navy'}`}>
                    {customization.hasCustomization ? '¡Personalización lista!' : 'Personalizar con mi logo'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {customization.hasCustomization
                      ? (customization.customizationNotes
                          ? customization.customizationNotes.slice(0, 42) + (customization.customizationNotes.length > 42 ? '…' : '')
                          : 'Logo aplicado · clic para editar')
                      : 'Agrega tu logo y especificaciones'}
                  </p>
                </div>
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0
                ${customization.hasCustomization ? 'text-brand-orange' : 'text-gray-400 group-hover:text-brand-orange'}`}>
                {customization.hasCustomization ? <><PenLine size={12} /> Editar</> : <>Comenzar <ArrowLeft size={12} className="rotate-180" /></>}
              </span>
            </button>

            {/* Ficha técnica + specs en una fila compacta */}
            <div className="grid grid-cols-1 gap-3">
              {product.technical_sheet && (
                <a
                  href={product.technical_sheet.pdf_file}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-navy/20 bg-white
                             hover:border-brand-navy hover:bg-brand-navy/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-navy/20 transition-colors">
                    <Download size={15} className="text-brand-navy" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy">Ficha técnica</p>
                    <p className="text-xs text-gray-400">Descargar PDF</p>
                  </div>
                  <ArrowLeft size={14} className="text-gray-300 rotate-180 group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {hasSpecs && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setSpecsOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
                  >
                    <span>Especificaciones técnicas</span>
                    {specsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {specsOpen && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <dl className="grid grid-cols-2 gap-2.5 mt-3">
                        {product.material && <SpecRow label="Material" value={product.material} />}
                        {product.capacity_ml && <SpecRow label="Capacidad" value={`${product.capacity_ml} ml`} />}
                        {product.height_cm && <SpecRow label="Alto" value={`${product.height_cm} cm`} />}
                        {product.diameter_cm && <SpecRow label="Diámetro" value={`${product.diameter_cm} cm`} />}
                        {product.weight_grams && <SpecRow label="Peso" value={`${product.weight_grams} g`} />}
                        {product.packaging && <SpecRow label="Empaque" value={product.packaging} />}
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ══════════════ COLUMNA DERECHA — CONFIGURADOR ══════════════ */}
          <div ref={configuratorRef} className="space-y-4">

            {/* Cabecera */}
            <div>
              <span className="text-brand-orange text-[11px] font-bold uppercase tracking-[0.2em]">
                {product.category.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy leading-tight mt-1 mb-2">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
              )}
            </div>

            {/* ── Tabla de precios por volumen ── */}
            {product.pricing_tiers.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                  <BadgeCheck size={15} className="text-brand-orange" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-brand-navy">Precio por volumen</span>
                  <span className="text-xs text-gray-400 ml-auto">Sin IGV</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {product.pricing_tiers.map((tier) => {
                    const isActive = activeTier?.min_quantity === tier.min_quantity;
                    return (
                      <button
                        key={tier.min_quantity}
                        onClick={() => handleTierClick(tier)}
                        className={`w-full flex items-center justify-between px-4 py-2.5
                                   text-left transition-all hover:bg-brand-orange/5
                                   ${isActive ? 'bg-brand-orange/8 border-l-4 border-brand-orange' : 'border-l-4 border-transparent'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isActive ? <CheckCircle size={14} className="text-brand-orange flex-shrink-0" strokeWidth={2.5} /> : <div className="w-[14px]" />}
                          <span className={`text-sm font-semibold ${isActive ? 'text-brand-navy' : 'text-gray-600'}`}>
                            {tier.min_quantity >= 1000
                              ? `${(tier.min_quantity / 1000).toFixed(tier.min_quantity % 1000 === 0 ? 0 : 1)}k`
                              : tier.min_quantity}+ unidades
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {tier.delivery_days && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={11} />{tier.delivery_days}d
                            </span>
                          )}
                          <span className={`text-sm font-bold ${isActive ? 'text-brand-orange' : 'text-brand-navy'}`}>
                            S/ {formatPrice(tier.unit_price)}<span className="text-xs font-normal text-gray-400"> c/u</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Selector de cantidad ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <label className="text-sm font-bold text-brand-navy block">
                ¿Cuántas unidades necesitas?
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { const n = Math.max(1, quantity - 100); setQuantity(n); setQuantityInput(String(n)); }}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-brand-navy hover:text-white
                             flex items-center justify-center text-brand-navy font-bold
                             transition-all active:scale-95 text-lg flex-shrink-0"
                >−</button>
                <input
                  type="number"
                  min={1}
                  value={quantityInput}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  onBlur={handleQuantityBlur}
                  className="flex-1 h-10 text-center text-lg font-bold text-brand-navy
                             border border-gray-200 rounded-xl
                             focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15
                             transition-all"
                />
                <button
                  onClick={() => { const n = quantity + 100; setQuantity(n); setQuantityInput(String(n)); }}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-brand-navy hover:text-white
                             flex items-center justify-center text-brand-navy font-bold
                             transition-all active:scale-95 text-lg flex-shrink-0"
                >+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 3000, 5000].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuantity(q); setQuantityInput(String(q)); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                               ${quantity === q ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-navy/10 hover:text-brand-navy'}`}
                  >
                    {q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
              {isWholesale && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                  <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-bold">Pedido mayorista.</span> El precio y tiempo de entrega
                    están sujetos a confirmación de stock. Un asesor te contactará.
                  </p>
                </div>
              )}
            </div>

            {/* ── Extras opcionales ── */}
            {product.extras.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5">
                <p className="text-sm font-bold text-brand-navy">Personalización y extras</p>
                <div className="space-y-2">
                  {product.extras.map((extra) => {
                    const isSelected = selectedExtras.includes(extra.id);
                    const isFreeFromQty = extra.included_from_quantity !== null && quantity >= extra.included_from_quantity;
                    return (
                      <button
                        key={extra.id}
                        onClick={() => !extra.is_quote_required && toggleExtra(extra.id)}
                        disabled={extra.is_quote_required}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl
                                   border transition-all text-left
                                   ${extra.is_quote_required ? 'border-gray-100 bg-gray-50 cursor-default opacity-70'
                                     : isSelected ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                                     : 'border-gray-100 hover:border-brand-orange/40 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                                           ${isSelected ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'}`}>
                            {isSelected && <CheckCircle size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-brand-navy' : 'text-gray-700'}`}>
                            {extra.name}
                          </span>
                        </div>
                        <span className={`text-xs font-bold flex-shrink-0
                                          ${extra.is_quote_required ? 'text-gray-400' : isFreeFromQty ? 'text-green-600' : 'text-brand-orange'}`}>
                          {extra.is_quote_required ? 'Cotizar'
                            : isFreeFromQty ? `Incluido desde ${extra.included_from_quantity?.toLocaleString()}u`
                            : `+S/ ${formatPrice(extra.unit_cost)} c/u`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TARJETA DE COMPRA: entrega + resumen + CTAs (estilo MercadoLibre) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* Entrega — fila horizontal compacta */}
              <div className="p-4 space-y-2">
                <p className="text-xs font-bold text-brand-navy uppercase tracking-wide">Entrega</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 transition-all
                               ${deliveryType === 'pickup' ? 'border-brand-navy bg-brand-navy/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <Store size={16} className={`flex-shrink-0 ${deliveryType === 'pickup' ? 'text-brand-navy' : 'text-gray-400'}`} />
                    <div className="text-left leading-tight">
                      <span className={`block text-xs font-bold ${deliveryType === 'pickup' ? 'text-brand-navy' : 'text-gray-500'}`}>Recojo</span>
                      <span className="block text-[10px] text-green-600 font-semibold">Sin costo</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 transition-all
                               ${deliveryType === 'delivery' ? 'border-brand-navy bg-brand-navy/5' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <Truck size={16} className={`flex-shrink-0 ${deliveryType === 'delivery' ? 'text-brand-navy' : 'text-gray-400'}`} />
                    <div className="text-left leading-tight">
                      <span className={`block text-xs font-bold ${deliveryType === 'delivery' ? 'text-brand-navy' : 'text-gray-500'}`}>Delivery</span>
                      <span className="block text-[10px] text-gray-400 font-medium">Coordinar</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Resumen + total */}
              <div className="p-4 space-y-2">
                {quote ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{quantity.toLocaleString()} uds × S/ {formatPrice(quote.unit_price)}</span>
                      <span className="font-semibold text-brand-navy">S/ {formatPrice(quote.subtotal)}</span>
                    </div>
                    {parseFloat(quote.extras_cost) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Extras</span>
                        <span className="font-semibold text-brand-orange">+ S/ {formatPrice(quote.extras_cost)}</span>
                      </div>
                    )}
                    {customization.hasCustomization && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={11} className="text-brand-orange flex-shrink-0" />
                        <span className="text-xs text-brand-orange font-semibold">Personalización con logo incluida</span>
                      </div>
                    )}
                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <p className="text-[11px] text-gray-400 leading-none mb-1">Total estimado · sin IGV</p>
                        <p className="text-3xl font-bold text-brand-navy leading-none">
                          S/ <span className="text-brand-orange">{formatPrice(quote.total)}</span>
                        </p>
                      </div>
                      {quote.delivery_days && (
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 leading-none mb-1">Entrega</p>
                          <p className="text-sm font-bold text-brand-navy">{quote.delivery_days} días</p>
                        </div>
                      )}
                    </div>
                    {(isWholesale || quote.requires_stock_confirmation) && (
                      <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 mt-1">
                        <Info size={12} className="text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-amber-800 leading-snug">
                          Precio sujeto a confirmación de stock. Un asesor te contactará.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-3 flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 size={15} className="animate-spin" />
                    <span className="text-sm">Calculando precio...</span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="p-4 pt-0 space-y-2.5">
                {!isWholesale ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={!quote || quoteLoading}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                               font-bold text-sm transition-all duration-300
                               ${addedToCart
                                 ? 'bg-green-500 text-white scale-[0.98]'
                                 : !quote || quoteLoading
                                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                   : 'bg-brand-navy hover:bg-brand-orange text-white shadow-lg shadow-brand-navy/20 hover:shadow-brand-orange/20 hover:scale-[1.01] active:scale-[0.98]'}`}
                  >
                    {addedToCart
                      ? <><CheckCircle size={18} /> ¡Agregado al carrito!</>
                      : <><ShoppingCart size={18} /> Agregar al carrito</>}
                  </button>
                ) : (
                  <button
                    onClick={handleWhatsAppQuote}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                               font-bold text-sm bg-[#25D366] hover:bg-[#1ebe5d] text-white
                               shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
                  >
                    <MessageCircle size={18} /> Solicitar cotización por WhatsApp
                  </button>
                )}
                <button
                  onClick={handleWhatsAppQuote}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                             font-semibold text-sm border border-gray-200 text-gray-600
                             hover:border-brand-navy hover:text-brand-navy transition-all duration-200"
                >
                  <MessageCircle size={15} strokeWidth={2.5} />
                  {isWholesale ? 'Hablar con un asesor' : 'O cotizar por WhatsApp'}
                </button>
              </div>

              {/* Garantías — fila inferior compacta */}
              <div className="flex items-center justify-around border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">🔒 Pago seguro</span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">🚚 Envíos Perú</span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">✅ Calidad</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── NUEVO: Lightbox de zoom de imagen ── */}
      {lightboxOpen && displayImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center text-white transition-all"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Modal del personalizador ── */}
      <CustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        onSave={handleSaveCustomization}
        productName={product.name}
        productImageUrl={product.image}
        initialData={customization.hasCustomization ? customization : undefined}
      />
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-brand-navy">{value}</p>
    </div>
  );
}