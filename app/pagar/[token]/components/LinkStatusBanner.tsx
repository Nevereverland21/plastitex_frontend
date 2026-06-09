'use client';

import { Clock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LinkStatusBannerProps {
  isActive: boolean;
  isUsed: boolean;
  expiresAt: string;
}

export default function LinkStatusBanner({ isActive, isUsed, expiresAt }: LinkStatusBannerProps) {
  if (isUsed) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">Pago registrado</p>
            <p className="text-xs text-green-600">Este link ya fue utilizado. Gracias por tu pago.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">Link expirado</p>
            <p className="text-xs text-red-600">
              Este link de pago ya no es válido. Venció el{' '}
              {new Date(expiresAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} className="text-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800">Link de pago activo</p>
          <p className="text-xs text-blue-600">
            Válido por {daysLeft} día{daysLeft !== 1 ? 's' : ''} más. Expira el{' '}
            {new Date(expiresAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>
        <Clock size={16} className="text-blue-400" />
      </div>
    </div>
  );
}
