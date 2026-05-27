'use client';

// components/ui/ProductModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO completo:
//
// 1. BUG PRINCIPAL ARREGLADO: el modal ahora se monta en document.body vía
//    createPortal. Antes vivía dentro del DOM tree del ProductCard, por eso
//    quedaba confinado al ancho de la card (~280px) y el sm:grid-cols-2 nunca
//    aplicaba correctamente.
//
// 2. Layout horizontal real en desktop (md:grid-cols-2). En mobile sigue
//    siendo vertical pero con scroll interno controlado.
//
// 3. UN solo indicador de agotado: overlay sobre la imagen + botón disabled +
//    precio tachado. Eliminé el StockStatus duplicado.
//
// 4. Quité el badge "Categoría" duplicado (estaba en top-4 Y bottom-4).
//
// 5. Imágenes con next/image (optimizadas).
//
// 6. Cleanup correcto del scroll bloqueado: useEffect con cleanup en el
//    return, no dependiente del flujo de handleClose.
//
// 7. handleClose memoizado con useCallback para usarlo correctamente en deps
//    del listener de Escape.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  X,
  MessageCircle,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  ShieldCheck,
  Headset,
  Star,
} from 'lucide-react';
import { Product } from '@/types';
import { WHATSAPP } from '@/lib/config';
import { useCartStore } from '@/store/cartStore';

interface Props {
  product: Product | null;
  onClose: () => void;
}

// Diferenciales mostrados en el modal
const PERKS = [
  { icon: Truck,       label: 'Envío a todo el Perú' },
  { icon: ShieldCheck, label: 'Calidad garantizada' },
  { icon: Headset,     label: 'Atención personalizada por WhatsApp' },
];

const CLOSE_ANIMATION_MS = 250;

