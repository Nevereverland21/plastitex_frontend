import { PaymentGateway, PaymentMethodConfig, PaymentResult, PaymentContext } from '../types';
import { PaymentMethod, Order } from '@/types/index';
export abstract class BaseGateway implements PaymentGateway {
  abstract readonly method: PaymentMethod;
  abstract readonly isEnabled: boolean;
  abstract initiate(order: Order, context: PaymentContext): Promise<PaymentResult>;
  
  protected config: PaymentMethodConfig;

  constructor(config: PaymentMethodConfig) {
    this.config = config;
  }

  getConfig(): PaymentMethodConfig {
    return this.config;
  }

  protected createErrorResult(message: string): PaymentResult {
    return {
      success: false,
      error: message,
    };
  }

  protected createSuccessResult(redirectUrl?: string, message?: string): PaymentResult {
    return {
      success: true,
      redirectUrl,
      message,
    };
  }
}