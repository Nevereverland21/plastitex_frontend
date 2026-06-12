'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';
import type { ProductDetail } from '@/types';
import { createQuote } from '@/lib/api';
import { WHATSAPP } from '@/lib/config';

interface QuoteRequestModalProps {
  product: ProductDetail;
  quantity: number;
  technique?: string;
  logoNotes?: string;
  estimatedTotal?: string | null;
  whatsappMessage: string;
  onClose: () => void;
}

/**
 * Formulario simple de cotización. Registra la cotización en el backend
 * (queda modificable en el admin) y luego abre WhatsApp para que el vendedor
 * cierre el trato. Así no se pierde el lead aunque el cliente no envíe el chat.
 */
export default function QuoteRequestModal({
  product,
  quantity,
  technique,
  logoNotes,
  whatsappMessage,
  onClose,
}: QuoteRequestModalProps) {
  const [form, setForm] = useState({ customer_name: '', email: '', phone: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Completa nombre, correo y teléfono.');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      await createQuote({
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim() || undefined,
        product: product.id,
        quantity,
        technique: technique || undefined,
        logo_notes: logoNotes || undefined,
        message: form.message.trim() || undefined,
      });
      setStatus('done');
      // Abrir WhatsApp para coordinar (el cliente adjunta su logo ahí).
      window.open(WHATSAPP.link(whatsappMessage), '_blank');
    } catch {
      // Aunque falle el registro, dejamos seguir por WhatsApp para no perder la venta.
      setStatus('error');
      setError('No se pudo registrar la cotización, pero puedes continuar por WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-black text-brand-navy">Solicitar cotización</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-navy" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {status === 'done' ? (
          <div className="px-5 py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
              <CheckCircle size={28} className="text-white" />
            </div>
            <p className="text-sm font-bold text-brand-navy">¡Cotización registrada!</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Se abrió WhatsApp para coordinar con un asesor. Si no se abrió,{' '}
              <a
                href={WHATSAPP.link(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-navy underline"
              >
                haz clic aquí
              </a>.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-brand-navy py-3 text-sm font-bold text-white hover:bg-brand-orange transition-colors"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
            <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
              <strong className="text-brand-navy">{product.name}</strong> · {quantity} uds
              {technique ? ` · ${technique.toUpperCase()}` : ''}
            </div>

            {([
              { k: 'customer_name', label: 'Nombre completo', type: 'text', required: true },
              { k: 'email', label: 'Correo', type: 'email', required: true },
              { k: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: true },
              { k: 'company', label: 'Empresa (opcional)', type: 'text', required: false },
            ] as const).map(({ k, label, type, required }) => (
              <div key={k}>
                <label className="text-[11px] font-semibold text-gray-500">{label}</label>
                <input
                  type={type}
                  value={form[k]}
                  required={required}
                  onChange={(e) => set(k, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-navy focus:outline-none"
                />
              </div>
            ))}

            <div>
              <label className="text-[11px] font-semibold text-gray-500">Mensaje (opcional)</label>
              <textarea
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-navy focus:outline-none resize-none"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={13} className="flex-shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white hover:bg-[#1db954] disabled:opacity-60 transition-colors"
            >
              {status === 'loading'
                ? <><Loader2 size={16} className="animate-spin" /> Registrando...</>
                : <><MessageCircle size={16} /> Enviar y coordinar por WhatsApp</>}
            </button>
            <p className="text-center text-[10px] text-gray-400">
              El precio del logo se confirma con el asesor según tamaño y cantidad.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
