'use client';

import { User, Mail, Phone, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

export interface ContactFormData {
  customer_name: string;
  email: string;
  phone: string;
}

export interface ContactFormErrors {
  customer_name?: string;
  email?: string;
  phone?: string;
}

interface ContactStepProps {
  form: ContactFormData;
  errors: ContactFormErrors;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const FIELDS = [
  {
    name: 'customer_name' as const,
    label: 'Nombre completo',
    type: 'text',
    placeholder: 'Juan Pérez',
    icon: User,
    hint: 'Tal como aparece en tu DNI',
  },
  {
    name: 'email' as const,
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'juan@email.com',
    icon: Mail,
    hint: 'Te enviaremos la confirmación aquí',
  },
  {
    name: 'phone' as const,
    label: 'Teléfono / WhatsApp',
    type: 'tel',
    placeholder: '999 999 999',
    icon: Phone,
    hint: 'Para coordinar la entrega por WhatsApp',
  },
];

export default function ContactStep({
  form,
  errors,
  onChange,
  onNext,
  onBack,
}: ContactStepProps) {
  const isComplete = form.customer_name.trim() && form.email.trim() && form.phone.trim();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-brand-navy mb-1">¿Con quién coordinamos?</h2>
        <p className="text-sm text-gray-400">Tus datos para confirmar el pedido y hacer seguimiento</p>
      </div>

      <div className="space-y-4">
        {FIELDS.map(({ name, label, type, placeholder, icon: Icon, hint }) => (
          <div key={name}>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              {label}
            </label>
            <div className="relative">
              <Icon
                size={15}
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors
                  ${errors[name] ? 'text-red-400' : 'text-gray-400'}`}
              />
              <input
                type={type}
                value={form[name]}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border transition-all
                           focus:outline-none focus:ring-2
                           ${errors[name]
                             ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400'
                             : 'border-gray-200 bg-gray-50 focus:ring-brand-navy/15 focus:border-brand-navy focus:bg-white'
                           }`}
              />
            </div>
            {errors[name] ? (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} className="flex-shrink-0" /> {errors[name]}
              </p>
            ) : (
              <p className="text-gray-400 text-[11px] mt-1.5">{hint}</p>
            )}
          </div>
        ))}
      </div>

      {/* Privacidad */}
      <p className="text-[11px] text-gray-400 text-center px-4">
        Tus datos solo se usan para procesar tu pedido y no se comparten con terceros.
      </p>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl text-sm font-semibold
                     border-2 border-gray-200 text-gray-500 hover:border-gray-300
                     transition-all duration-200"
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Atrás
        </button>

        <button
          onClick={onNext}
          disabled={!isComplete}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl
                     font-bold text-sm transition-all duration-200
                     bg-brand-navy text-white hover:bg-brand-orange shadow-md shadow-brand-navy/15
                     hover:scale-[1.01] active:scale-[0.99]
                     disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                     disabled:shadow-none disabled:scale-100"
        >
          Revisar pedido
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}