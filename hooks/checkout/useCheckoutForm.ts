'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContactFormData, ContactFormErrors, CheckoutFormState, DeliveryFormData } from '@/types/checkout';

const STORAGE_KEY = 'plastitex-checkout-form';

interface UseCheckoutFormReturn {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  delivery: DeliveryFormData;
  setDelivery: (data: DeliveryFormData) => void;
  contact: ContactFormData;
  setContact: (data: ContactFormData) => void;
  contactErrors: ContactFormErrors;
  validateContact: () => boolean;
  clearForm: () => void;
}

export function useCheckoutForm(): UseCheckoutFormReturn {
  const [step, setStepState] = useState<1 | 2 | 3>(1);
  const [delivery, setDeliveryState] = useState<DeliveryFormData>({
    deliveryType: 'pickup',
    address: '',
  });
  const [contact, setContactState] = useState<ContactFormData>({
    customer_name: '',
    email: '',
    phone: '',
  });
  const [contactErrors, setContactErrors] = useState<ContactFormErrors>({});

  // Restaurar desde sessionStorage al montar
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<CheckoutFormState>;
        if (
          typeof parsed.step === 'number' &&
          parsed.step >= 1 &&
          parsed.step <= 3 &&
          parsed.contact &&
          typeof parsed.contact === 'object' &&
          parsed.deliveryType &&
          ['pickup', 'delivery'].includes(parsed.deliveryType)
        ) {
          setStepState(parsed.step as 1 | 2 | 3);
          setDeliveryState({
            deliveryType: parsed.deliveryType as 'pickup' | 'delivery',
            address: typeof parsed.address === 'string' ? parsed.address : '',
          });
          setContactState({
            customer_name: String(parsed.contact.customer_name ?? ''),
            email: String(parsed.contact.email ?? ''),
            phone: String(parsed.contact.phone ?? ''),
          });
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Guardar en sessionStorage cuando cambie cualquier campo
  useEffect(() => {
    const state: CheckoutFormState = {
      step,
      deliveryType: delivery.deliveryType,
      address: delivery.address,
      contact,
      paymentMethod: 'whatsapp',
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [step, delivery, contact]);

  const setStep = useCallback((s: 1 | 2 | 3) => {
    setStepState(s);
  }, []);

  const setDelivery = useCallback((data: DeliveryFormData) => {
    setDeliveryState(data);
  }, []);

  const setContact = useCallback((data: ContactFormData) => {
    setContactState(data);
    // Limpiar errores de campos que se están editando
    setContactErrors(prev => {
      const next: ContactFormErrors = {};
      const keys = Object.keys(prev) as Array<keyof ContactFormErrors>;
      keys.forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          // Limpiar error si el campo ahora tiene valor
        } else {
          next[key] = prev[key];
        }
      });
      return next;
    });
  }, []);

  const validateContact = useCallback((): boolean => {
    const errors: ContactFormErrors = {};
    
    if (!contact.customer_name.trim() || contact.customer_name.trim().length < 2) {
      errors.customer_name = 'El nombre es requerido (mín. 2 caracteres)';
    }
    
    if (!contact.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = 'Correo inválido';
    }
    
    if (!contact.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    } else {
      const normalized = contact.phone.replace(/[\s\+\-]/g, '');
      if (!/^(51)?9\d{8}$/.test(normalized)) {
        errors.phone = 'Teléfono inválido. Formato: 9XX XXX XXX o +51 9XX XXX XXX';
      }
    }

    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  }, [contact]);

  const clearForm = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setStepState(1);
    setDeliveryState({ deliveryType: 'pickup', address: '' });
    setContactState({ customer_name: '', email: '', phone: '' });
    setContactErrors({});
  }, []);

  return {
    step,
    setStep,
    delivery,
    setDelivery,
    contact,
    setContact,
    contactErrors,
    validateContact,
    clearForm,
  };
}