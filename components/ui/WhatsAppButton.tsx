'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phone = '51999999999'; // ← reemplazar con el número real de Plastitex
  const message = encodeURIComponent(
    '¡Hola! Estoy interesado en sus productos. ¿Me pueden ayudar?'
  );
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
    >
      <MessageCircle size={22} />
      <span className="text-sm font-medium max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        ¿Necesitas ayuda?
      </span>
    </a>
  );
}