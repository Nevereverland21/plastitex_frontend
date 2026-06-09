'use client';

import { useState, useCallback } from 'react';
import { createOrder } from '@/lib/api';
import { CreateOrderPayload, Order } from '@/types';

type OrderStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseCreateOrderReturn {
  mutate: (payload: CreateOrderPayload) => Promise<Order>;
  status: OrderStatus;
  error: string | null;
  data: Order | null;
  reset: () => void;
}

export function useCreateOrder(): UseCreateOrderReturn {
  const [status, setStatus] = useState<OrderStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Order | null>(null);

  const mutate = useCallback(async (payload: CreateOrderPayload): Promise<Order> => {
    setStatus('loading');
    setError(null);
    setData(null);

    try {
      const order = await createOrder(payload);
      setStatus('success');
      setData(order);
      return order;
    } catch (err: any) {
      let message = 'Error al procesar el pedido. Intenta nuevamente.';
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData.detail) {
          message = responseData.detail;
        } else if (responseData.message) {
          message = responseData.message;
        } else if (Array.isArray(responseData)) {
          message = responseData.join(', ');
        } else {
          const fieldErrors = Object.entries(responseData)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : String(errors);
              return `${field}: ${errorText}`;
            })
            .join('; ');
          if (fieldErrors) message = fieldErrors;
        }
      } else if (err.message) {
        message = err.message;
      }

      setStatus('error');
      setError(message);
      throw new Error(message);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    status,
    error,
    data,
    reset,
  };
}