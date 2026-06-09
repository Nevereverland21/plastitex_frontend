import { notFound } from 'next/navigation';
import { getOrderByTokenServer } from '@/lib/api';
import OrderTrackingClient from './OrderTrackingClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const order = await getOrderByTokenServer(token);

  if (!order) {
    return { title: 'Pedido no encontrado | Plastitex' };
  }

  return {
    title: `Pedido #${order.id} — ${order.status_display} | Plastitex`,
  };
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { token } = await params;
  const order = await getOrderByTokenServer(token);

  if (!order) {
    notFound();
  }

  return <OrderTrackingClient initialOrder={order} />;
}
