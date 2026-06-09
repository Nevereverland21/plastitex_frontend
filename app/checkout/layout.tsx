import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Plastitex',
  description: 'Finaliza tu compra de artículos publicitarios y merchandising personalizado',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}