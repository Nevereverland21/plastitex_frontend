import { BaseGateway } from './BaseGateway';
import { PaymentResult, PaymentContext } from '../types';
import { Order } from '@/types';

export class IzipayGateway extends BaseGateway {
  readonly method = 'izipay';
  readonly isEnabled = false;

  async initiate(_order: Order, _context: PaymentContext): Promise<PaymentResult> {
    return this.createErrorResult(
      'El pago con tarjeta estará disponible próximamente. ' +
      'Por ahora, coordina el pago por WhatsApp.'
    );
  }
}