import { PaymentMethodConfig } from './types';

/**
 * Feature flags para métodos de pago.
 * Activar cuando estén listos los integrations del backend.
 */
export const FEATURES = {
  PAYMENT_WHATSAPP: true,
  PAYMENT_IZIPAY: false,
  PAYMENT_YAPE_QR: false,
  PAYMENT_PLIN_QR: false,
  PAYMENT_TRANSFERENCIA: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Métodos de pago disponibles según feature flags.
 */
export const AVAILABLE_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Coordinar pago directamente con un asesor',
    icon: 'MessageCircle',
    enabled: FEATURES.PAYMENT_WHATSAPP,
    isDefault: true,
  },
  {
    id: 'izipay',
    label: 'Tarjeta de crédito/débito',
    description: 'Pago seguro con Izipay',
    icon: 'CreditCard',
    enabled: FEATURES.PAYMENT_IZIPAY,
  },
  {
    id: 'yape',
    label: 'Yape',
    description: 'Escanea el QR con tu app Yape',
    icon: 'QrCode',
    enabled: FEATURES.PAYMENT_YAPE_QR,
  },
  {
    id: 'plin',
    label: 'Plin',
    description: 'Escanea el QR con tu app Plin',
    icon: 'QrCode',
    enabled: FEATURES.PAYMENT_PLIN_QR,
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    description: 'Coordinar por WhatsApp después',
    icon: 'Landmark',
    enabled: FEATURES.PAYMENT_TRANSFERENCIA,
  },
];