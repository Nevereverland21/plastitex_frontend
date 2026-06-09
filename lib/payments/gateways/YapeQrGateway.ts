import { BaseGateway } from './BaseGateway';
import { PaymentResult, PaymentContext } from '../types';
import { Order } from '@/types';

export class YapeQrGateway extends BaseGateway {
  readonly method = 'yape';
  readonly isEnabled = false;

  async initiate(_order: Order, _context: PaymentContext): Promise<PaymentResult> {
    return this.createErrorResult(
      'El pago con Yape estará disponible próximamente. ' +
      'Por ahora, coordina el pago por WhatsApp.'
    );
  }
}