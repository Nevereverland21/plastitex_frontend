import { notFound } from 'next/navigation';
import { getPaymentLinkByTokenServer } from '@/lib/api';
import PaymentLinkClient from './PaymentLinkClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const link = await getPaymentLinkByTokenServer(token);

  if (!link) {
    return { title: 'Link no encontrado | Plastitex' };
  }

  return {
    title: `Pago ${link.link_type} — Pedido #${link.order_id} | Plastitex`,
  };
}

export default async function PaymentLinkPage({ params }: PageProps) {
  const { token } = await params;
  const link = await getPaymentLinkByTokenServer(token);

  if (!link) {
    notFound();
  }

  return <PaymentLinkClient initialLink={link} token={token} />;
}
