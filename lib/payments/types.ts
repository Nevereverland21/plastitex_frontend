import { PaymentMethod } from '@/types';
import { Order } from '@/types';

export interface PaymentResult {
  success: boolean;
  redirectUrl?: string;
  message?: string;
  error?: string;
}

export interface PaymentContext {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
}

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  isDefault?: boolean;
}

export interface PaymentGateway {
  readonly method: PaymentMethod;
  readonly isEnabled: boolean;
  
  initiate(order: Order, context: PaymentContext): Promise<PaymentResult>;
  
  verify?(paymentId: string): Promise<{ status: 'pending' | 'completed' | 'failed' }>;
  
  getConfig(): PaymentMethodConfig;
}