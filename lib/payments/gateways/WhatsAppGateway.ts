import { BaseGateway } from './BaseGateway';
import { PaymentResult, PaymentContext } from '../types';
import { Order } from '@/types';
import { WHATSAPP } from '@/lib/config';

export class WhatsAppGateway extends BaseGateway {
  readonly method = 'whatsapp';
  readonly isEnabled = true;

  async initiate(order: Order, context: PaymentContext): Promise<PaymentResult> {
    const itemsText = context.items.map((i) => {
      const subtotal = i.subtotal.toFixed(2).replace('.', ',');
      return `  • ${i.quantity}x ${i.name} — S/ ${subtotal}`;
    }).join('\n');

    const total = context.total.toFixed(2).replace('.', ',');
    
    const entregaInfo = context.deliveryType === 'pickup'
      ? 'Recojo en tienda'
      : `Delivery a: ${context.address}`;

    const message = 
      `¡Hola Plastitex! 👋 Acabo de confirmar un pedido.\n\n` +
      `📋 *Pedido #${order.id}*\n\n` +
      `👤 *Cliente:* ${context.customerName}\n` +
      `📧 *Email:* ${context.customerEmail}\n` +
      `📱 *Teléfono:* ${context.customerPhone}\n` +
      `📍 *Entrega:* ${entregaInfo}\n\n` +
      `🛍️ *Productos:*\n${itemsText}\n\n` +
      `💰 *Total: S/ ${total}*\n\n` +
      `¿Pueden confirmar y coordinar el pago? ¡Gracias!`;

    const redirectUrl = WHATSAPP.link(message);

    return this.createSuccessResult(
      redirectUrl,
      'Se abrirá WhatsApp para coordinar el pago con un asesor.'
    );
  }
}