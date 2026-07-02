'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  Copy, Check, UploadCloud, Loader2, Clock3, XCircle, CheckCircle2, Landmark,
} from 'lucide-react';
import { submitTransferProof } from '@/lib/api';
import type { PaymentLink } from '@/types';

interface Props {
  link: PaymentLink;
  token: string;
  onSubmitted?: () => void;
}

function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.response?.data?.voucher?.[0] || 'No se pudo enviar el comprobante. Inténtalo de nuevo.';
  }
  return 'No se pudo enviar el comprobante. Inténtalo de nuevo.';
}

/** Fila de dato bancario con botón de copiar. */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="break-all text-sm font-semibold text-gray-800">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

export default function BankTransferPanel({ link, token, onSubmitted }: Props) {
  const bank = link.bank_account;
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [justSent, setJustSent] = useState(false);

  if (!bank) return null; // método desactivado desde el admin

  const status = justSent ? 'pending' : link.transfer_proof.status;

  // ── Estado: comprobante en revisión ──
  if (status === 'pending') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
        <Clock3 className="mx-auto mb-2 text-amber-500" size={28} />
        <p className="text-sm font-bold text-amber-800">Comprobante en revisión</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-700">
          Recibimos tu comprobante y estamos verificando tu pago. Apenas lo confirmemos, tu pedido
          quedará confirmado. Esta página se actualiza sola.
        </p>
      </div>
    );
  }

  // ── Estado: pago aprobado (poco frecuente aquí; el banner ya lo refleja) ──
  if (status === 'approved') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={28} />
        <p className="text-sm font-bold text-emerald-800">Pago confirmado</p>
        <p className="mt-1 text-xs text-emerald-700">Tu pedido fue confirmado. ¡Gracias!</p>
      </div>
    );
  }

  const wasRejected = status === 'rejected';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Sube la imagen o PDF de tu comprobante.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitTransferProof(token, {
        voucher: file,
        operation_number: operation.trim() || undefined,
      });
      setJustSent(true);
      onSubmitted?.();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {wasRejected && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <XCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <div>
            <p className="text-xs font-bold text-rose-800">Tu comprobante anterior fue rechazado</p>
            {link.transfer_proof.admin_notes && (
              <p className="mt-0.5 text-xs text-rose-700">{link.transfer_proof.admin_notes}</p>
            )}
            <p className="mt-0.5 text-xs text-rose-700">Puedes enviar uno nuevo abajo.</p>
          </div>
        </div>
      )}

      {/* Monto exacto */}
      <div className="rounded-xl bg-brand-navy px-4 py-3 text-center text-white">
        <p className="text-[11px] uppercase tracking-wide text-white/70">Transfiere el monto exacto</p>
        <p className="text-2xl font-extrabold">{formatPrice(link.amount_to_pay)}</p>
      </div>

      {/* Datos de la cuenta */}
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Landmark size={15} className="text-brand-turquoise" />
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Cuenta {bank.bank_name}</p>
        </div>
        <CopyRow label="Titular" value={bank.account_holder} />
        <CopyRow label={bank.account_type} value={bank.account_number} />
        {bank.cci && <CopyRow label="CCI" value={bank.cci} />}
        {bank.ruc && <CopyRow label="RUC" value={bank.ruc} />}
      </div>

      {/* Formulario de comprobante */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-xs text-gray-500">
          {bank.instructions || 'Transfiere el monto exacto y sube tu constancia. Verificaremos tu pago y confirmaremos tu pedido.'}
        </p>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">N° de operación (opcional)</label>
          <input
            type="text"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            placeholder="Ej: 000123456"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-turquoise focus:ring-1 focus:ring-brand-turquoise"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Comprobante *</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500 transition-colors hover:border-brand-turquoise hover:bg-brand-light">
            <UploadCloud size={18} className="shrink-0 text-brand-turquoise" />
            <span className="truncate">{file ? file.name : 'Subir imagen o PDF de la constancia'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(''); }}
              className="hidden"
            />
          </label>
        </div>

        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-turquoise px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-teal active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          {submitting ? 'Enviando…' : 'Enviar comprobante'}
        </button>
      </form>
    </div>
  );
}
