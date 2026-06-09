import { BaseGateway } from './BaseGateway';
import { PaymentResult, PaymentContext } from '../types';
import { Order } from '@/types';

export class PlinQrGateway extends BaseGateway {
  readonly method = 'plin';
  readonly isEnabled = false;

  async initiate(_order: Order, _context: PaymentContext): Promise<PaymentResult> {
    return this.createErrorResult(
      'El pago con Plin estará disponible próximamente. ' +
      'Por ahora, coordina el pago por WhatsApp.'
    );
  }
}