export default function ProductModal({ product, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore(
    (s) => s.items.find((i) => i.product.id === product?.id)?.quantity ?? 0,
  );

  const [added, setAdded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ─── Portal mount detection (solo client) ──────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Estados derivados ─────────────────────────────────────────────────────
  const isOutOfStock = !!product && product.stock === 0;
  const isLowStock = !!product && product.stock > 0 && product.stock <= 5;
  const reachedCartLimit = !!product && inCart >= product.stock;
  const isDisabled = !product || isOutOfStock || reachedCartLimit;

  // ─── Close handler (memoizado para usarlo en deps de effects) ─────────────
  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, CLOSE_ANIMATION_MS);
  }, [onClose]);

  // ─── Apertura/cierre + bloqueo de scroll ──────────────────────────────────
  useEffect(() => {
    if (!product) return;

    // Animación de entrada
    requestAnimationFrame(() => setVisible(true));

    // Bloquear scroll del body
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup: SIEMPRE restaurar el scroll (importante si se desmonta sin handleClose)
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  // ─── Tecla Escape ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!product) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [product, handleClose]);

  // ─── Acciones ─────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product || isDisabled) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const url = WHATSAPP.link(
      `¡Hola Plastitex! 👋\n\n` +
        `Estoy interesado en el siguiente producto:\n\n` +
        `📦 *${product.name}*\n` +
        `🏷️ Categoría: ${product.category_name}\n` +
        `💰 Precio referencial: S/ ${parseFloat(product.price).toFixed(2)}\n\n` +
        `¿Me pueden brindar más información?`,
    );
    window.open(url, '_blank');
  };

  // ─── No renderizar si no hay producto o aún no se montó el portal ─────────
  if (!product || !mounted) return null;

  const price = parseFloat(product.price).toFixed(2);

  // ─── Modal renderizado en document.body vía portal ────────────────────────
  const modal = (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/55 backdrop-blur-sm z-[100]
                    transition-opacity duration-250
                    ${visible ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />

      {/* Contenedor — centra el modal */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center
                   p-4 sm:p-6 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div
          className={`relative bg-white rounded-2xl md:rounded-3xl shadow-2xl
                      w-full max-w-4xl max-h-[92vh] overflow-y-auto
                      pointer-events-auto
                      transition-all duration-250
                      ${visible
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'}`}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 md:top-4 md:right-4 z-20
                       w-9 h-9 bg-white/95 hover:bg-gray-100
                       border border-gray-200 rounded-full
                       flex items-center justify-center
                       shadow-sm transition-all duration-200 hover:rotate-90"
          >
            <X size={17} className="text-gray-700" strokeWidth={2.5} />
          </button>

          {/* Grid: vertical en mobile, horizontal en desktop (md = 768px) */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ═══════════════ COLUMNA IZQUIERDA: imagen ═══════════════ */}
            <div className="relative bg-gray-50 aspect-square md:aspect-auto md:min-h-[520px] overflow-hidden">
              {/* Badges sobre la imagen */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
                {/* Categoría (UNO solo, no duplicado como antes) */}
                {product.category_name && (
                  <span className="inline-block bg-white/95 backdrop-blur-sm text-brand-navy text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                    {product.category_name}
                  </span>
                )}

                {/* Destacado — solo si no está agotado */}
                {product.featured && !isOutOfStock && (
                  <span className="inline-flex items-center gap-1 bg-brand-orange text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    <Star size={11} strokeWidth={2.5} fill="currentColor" />
                    Destacado
                  </span>
                )}
              </div>

              {/* Imagen */}
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-300">
                  <Package size={72} strokeWidth={1} />
                  <p className="text-sm">Sin imagen disponible</p>
                </div>
              )}

              {/* Overlay AGOTADO — único indicador visual */}
              {isOutOfStock && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-brand-navy/92 backdrop-blur-sm text-white text-xs font-bold
                                   px-4 py-2 rounded-full uppercase tracking-wider shadow-md">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* ═══════════════ COLUMNA DERECHA: info ═══════════════ */}
            <div className="p-6 md:p-8 flex flex-col gap-5">
              {/* Título */}
              <div>
                <h2
                  id="product-modal-title"
                  className="text-2xl md:text-3xl font-bold text-brand-navy leading-tight tracking-tight"
                >
                  {product.name}
                </h2>

                {/* Stock contextual: solo en casos de urgencia (≤5) */}
                {isLowStock && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={14} strokeWidth={2.5} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">
                      Quedan solo {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                    </span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              {product.description && (
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Card de precio */}
              <div className="bg-brand-light rounded-2xl px-5 py-4 border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Precio referencial
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl md:text-4xl font-bold leading-none ${
                      isOutOfStock ? 'text-gray-400 line-through' : 'text-brand-navy'
                    }`}
                  >
                    S/ {price}
                  </span>
                </div>
                {inCart > 0 && !isOutOfStock && (
                  <p className="text-xs text-green-700 font-semibold mt-2 flex items-center gap-1.5">
                    <CheckCircle size={12} strokeWidth={2.5} />
                    Ya tienes {inCart} en tu carrito
                  </p>
                )}
              </div>

              {/* Perks */}
              <ul className="flex flex-col gap-2.5">
                {PERKS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <span className="w-7 h-7 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon size={13} strokeWidth={2.5} className="text-brand-orange" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              {/* CTAs — siempre al fondo */}
              <div className="flex flex-col gap-2.5 mt-auto pt-2">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600
                             text-white py-3.5 rounded-xl font-bold text-sm
                             transition-all duration-200 hover:scale-[1.02] active:scale-95
                             shadow-md shadow-green-500/25"
                >
                  <MessageCircle size={18} strokeWidth={2.5} />
                  Cotizar por WhatsApp
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                              ${
                                added
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : isDisabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-brand-navy hover:bg-brand-orange text-white hover:scale-[1.02] active:scale-95'
                              }`}
                >
                  {added ? (
                    <>
                      <CheckCircle size={16} strokeWidth={2.5} />
                      ¡Agregado al carrito!
                    </>
                  ) : isOutOfStock ? (
                    <span>Producto agotado</span>
                  ) : reachedCartLimit ? (
                    <span>Sin más stock disponible</span>
                  ) : (
                    <>
                      <ShoppingCart size={16} strokeWidth={2.5} />
                      Agregar al carrito
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Renderizar en document.body para escapar el DOM tree del padre
  return createPortal(modal, document.body);
}