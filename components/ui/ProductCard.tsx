'use client';

import { ShoppingCart, Package, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import ProductModal from './ProductModal';

interface Props {
  product: Product;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-500">
        <XCircle size={12} /> Agotado
      </span>
    );
  if (stock <= 5)
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
        <AlertCircle size={12} /> Últimas {stock} unidades
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-green-500">
      <CheckCircle size={12} /> En stock
    </span>
  );
}

export default function ProductCard({ product }: Props) {
  const { addItem, items } = useCartStore();
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const inCart = items.find((i) => i.product.id === product.id)?.quantity ?? 0;
  const availableStock = product.stock - inCart;
  const isDisabled = product.stock === 0 || availableStock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100 cursor-pointer flex flex-col"
      >
        {/* Imagen — más alta */}
        <div className="relative w-full h-64 bg-gray-50 overflow-hidden flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package size={48} strokeWidth={1} className="text-gray-300" />
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/25 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-white/95 backdrop-blur-sm text-brand-navy text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl">
              <Eye size={14} />
              Ver detalle
            </div>
          </div>

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                ⭐ Destacado
              </span>
            )}
          </div>

          {/* Agotado overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/65 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white border border-gray-200 text-gray-600 text-sm font-bold px-5 py-2 rounded-full shadow-md">
                Agotado
              </span>
            </div>
          )}

          {/* Categoría badge abajo izquierda */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-brand-navy/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              {product.category_name}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 flex flex-col gap-3 flex-1">

          {/* Nombre */}
          <h3 className="text-base font-bold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-orange transition-colors duration-200">
            {product.name}
          </h3>

          {/* Descripción */}
          {product.description && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div className="flex items-center justify-between">
            <StockBadge stock={product.stock} />
            {inCart > 0 && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {inCart} en carrito
              </span>
            )}
          </div>

          {/* Separador */}
          <div className="h-px bg-gray-100" />

          {/* Precio + botón */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 leading-none mb-1">desde</p>
              <p className="text-xl font-bold text-brand-navy">
                S/ <span className="text-brand-orange">{parseFloat(product.price).toFixed(2)}</span>
              </p>
            </div>

            <button
              onClick={handleAdd}
              disabled={isDisabled}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex-shrink-0 ${
                added
                  ? 'bg-green-500 text-white scale-95'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-navy hover:bg-brand-orange text-white hover:scale-105 shadow-md shadow-brand-navy/20'
              }`}
            >
              {added ? (
                <><CheckCircle size={14} /> ¡Listo!</>
              ) : (
                <><ShoppingCart size={14} /> Agregar</>
              )}
            </button>
          </div>

        </div>
      </div>

      <ProductModal
        product={modalOpen ? product : null}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}