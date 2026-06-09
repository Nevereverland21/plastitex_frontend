'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import { PaymentMethod, Order } from '@/types';
import { AVAILABLE_PAYMENT_METHODS } from './config';

import type {
  PaymentGateway,
  PaymentResult,
  PaymentContext as PaymentCtx,
  PaymentMethodConfig,
} from './types';

import { WhatsAppGateway } from './gateways/WhatsAppGateway';
import { IzipayGateway } from './gateways/IzipayGateway';
import { YapeQrGateway } from './gateways/YapeQrGateway';
import { PlinQrGateway } from './gateways/PlinQrGateway';

const GATEWAY_REGISTRY: Record<PaymentMethod, PaymentGateway> = {
  whatsapp: new WhatsAppGateway(
    AVAILABLE_PAYMENT_METHODS.find((m) => m.id === 'whatsapp')!
  ),
  izipay: new IzipayGateway(
    AVAILABLE_PAYMENT_METHODS.find((m) => m.id === 'izipay')!
  ),
  yape: new YapeQrGateway(
    AVAILABLE_PAYMENT_METHODS.find((m) => m.id === 'yape')!
  ),
  plin: new PlinQrGateway(
    AVAILABLE_PAYMENT_METHODS.find((m) => m.id === 'plin')!
  ),
  transferencia: new WhatsAppGateway(
    AVAILABLE_PAYMENT_METHODS.find((m) => m.id === 'transferencia')!
  ),
};

interface PaymentContextValue {
  selectedMethod: PaymentMethod;
  availableMethods: PaymentMethodConfig[];
  setMethod: (method: PaymentMethod) => void;
  processPayment: (
    order: Order,
    context: PaymentCtx
  ) => Promise<PaymentResult>;
  isProcessing: boolean;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('whatsapp');

  const [isProcessing, setIsProcessing] = useState(false);

  const availableMethods = AVAILABLE_PAYMENT_METHODS.filter(
    (m) => m.enabled
  );

  const setMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
  }, []);

  const processPayment = useCallback(
    async (
      order: Order,
      context: PaymentCtx
    ): Promise<PaymentResult> => {
      setIsProcessing(true);

      try {
        const gateway = GATEWAY_REGISTRY[selectedMethod];

        if (!gateway.isEnabled) {
          return {
            success: false,
            error: `El método de pago ${gateway.getConfig().label} no está disponible.`,
          };
        }

        return await gateway.initiate(order, context);
      } catch (err) {
        console.error('Payment processing error:', err);
        return {
          success: false,
          error: 'Ocurrió un error inesperado al procesar el pago. Intenta nuevamente.',
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedMethod]
  );

  return (
    <PaymentContext.Provider
      value={{
        selectedMethod,
        availableMethods,
        setMethod,
        processPayment,
        isProcessing,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePaymentContext() {
  const ctx = useContext(PaymentContext);

  if (!ctx) {
    throw new Error(
      'usePaymentContext must be used within PaymentProvider'
    );
  }

  return ctx;
}