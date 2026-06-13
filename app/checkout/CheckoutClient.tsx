'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { CartItem, StoreLocation } from '@/types';
import type { PaymentMethod } from '@/types';
import { getStoreLocations } from '@/lib/api';
import { useCartStore, getItemUnitPrice } from '@/store/cartStore';
import { useCheckoutForm } from '@/hooks/checkout/useCheckoutForm';
import { useCreateOrder } from '@/hooks/checkout/useCreateOrder';
import { usePayment } from '@/hooks/checkout/usePayment';
import { PaymentProvider } from '@/lib/payments/PaymentContext';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import OrderSummary from '@/components/checkout/OrderSummary';
import DeliveryStep from '@/components/checkout/DeliveryStep';
import ContactStep from '@/components/checkout/ContactStep';
import ConfirmStep from '@/components/checkout/ConfirmStep';
import SuccessScreen from '@/components/checkout/SuccessScreen';

const BUY_NOW_KEY = 'plastitex-buy-now';
const SUCCESS_KEY = 'plastitex-checkout-success';
// El estado de éxito persistido vence a los 15 min para que un pedido viejo
// no "secuestre" un checkout futuro mostrando la pantalla de éxito anterior.
const SUCCESS_TTL_MS = 15 * 60 * 1000;

interface SuccessPersistState {
  publicToken: string;
  waUrl: string;
  paymentUrl: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  savedAt: number;
}

interface CheckoutClientProps {
  buyNowItem?: CartItem;
}

