'use client';

// components/ui/ProductCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// REDISEÑO + FIX:
//
// Fix de este pase:
//   - Precio "S/ 5.00" ya NO se parte en 2 líneas en cards estrechas (catálogo).
//     Aplicado `whitespace-nowrap` al contenedor del precio + reorganizada la
//     fila precio+botón para que el precio siempre quepa horizontalmente.
//
// Cambios anteriores (recordatorio):
//   - Imagen cuadrada 1:1 con next/image
//   - UN solo indicador de agotado (overlay + botón disabled + precio tachado)
//   - Badge "Destacado" en esquina superior derecha
//   - Stock como información contextual (solo "Últimas X" si stock ≤ 5)
//   - Precio en un solo color
//   - Categoría como pill discreto arriba izquierda
//   - Descripción gray-600 (legible)
//   - Selectores correctos de Zustand
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image';
import { useState } from 'react';
import {
  ShoppingCart,
  Package,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import ProductModal from './ProductModal';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore(
    (s) => s.items.find((i) => i.product.id === product.id)?.quantity ?? 0,
  );

  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ─── Estado del stock ───────────────────────────────────────────────────
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const reachedCartLimit = inCart >= product.stock;
  const isDisabled = isOutOfStock || reachedCartLimit;

  const price = parseFloat(product.price).toFixed(2);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCardClick = () => setModalOpen(true);

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100
                   shadow-sm hover:shadow-xl transition-all duration-300
                   hover:-translate-y-1 hover:border-gray-200
                   cursor-pointer flex flex-col"
      >
        {/* ═══════════════ IMAGEN ═══════════════ */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {/* Badge "Destacado" */}
          {product.featured && !isOutOfStock && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 bg-brand-orange text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                <Star size={11} strokeWidth={2.5} fill="currentColor" />
                Destacado
              </span>
            </div>
          )}

          {/* Categoría — pill blanco discreto arriba izquierda */}
          {product.category_name && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block bg-white/95 backdrop-blur-sm text-brand-navy text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                {product.category_name}
              </span>
            </div>
          )}

          {/* Imagen */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-all duration-500
                          group-hover:scale-105
                          ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Package size={48} strokeWidth={1.2} className="text-gray-300" />
            </div>
          )}

          {/* Overlay hover "Ver detalle" */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20
                            transition-all duration-300 flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300
                               scale-90 group-hover:scale-100
                               bg-white text-brand-navy text-xs font-bold px-4 py-2 rounded-full
                               flex items-center gap-1.5 shadow-lg">
                <Eye size={13} strokeWidth={2.5} />
                Ver detalle
              </span>
            </div>
          )}

          {/* Overlay AGOTADO */}
          {isOutOfStock && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-brand-navy/92 backdrop-blur-sm text-white text-[11px] font-bold
                               px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════ CONTENIDO ═══════════════ */}
        <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
          {/* Nombre */}
          <h3 className="text-base font-bold text-brand-navy leading-snug line-clamp-2
                         group-hover:text-brand-orange transition-colors">
            {product.name}
          </h3>

          {/* Descripción */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-snug line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Stock contextual */}
          {isLowStock && (
            <div className="flex items-center gap-1.5 mt-1">
              <AlertCircle size={13} strokeWidth={2.5} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                Últimas {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
          )}

          {/* "En carrito" */}
          {inCart > 0 && !isOutOfStock && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle size={11} strokeWidth={2.5} />
                {inCart} en carrito
              </span>
            </div>
          )}

          {/* Separador */}
          <div className="h-px bg-gray-100 mt-auto" />

          {/* ════════ Precio + botón ════════ */}
          {/* FIX: en cards estrechas (catálogo, 4 columnas) el precio "S/ 5.00"
              se partía en dos líneas. Soluciones aplicadas:
                1. `whitespace-nowrap` en el contenedor del precio
                2. `min-w-0` y `gap` controlado en la fila
                3. El bloque del precio tiene `flex-shrink-0` para no comprimirse
                4. El botón tiene `flex-shrink-0` también, no se aplasta */}
          <div className="flex items-end justify-between gap-2 pt-1">
            <div className="flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold leading-none mb-1">
                desde
              </p>
              <p
                className={`text-xl font-bold leading-none whitespace-nowrap ${
                  isOutOfStock ? 'text-gray-400 line-through' : 'text-brand-navy'
                }`}
              >
                S/ {price}
              </p>
            </div>

            <button
              onClick={handleAdd}
              disabled={isDisabled}
              aria-label={
                isOutOfStock
                  ? 'Producto agotado'
                  : reachedCartLimit
                    ? 'Sin más stock disponible'
                    : `Agregar ${product.name} al carrito`
              }
              className={`inline-flex items-center gap-1.5 text-xs font-bold
                          px-3 py-2.5 rounded-xl transition-all duration-200
                          flex-shrink-0 active:scale-95
                          ${
                            added
                              ? 'bg-green-500 text-white'
                              : isDisabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-brand-navy hover:bg-brand-orange text-white hover:scale-105 shadow-sm hover:shadow-md'
                          }`}
            >
              {added ? (
                <>
                  <CheckCircle size={14} strokeWidth={2.5} />
                  <span>¡Listo!</span>
                </>
              ) : isOutOfStock ? (
                <span>No disponible</span>
              ) : (
                <>
                  <ShoppingCart size={14} strokeWidth={2.5} />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Modal de detalle */}
      <ProductModal
        product={modalOpen ? product : null}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}