'use client';

import { useState } from 'react';
import { MapPin, Truck, Clock, Phone, ChevronRight, Store } from 'lucide-react';
import type { StoreLocation } from '@/types';
import AddressMapPicker, { type AddressValue } from './AddressMapPicker';

interface DeliveryStepProps {
  deliveryType: 'pickup' | 'delivery';
  address: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  addressError?: string;
  onDeliveryTypeChange: (type: 'pickup' | 'delivery') => void;
  onLocationChange: (value: AddressValue) => void;
  onNext: () => void;
}

import { COMPANY } from '@/lib/config';

const STORE_LOCATION: StoreLocation = {
  id: 1,
  name: 'Sede principal - Lima Centro',
  address: COMPANY.address,
  latitude: '-12.0476809',
  longitude: '-77.0212807',
  schedule: COMPANY.schedule,
  phone: COMPANY.phone,
};

export default function DeliveryStep({
  deliveryType,
  address,
  reference,
  latitude,
  longitude,
  addressError,
  onDeliveryTypeChange,
  onLocationChange,
  onNext,
}: DeliveryStepProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  // Delivery: basta con la dirección escrita O un punto marcado en el mapa.
  const canContinue =
    deliveryType === 'pickup' ||
    address.trim().length > 0 ||
    (latitude != null && longitude != null);

  const mapFallbackSrc = `https://maps.google.com/maps?q=${STORE_LOCATION.latitude},${STORE_LOCATION.longitude}&z=16&output=embed`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-brand-navy mb-1">¿Cómo quieres recibir tu pedido?</h2>
        <p className="text-sm text-gray-400">Elige la opción que más te convenga</p>
      </div>

      {/* Opciones de entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Recojo en tienda */}
        <button
          onClick={() => onDeliveryTypeChange('pickup')}
          className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200
            ${deliveryType === 'pickup'
              ? 'border-brand-navy bg-brand-navy/3 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              ${deliveryType === 'pickup' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Store size={16} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${deliveryType === 'pickup' ? 'text-brand-navy' : 'text-gray-700'}`}>
                Recojo en tienda
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Sin costo de envío</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full self-start">
              GRATIS
            </span>
          </div>

          {/* Radio visual */}
          <div className="absolute top-4 right-4">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${deliveryType === 'pickup' ? 'border-brand-navy' : 'border-gray-300'}`}>
              {deliveryType === 'pickup' && (
                <div className="w-2 h-2 rounded-full bg-brand-navy" />
              )}
            </div>
          </div>
        </button>

        {/* Delivery */}
        <button
          onClick={() => onDeliveryTypeChange('delivery')}
          className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200
            ${deliveryType === 'delivery'
              ? 'border-brand-navy bg-brand-navy/3 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              ${deliveryType === 'delivery' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Truck size={16} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${deliveryType === 'delivery' ? 'text-brand-navy' : 'text-gray-700'}`}>
                Delivery
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Costo a coordinar</p>
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${deliveryType === 'delivery' ? 'border-brand-navy' : 'border-gray-300'}`}>
              {deliveryType === 'delivery' && (
                <div className="w-2 h-2 rounded-full bg-brand-navy" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Panel de recojo */}
      {deliveryType === 'pickup' && (
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          {/* Info de la sede */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-brand-orange" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">{STORE_LOCATION.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{STORE_LOCATION.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Clock size={12} className="text-brand-navy flex-shrink-0" />
                <span className="text-[11px] text-gray-600">{STORE_LOCATION.schedule}</span>
              </div>
              <a
                href={`tel:${STORE_LOCATION.phone}`}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <Phone size={12} className="text-brand-navy flex-shrink-0" />
                <span className="text-[11px] text-gray-600">{STORE_LOCATION.phone}</span>
              </a>
            </div>
          </div>

          {/* Mapa embed */}
          <div className="relative h-44 bg-gray-100">
            <iframe
              src={mapFallbackSrc}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              title="Ubicación sede Plastitex"
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <MapPin size={24} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>

          {/* Link externo */}
          <a
            href={`https://maps.google.com/?q=${STORE_LOCATION.latitude},${STORE_LOCATION.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-3 text-xs font-semibold
                       text-brand-navy hover:text-brand-orange transition-colors border-t border-gray-100"
          >
            <MapPin size={12} />
            Ver en Google Maps
            <ChevronRight size={12} />
          </a>
        </div>
      )}

      {/* Dirección con mapa para delivery */}
      {deliveryType === 'delivery' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 font-medium">
              Marca tu ubicación en el mapa. El costo de delivery se coordinará contigo
              por WhatsApp según tu zona.
            </p>
          </div>
          <AddressMapPicker
            value={{ address, reference, latitude, longitude }}
            onChange={onLocationChange}
          />
          {addressError && (
            <p className="text-red-500 text-xs">{addressError}</p>
          )}
        </div>
      )}

      {/* Botón continuar */}
      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                   font-bold text-sm transition-all duration-200
                   bg-brand-navy text-white hover:bg-brand-orange shadow-md shadow-brand-navy/15
                   hover:scale-[1.01] active:scale-[0.99]
                   disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                   disabled:shadow-none disabled:scale-100"
      >
        Continuar
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}