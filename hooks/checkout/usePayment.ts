'use client';

import { usePaymentContext } from '@/lib/payments/PaymentContext';
import { PaymentMethod } from '@/types';

export function usePayment() {
  const ctx = usePaymentContext();

  return {
    selectedMethod: ctx.selectedMethod,
    availableMethods: ctx.availableMethods,
    setMethod: ctx.setMethod,
    processPayment: ctx.processPayment,
    isProcessing: ctx.isProcessing,
    hasMultipleMethods: ctx.availableMethods.length > 1,
    isMethodAvailable: (method: PaymentMethod) => 
      ctx.availableMethods.some(m => m.id === method),
  };
}