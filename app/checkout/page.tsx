'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/lib/api';
import { WHATSAPP } from '@/lib/config';
import {
  ShoppingBag, User, Mail, Phone, MapPin,
  CheckCircle, ArrowLeft, MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

interface FormData {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
}

interface FormErrors {
  customer_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function Checkout() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();

  const [form, setForm] = useState<FormData>({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.customer_name.trim())
      newErrors.customer_name = 'El nombre es requerido';
    if (!form.email.trim())
      newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Email inválido';
    if (!form.phone.trim())
      newErrors.phone = 'El teléfono es requerido';
    else if (!/^\d{9,15}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Teléfono inválido';
    if (!form.address.trim())
      newErrors.address = 'La dirección es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const order = await createOrder({
        customer_name: form.customer_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        order_type: 'retail',
        delivery_type: 'pickup',
        delivery_cost: '0.00',
        items: items.map((i) => ({
          product: i.product.id,
          quantity: i.quantity,
          unit_price: i.unit_price_override ?? i.product.base_price,
        })),
      });

      // Armar mensaje WhatsApp con resumen completo
      const itemsText = items
        .map((i) => {
          const price = parseFloat(i.unit_price_override ?? i.product.base_price);
          const extras = i.selected_extras?.length
            ? ` + ${i.selected_extras.map((e) => e.name).join(', ')}`
            : '';
          return `  • ${i.quantity}x ${i.product.name}${extras} — S/ ${(price * i.quantity).toFixed(2)}`;
        })
        .join('\n');

      const url = WHATSAPP.link(
        `¡Hola Plastitex! 👋 Acabo de confirmar un pedido en su tienda.\n\n` +
        `📋 *Pedido #${order.id}*\n\n` +
        `👤 *Cliente:* ${form.customer_name}\n` +
        `📧 *Email:* ${form.email}\n` +
        `📱 *Teléfono:* ${form.phone}\n` +
        `📍 *Dirección:* ${form.address}\n\n` +
        `🛍️ *Productos:*\n${itemsText}\n\n` +
        `💰 *Total: S/ ${total.toFixed(2)}*\n\n` +
        `¿Pueden confirmar mi pedido y coordinar el pago? ¡Gracias!`
      );

      setWaUrl(url);
      clearCart();
      setSuccess(true);

      setTimeout(() => {
        window.open(url, '_blank');
      }, 1500);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Carrito vacío
  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={56} strokeWidth={1} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 text-sm mb-6">Agrega productos antes de continuar</p>
          <Link href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3
                       rounded-full font-medium text-sm hover:bg-brand-orange transition-colors">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy mb-2">¡Pedido confirmado!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-3">
            Tu pedido fue registrado. En un momento se abrirá WhatsApp para coordinar el pago y envío.
          </p>
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200
                          rounded-xl px-4 py-3 mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-green-700 text-xs font-medium">Abriendo WhatsApp automáticamente...</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600
                         text-white py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-105">
              <MessageCircle size={18} />
              Abrir WhatsApp manualmente
            </a>
            <Link href="/"
              className="w-full flex items-center justify-center bg-brand-navy hover:bg-brand-orange
                         text-white py-3 rounded-2xl font-medium text-sm transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500
                     hover:text-brand-navy transition-colors mb-8">
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Formulario */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-brand-navy mb-8">Datos de entrega</h1>
            <div className="space-y-5">

              {[
                { icon: User,   name: 'customer_name', label: 'Nombre completo',       type: 'text',  placeholder: 'Juan Pérez' },
                { icon: Mail,   name: 'email',          label: 'Correo electrónico',    type: 'email', placeholder: 'juan@email.com' },
                { icon: Phone,  name: 'phone',          label: 'Teléfono',              type: 'tel',   placeholder: '999 999 999' },
              ].map(({ icon: Icon, name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={type} name={name}
                      value={form[name as keyof FormData]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-navy/20
                                 focus:border-brand-navy transition-all
                                 ${errors[name as keyof FormErrors] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                  </div>
                  {errors[name as keyof FormErrors] && (
                    <p className="text-red-500 text-xs mt-1">{errors[name as keyof FormErrors]}</p>
                  )}
                </div>
              ))}

              {/* Dirección (textarea) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dirección de entrega</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-4 text-gray-400" />
                  <textarea name="address" value={form.address} onChange={handleChange}
                    placeholder="Av. ejemplo 123, Lima" rows={3}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-navy/20
                               focus:border-brand-navy transition-all resize-none
                               ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-brand-navy mb-5">Resumen del pedido</h2>

              <div className="space-y-3 mb-5">
                {items.map(({ product, quantity, unit_price_override }) => {
                  const price = parseFloat(unit_price_override ?? product.base_price);
                  return (
                    <div key={product.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">x{quantity} · S/ {price.toFixed(2)} c/u</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        S/ {(price * quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Total estimado</span>
                  <span className="text-2xl font-bold text-brand-navy">S/ {total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">No incluye IGV</p>
              </div>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-brand-navy hover:bg-brand-orange disabled:bg-gray-200
                           disabled:cursor-not-allowed text-white disabled:text-gray-400
                           py-4 rounded-2xl font-semibold text-sm transition-all
                           hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                ) : (
                  <><CheckCircle size={18} /> Confirmar pedido</>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Te contactaremos para coordinar el pago
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}