function CheckoutContent({ buyNowItem }: CheckoutClientProps) {
  const router = useRouter();
  const { items: cartItems, clearCart, addItem } = useCartStore();
  const { mutate: createOrder, status: orderStatus, error: orderError } = useCreateOrder();
  const { processPayment, selectedMethod, setMethod } = usePayment();

  const [savedBuyNow, setSavedBuyNow] = useState<CartItem | undefined>(undefined);
  const [successState, setSuccessState] = useState<SuccessPersistState | null>(null);

  const effectiveBuyNow = buyNowItem ?? savedBuyNow;
  const isBuyNow = !!effectiveBuyNow;
  const items = useMemo<CartItem[]>(
    () => (isBuyNow ? [effectiveBuyNow!] : cartItems),
    [isBuyNow, effectiveBuyNow, cartItems]
  );

  const {
    step,
    setStep,
    delivery,
    setDelivery,
    contact,
    setContact,
    contactErrors,
    validateContact,
    clearForm,
  } = useCheckoutForm();

  const [success, setSuccess] = useState(false);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [storeLocation, setStoreLocation] = useState<StoreLocation | null>(null);
  const [mounted, setMounted] = useState(false);

  // Restaurar buyNow y estado de éxito desde sessionStorage
  useEffect(() => {
    const savedBuyNowRaw = sessionStorage.getItem(BUY_NOW_KEY);
    if (savedBuyNowRaw) {
      try {
        setSavedBuyNow(JSON.parse(savedBuyNowRaw));
      } catch {
        sessionStorage.removeItem(BUY_NOW_KEY);
      }
    }

    const savedSuccessRaw = sessionStorage.getItem(SUCCESS_KEY);
    if (savedSuccessRaw) {
      try {
        const parsed = JSON.parse(savedSuccessRaw);
        const isFresh =
          parsed &&
          typeof parsed.savedAt === 'number' &&
          Date.now() - parsed.savedAt < SUCCESS_TTL_MS;
        // Si el usuario vuelve al checkout con ítems en el carrito, es un pedido
        // nuevo: no restauramos la pantalla de éxito anterior (la habríamos
        // mostrado en vez del formulario de compra).
        const startingNewOrder = useCartStore.getState().items.length > 0;
        if (isFresh && !startingNewOrder && typeof parsed.publicToken === 'string' && parsed.publicToken) {
          setSuccessState(parsed);
        } else {
          sessionStorage.removeItem(SUCCESS_KEY);
        }
      } catch {
        sessionStorage.removeItem(SUCCESS_KEY);
      }
    }

    setMounted(true);
  }, []);

  // Persistir buyNowItem cuando llega por props
  useEffect(() => {
    if (buyNowItem) {
      // Una nueva intención de "Comprar ahora" descarta cualquier pantalla de
      // éxito previa. Sin esto, al hacer "Comprar ahora" otra vez en la misma
      // pestaña (sin recargar), el estado de éxito del pedido anterior seguía
      // vivo en memoria y tapaba el formulario de compra del producto nuevo.
      sessionStorage.removeItem(SUCCESS_KEY);
      setSuccessState(null);
      setSuccess(false);
      setPublicToken(null);

      sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(buyNowItem));
      setSavedBuyNow(buyNowItem);
    }
  }, [buyNowItem]);

  // Sede de recojo desde el backend (StoreLocation), para no hardcodear la
  // dirección en el resumen del pedido. Falla en silencio: el ConfirmStep cae
  // a un texto por defecto si no hay sede.
  useEffect(() => {
    getStoreLocations()
      .then((locs) => setStoreLocation(locs[0] ?? null))
      .catch(() => {});
  }, []);

  // Persistir estado de éxito
  useEffect(() => {
    if (success && publicToken) {
      const state: SuccessPersistState = {
        publicToken,
        waUrl,
        paymentUrl,
        customerName: contact.customer_name,
        paymentMethod: selectedMethod,
        savedAt: Date.now(),
      };
      sessionStorage.setItem(SUCCESS_KEY, JSON.stringify(state));
      setSuccessState(state);
    }
  }, [success, publicToken, waUrl, paymentUrl, contact.customer_name, selectedMethod]);

  const handleDeliveryNext = () => {
    const hasLocation =
      delivery.address.trim().length > 0 ||
      (delivery.latitude != null && delivery.longitude != null);
    if (delivery.deliveryType === 'delivery' && !hasLocation) {
      return;
    }
    setStep(2);
  };

  const handleContactNext = () => {
    if (validateContact()) {
      setStep(3);
    }
  };

  const handleContactChange = (field: keyof typeof contact, value: string) => {
    setContact({ ...contact, [field]: value });
  };

  const handleConfirm = useCallback(async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    const orderItems = items.map((i) => ({
      product: i.product.id,
      quantity: i.quantity,
      unit_price: i.unit_price ?? i.unit_price_override ?? String(i.product.base_price),
      customization_notes: i.customization_notes || undefined,
    }));

    const isDelivery = delivery.deliveryType === 'delivery';
    const payload = {
      customer_name: contact.customer_name,
      email: contact.email,
      phone: contact.phone,
      address: isDelivery ? delivery.address : undefined,
      address_reference: isDelivery ? (delivery.reference || undefined) : undefined,
      delivery_latitude: isDelivery ? delivery.latitude : undefined,
      delivery_longitude: isDelivery ? delivery.longitude : undefined,
      order_type: 'retail' as const,
      delivery_type: delivery.deliveryType,
      payment_method: selectedMethod,
      items: orderItems,
    };

    try {
      const order = await createOrder(payload);

      if (!order.public_token) {
        console.error('El servidor no devolvió public_token. ¿Reiniciaste el backend?');
        throw new Error('No se pudo generar el link de seguimiento. Intenta nuevamente.');
      }

      const paymentContext = {
        customerName: contact.customer_name,
        customerEmail: contact.email,
        customerPhone: contact.phone,
        items: items.map((i) => {
          const price = getItemUnitPrice(i);
          return {
            name: i.product.name,
            quantity: i.quantity,
            unitPrice: price,
            subtotal: price * i.quantity,
          };
        }),
        total: items.reduce((acc, i) => acc + getItemUnitPrice(i) * i.quantity, 0),
        deliveryType: delivery.deliveryType,
        address: delivery.address,
      };

      const result = await processPayment(order, paymentContext);

      if (result.success && result.redirectUrl) {
        setWaUrl(result.redirectUrl);
      }

      setPaymentUrl(order.payment_url || '');
      setPublicToken(order.public_token);

      // Guardar estado de éxito ANTES de limpiar formularios
      const successData: SuccessPersistState = {
        publicToken: order.public_token,
        waUrl: result.redirectUrl || '',
        paymentUrl: order.payment_url || '',
        customerName: contact.customer_name,
        paymentMethod: selectedMethod,
        savedAt: Date.now(),
      };
      sessionStorage.setItem(SUCCESS_KEY, JSON.stringify(successData));
      setSuccessState(successData);

      if (!isBuyNow) clearCart();
      clearForm();
      sessionStorage.removeItem(BUY_NOW_KEY);
      setSavedBuyNow(undefined);

      setSuccess(true);
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }, [contact, delivery, items, isBuyNow, clearCart, clearForm, createOrder, processPayment, selectedMethod]);

  const handleBackFromStep1 = () => {
    if (isBuyNow && effectiveBuyNow) {
      addItem(effectiveBuyNow.product, {
        quantity: effectiveBuyNow.quantity,
        unit_price: effectiveBuyNow.unit_price,
        unit_price_override: effectiveBuyNow.unit_price_override,
        customization_notes: effectiveBuyNow.customization_notes,
      });
    }
    sessionStorage.removeItem(BUY_NOW_KEY);
    setSavedBuyNow(undefined);
    router.back();
  };

  const dismissSuccess = useCallback(() => {
    // Solo limpiamos el storage. A propósito NO reseteamos el estado de React
    // (success/successState/publicToken): si lo hiciéramos, el componente se
    // re-renderizaría al branch "carrito vacío" durante la fracción de segundo
    // que tarda el <Link> en navegar, que es exactamente el "rebote al checkout"
    // que reportaba el cliente. La pantalla de éxito queda montada hasta que la
    // navegación a /catalogo (o /pedidos/...) completa y el componente se desmonta.
    sessionStorage.removeItem(SUCCESS_KEY);
    sessionStorage.removeItem(BUY_NOW_KEY);
  }, []);

  const isSuccessVisible = (success || !!successState) && (publicToken ?? successState?.publicToken);

  if (mounted && items.length === 0 && !isSuccessVisible) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag size={28} className="text-gray-300" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Tu carrito está vacío</h2>
            <p className="text-sm text-gray-400 mt-1">Agrega productos antes de continuar</p>
          </div>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-orange transition-colors">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccessVisible) {
    return (
      <SuccessScreen
        publicToken={publicToken ?? successState!.publicToken}
        waUrl={waUrl || successState?.waUrl || ''}
        paymentUrl={paymentUrl || successState?.paymentUrl || ''}
        customerName={successState?.customerName ?? contact.customer_name}
        paymentMethod={successState?.paymentMethod ?? selectedMethod}
        deliveryType={delivery.deliveryType}
        onDismiss={dismissSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        <button
          onClick={step === 1 ? handleBackFromStep1 : () => setStep(step === 2 ? 1 : 2)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-navy transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          {step === 1 ? 'Volver' : 'Paso anterior'}
        </button>

        <CheckoutStepper currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
            {step === 1 && (
              <DeliveryStep
                deliveryType={delivery.deliveryType}
                address={delivery.address}
                reference={delivery.reference}
                latitude={delivery.latitude}
                longitude={delivery.longitude}
                addressError={delivery.deliveryType === 'delivery' && !delivery.address.trim() && delivery.latitude == null ? 'Marca tu ubicación en el mapa o escribe tu dirección' : undefined}
                onDeliveryTypeChange={(type) => setDelivery({ ...delivery, deliveryType: type })}
                onLocationChange={(v) => setDelivery({ ...delivery, address: v.address, reference: v.reference, latitude: v.latitude, longitude: v.longitude })}
                onNext={handleDeliveryNext}
              />
            )}
            {step === 2 && (
              <ContactStep
                form={contact}
                errors={contactErrors}
                onChange={handleContactChange}
                onNext={handleContactNext}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <ConfirmStep
                items={items}
                contact={contact}
                deliveryType={delivery.deliveryType}
                address={delivery.address}
                loading={orderStatus === 'loading'}
                error={orderError}
                paymentMethod={selectedMethod}
                storeLocation={storeLocation}
                onPaymentMethodChange={(method: PaymentMethod) => setMethod(method)}
                onConfirm={handleConfirm}
                onBack={() => setStep(2)}
              />
            )}
          </div>

          <div className="lg:sticky lg:top-28">
            <OrderSummary items={items} isBuyNow={isBuyNow} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient({ buyNowItem }: CheckoutClientProps) {
  return (
    <PaymentProvider>
      <CheckoutContent buyNowItem={buyNowItem} />
    </PaymentProvider>
  );
}