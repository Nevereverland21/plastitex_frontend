'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users, Upload, CheckCircle, AlertCircle,
  ChevronRight, Briefcase, Heart, Zap, X, TrendingUp,
} from 'lucide-react';
import { createJobApplication } from '@/lib/api';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80';

const BENEFICIOS = [
  { icon: Zap,        title: 'Ambiente dinámico',   desc: 'Trabajamos con pasión y creatividad en cada proyecto.' },
  { icon: Heart,      title: 'Equipo comprometido', desc: 'Un equipo multidisciplinario que se apoya mutuamente.' },
  { icon: TrendingUp, title: 'Crecimiento real',     desc: 'Oportunidades de desarrollo dentro de la empresa.' },
  { icon: Briefcase,  title: 'Impacto visible',      desc: 'Tu trabajo se ve en productos que usan cientos de marcas.' },
];

const INITIAL = { full_name: '', email: '', phone: '', position: '', message: '' };
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function TrabajaConNosotrosPage() {
  const [form, setForm] = useState(INITIAL);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setErrorMsg('El CV debe estar en formato PDF.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('El archivo no debe superar 5 MB.'); return; }
    setErrorMsg('');
    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      setErrorMsg('Por favor completa los campos obligatorios.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await createJobApplication(form, cvFile ?? undefined);
      setStatus('success');
      setForm(INITIAL);
      setCvFile(null);
    } catch {
      setStatus('error');
      setErrorMsg('Ocurrió un error al enviar. Intenta nuevamente o escríbenos por WhatsApp.');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════ HERO CON IMAGEN ══════════════ */}
      <section className="relative bg-brand-navy overflow-hidden min-h-[480px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Equipo de trabajo Plastitex"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/85 to-brand-navy/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange
                            text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Users size={14} strokeWidth={2.5} />
              Únete al equipo
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
              Trabaja con<br />
              <span className="text-brand-orange">Plastitex</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Somos un equipo de personas apasionadas por transformar ideas en productos
              de impacto. Si quieres crecer con nosotros, nos encantaría conocerte.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ BENEFICIOS ══════════════ */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-navy text-center mb-10">
            ¿Por qué trabajar con nosotros?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFICIOS.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100
                           shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-brand-orange/10 rounded-xl flex items-center
                                justify-center mx-auto mb-4">
                  <b.icon size={20} className="text-brand-orange" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-brand-navy mb-2 text-sm">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FORMULARIO ══════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {status === 'success' ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-brand-navy mb-3">¡Postulación recibida!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Gracias por tu interés en formar parte del equipo Plastitex.
                Revisaremos tu perfil y nos pondremos en contacto contigo a la brevedad.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setStatus('idle')}
                  className="inline-flex items-center gap-2 bg-brand-orange text-white
                             font-bold px-6 py-3 rounded-xl hover:bg-orange-500 transition-all"
                >
                  Enviar otra postulación
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 border border-gray-200 text-gray-600
                             font-semibold px-6 py-3 rounded-xl hover:border-brand-navy hover:text-brand-navy transition-all"
                >
                  Ir al inicio
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <span className="text-brand-orange text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                  Postulaciones abiertas
                </span>
                <h2 className="text-3xl font-bold text-brand-navy mb-3">Envíanos tu CV</h2>
                <p className="text-gray-500">Completa el formulario y nos pondremos en contacto contigo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Nombre completo *" name="full_name" value={form.full_name}
                    onChange={handleChange} placeholder="Tu nombre completo" required />
                  <FormField label="Correo electrónico *" name="email" type="email"
                    value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Teléfono / WhatsApp *" name="phone" type="tel"
                    value={form.phone} onChange={handleChange} placeholder="+51 999 999 999" required />
                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-2">Puesto de interés</label>
                    <select name="position" value={form.position} onChange={handleChange}
                      className="w-full h-12 px-4 text-sm border border-gray-200 rounded-xl bg-white
                                 text-gray-700 focus:outline-none focus:border-brand-orange
                                 focus:ring-2 focus:ring-brand-orange/15 transition-all">
                      <option value="">Seleccionar área...</option>
                      <option value="Producción">Producción</option>
                      <option value="Diseño gráfico">Diseño gráfico</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Logística">Logística</option>
                      <option value="Administración">Administración</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Preséntate brevemente</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                    placeholder="Cuéntanos sobre tu experiencia, habilidades y por qué quieres unirte a Plastitex..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white
                               text-gray-700 resize-none focus:outline-none focus:border-brand-orange
                               focus:ring-2 focus:ring-brand-orange/15 transition-all" />
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">
                    CV en PDF <span className="text-gray-400 font-normal">(opcional, máx. 5 MB)</span>
                  </label>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFile} className="hidden" />
                  {cvFile ? (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-green-800 font-medium flex-1 truncate">{cvFile.name}</span>
                      <button type="button"
                        onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="text-green-600 hover:text-green-800 transition-colors">
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6
                                 border-2 border-dashed border-gray-200 rounded-xl text-gray-500
                                 hover:border-brand-orange hover:text-brand-orange transition-all group">
                      <Upload size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Subir CV en PDF</span>
                    </button>
                  )}
                </div>

                {(errorMsg || status === 'error') && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <p className="text-sm text-red-700">{errorMsg || 'Error al enviar.'}</p>
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
                    <>Enviar postulación <ChevronRight size={18} strokeWidth={2.5} /></>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  También puedes enviarnos tu CV a{' '}
                  <a href="mailto:info@plastitex.pe" className="text-brand-orange hover:underline font-medium">
                    info@plastitex.pe
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = 'text', required = false }:
  { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; type?: string; required?: boolean; }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-navy mb-2">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full h-12 px-4 text-sm border border-gray-200 rounded-xl bg-white
                   text-gray-700 placeholder:text-gray-400 focus:outline-none
                   focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 transition-all" />
    </div>
  );
}