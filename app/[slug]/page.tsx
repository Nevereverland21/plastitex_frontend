'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductBySlug } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug as string)
      .then(setProduct)
      .catch(() => router.push('/catalogo'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: 'Agotado',
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: XCircle,
      };
    if (stock <= 5)
      return {
        label: `Últimas ${stock} unidades`,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: AlertCircle,
      };
    return {
      label: 'En stock',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
    };
  };

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

  const stock = getStockStatus(product.stock);
  const StockIcon = stock.icon;

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Volver */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-navy transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Imagen */}
            <div className="relative bg-gray-50 aspect-square lg:aspect-auto min-h-[400px] flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <Package size={80} strokeWidth={1} />
                  <p className="text-sm">Sin imagen</p>
                </div>
              )}

              {/* Badge destacado */}
              {product.featured && (
                <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Destacado
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">

              {/* Categoría */}
              <span className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-3">
                {product.category.name}
              </span>

              {/* Nombre */}
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy leading-tight mb-4">
                {product.name}
              </h1>

              {/* Descripción */}
              <p className="text-gray-500 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Stock */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium w-fit mb-6 ${stock.bg} ${stock.border} ${stock.color}`}
              >
                <StockIcon size={15} />
                {stock.label}
              </div>

              {/* Precio */}
              <div className="mb-8">
                <p className="text-sm text-gray-400 mb-1">Precio</p>
                <p className="text-4xl font-bold text-brand-navy">
                  S/{' '}
                  <span className="text-brand-orange">
                    {parseFloat(product.price).toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Botón agregar */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                  added
                    ? 'bg-green-500 text-white scale-95'
                    : product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-navy hover:bg-brand-orange text-white hover:scale-105 active:scale-95 shadow-lg shadow-brand-navy/20'
                }`}
              >
                {added ? (
                  <>
                    <CheckCircle size={20} />
                    ¡Agregado al carrito!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}