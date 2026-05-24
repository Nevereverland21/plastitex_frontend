'use client';

import { useEffect, useState } from 'react';
import {
  X,
  MessageCircle,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface Props {
  product: Product | null;
  onClose: () => void;
}

function StockStatus({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
        <XCircle size={13} /> Agotado
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
        <AlertCircle size={13} /> Últimas {stock} unidades
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
      <CheckCircle size={13} /> En stock
    </span>
  );
}

const perks = [
  { icon: Truck, label: 'Envío a todo el Perú' },
  { icon: ShieldCheck, label: 'Calidad garantizada' },
  { icon: RotateCcw, label: 'Atención personalizada' },
];

export default function ProductModal({ product, onClose }: Props) {
  const { addItem, items } = useCartStore();
  const [added, setAdded] = useState(false);
  const [visible, setVisible] = useState(false);

  const inCart = items.find((i) => i.product.id === product?.id)?.quantity ?? 0;
  const availableStock = (product?.stock ?? 0) - inCart;
  const isDisabled = !product || product.stock === 0 || availableStock <= 0;

  // Animación de entrada
  useEffect(() => {
    if (product) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const handleAddToCart = () => {
    if (!product || isDisabled) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const phone = '51959388698';
    const message = encodeURIComponent(
      `¡Hola Plastitex! 👋\n\n` +
      `Estoy interesado en cotizar el siguiente producto:\n\n` +
      `📦 *${product.name}*\n` +
      `🏷️ Categoría: ${product.category_name}\n` +
      `💰 Precio referencial: S/ ${parseFloat(product.price).toFixed(2)}\n\n` +
      `¿Me pueden brindar más información y disponibilidad?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (!product) return null;
  console.log(product);
  return (
    <>
      {/* Overlay con animación */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-250 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto transition-all duration-250 ${
            visible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:rotate-90"
          >
            <X size={17} className="text-gray-600" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 min-h-[480px]">

            {/* ── Imagen ── */}
            <div className="relative bg-gray-50 rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden min-h-[280px] sm:min-h-[480px] flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300 p-10">
                  <Package size={72} strokeWidth={1} />
                  <p className="text-sm">Sin imagen</p>
                </div>
              )}

              {/* Degradado inferior */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

              {/* Badge destacado */}
              {product.featured && (
                <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  ⭐ Destacado
                </span>
              )}

              {/* Categoría badge abajo */}
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-brand-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Tag size={11} />
                  {product.category_name}
                </span>
              </div>
            </div>

            {/* ── Info ── */}
            <div className="p-7 sm:p-8 flex flex-col gap-5">

              {/* Nombre */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy leading-tight mb-2">
                  {product.name}
                </h2>
                <StockStatus stock={product.stock} />
              </div>

              {/* Descripción */}
              {product.description && (
                <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-brand-orange/30 pl-3">
                  {product.description}
                </p>
              )}

              {/* Precio */}
              <div className="bg-brand-light rounded-2xl px-5 py-4">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                  Precio referencial
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-brand-navy">S/</span>
                  <span className="text-4xl font-bold text-brand-orange">
                    {parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
                {inCart > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Ya tienes {inCart} en tu carrito
                  </p>
                )}
              </div>

              {/* Perks */}
              <div className="flex flex-col gap-2">
                {perks.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs text-gray-500">
                    <div className="w-6 h-6 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon size={12} className="text-brand-orange" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-2.5 mt-auto">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
                >
                  <MessageCircle size={18} />
                  Cotizar por WhatsApp
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                    added
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-navy hover:bg-brand-orange text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {added ? (
                    <><CheckCircle size={16} /> ¡Agregado al carrito!</>
                  ) : (
                    <><ShoppingCart size={16} /> {isDisabled ? 'Sin stock disponible' : 'Agregar al carrito'}</>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}