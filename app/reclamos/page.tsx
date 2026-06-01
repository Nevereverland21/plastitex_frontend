'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle, CheckCircle, ChevronRight,
  FileText, Shield, MessageSquare, HelpCircle, AlertTriangle,
} from 'lucide-react';
import { createComplaint } from '@/lib/api';
import type { ComplaintType } from '@/types';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80';

const TIPOS = [
  { value: 'reclamo',  label: 'Reclamo',  icon: AlertTriangle,  desc: 'Disconformidad con un producto o servicio recibido.' },
  { value: 'queja',    label: 'Queja',    icon: MessageSquare,  desc: 'Malestar con la atención o el proceso de compra.' },
  { value: 'consulta', label: 'Consulta', icon: HelpCircle,     desc: 'Solicitud de información sobre productos o servicios.' },
];

const INITIAL = {
  complaint_type: 'reclamo' as ComplaintType,
  customer_name: '',
  email: '',
  phone: '',
  order_reference: '',
  description: '',
};

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ReclamosPage() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.email || !form.description) {
      setErrorMsg('Por favor completa los campos obligatorios.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await createComplaint(form);
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
      setErrorMsg('Ocurrió un error al enviar. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════ HERO CON IMAGEN ══════════════ */}
      <section className="relative bg-brand-navy overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Atención al cliente Plastitex"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80
                            text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <FileText size={14} strokeWidth={2.5} />
              Libro de reclamaciones
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Libro de<br />
              <span className="text-brand-orange">Reclamaciones</span>
            </h1>
            <p className="text-white/70 leading-relaxed text-lg">
              Tu opinión es importante para nosotros. Registra aquí tu reclamo,
              queja o consulta y nos comprometemos a atenderte a la brevedad.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ AVISO LEGAL ══════════════ */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-sm text-blue-800">
              <span className="font-semibold">
                Conforme al Código de Protección y Defensa del Consumidor (Ley 29571),
              </span>{' '}
              Plastitex pone a tu disposición este libro de reclamaciones virtual.
              Tu solicitud será atendida en un plazo máximo de{' '}
              <strong>15 días hábiles</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ FORMULARIO ══════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {status === 'success' ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-brand-navy mb-3">¡Registro recibido!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Hemos recibido tu {form.complaint_type}. Nuestro equipo lo revisará
                y te contactaremos en un plazo de 15 días hábiles.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => setStatus('idle')}
                  className="inline-flex items-center gap-2 bg-brand-orange text-white
                             font-bold px-6 py-3 rounded-xl hover:bg-orange-500 transition-all">
                  Nuevo registro
                </button>
                <Link href="/"
                  className="inline-flex items-center gap-2 border border-gray-200 text-gray-600
                             font-semibold px-6 py-3 rounded-xl hover:border-brand-navy hover:text-brand-navy transition-all">
                  Ir al inicio
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-brand-navy mb-2">Registra tu solicitud</h2>
                <p className="text-gray-500 text-sm">Todos los campos marcados con * son obligatorios.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-3">Tipo de solicitud *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TIPOS.map((tipo) => {
                      const isActive = form.complaint_type === tipo.value;
                      return (
                        <button key={tipo.value} type="button"
                          onClick={() => setForm((p) => ({ ...p, complaint_type: tipo.value as ComplaintType }))}
                          className={`p-4 rounded-xl border-2 text-left transition-all
                                     ${isActive ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <tipo.icon size={15} className={isActive ? 'text-brand-orange' : 'text-gray-400'} strokeWidth={2.5} />
                            <p className={`text-sm font-bold ${isActive ? 'text-brand-orange' : 'text-brand-navy'}`}>
                              {tipo.label}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 leading-snug">{tipo.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Nombre completo *', name: 'customer_name', placeholder: 'Tu nombre', required: true },
                    { label: 'Correo electrónico *', name: 'email', placeholder: 'tu@email.com', type: 'email', required: true },
                    { label: 'Teléfono', name: 'phone', placeholder: '+51 999 999 999' },
                    { label: 'N° de pedido (opcional)', name: 'order_reference', placeholder: 'Ej: #1234' },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-sm font-semibold text-brand-navy mb-2">{f.label}</label>
                      <input type={f.type || 'text'} name={f.name}
                        value={form[f.name as keyof typeof form]} onChange={handleChange}
                        placeholder={f.placeholder} required={f.required}
                        className="w-full h-12 px-4 text-sm border border-gray-200 rounded-xl bg-white
                                   text-gray-700 placeholder:text-gray-400 focus:outline-none
                                   focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 transition-all" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Descripción detallada *</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    required rows={5}
                    placeholder="Describe detalladamente tu reclamo, queja o consulta..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white
                               text-gray-700 resize-none focus:outline-none focus:border-brand-orange
                               focus:ring-2 focus:ring-brand-orange/15 transition-all" />
                </div>

                {(errorMsg || status === 'error') && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <p className="text-sm text-red-700">{errorMsg}</p>
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl
                             font-bold text-base transition-all duration-300
                             ${status === 'loading'
                               ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                               : 'bg-brand-navy hover:bg-brand-orange text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                             }`}>
                  {status === 'loading' ? (
                    <><div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Enviando...</>
                  ) : (
                    <>Registrar {form.complaint_type} <ChevronRight size={18} strokeWidth={2.5} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}