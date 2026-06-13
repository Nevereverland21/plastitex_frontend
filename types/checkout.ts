import { PaymentMethod } from './index';

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

export interface CheckoutFormState {
  step: 1 | 2 | 3;
  deliveryType: 'pickup' | 'delivery';
  address: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  contact: ContactFormData;
  paymentMethod: PaymentMethod;
}

export interface DeliveryFormData {
  deliveryType: 'pickup' | 'delivery';
  address: string;
  /** Referencia / cómo llegar (delivery). */
  reference: string;
  /** Ubicación exacta elegida en el mapa (delivery). */
  latitude: number | null;
  longitude: number | null;
}

export interface CheckoutErrors {
  address?: string;
  contact?: ContactFormErrors;
  payment?: string;
  submit?: string;
}