const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
const display = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY;

if (!phone) {
  throw new Error('Falta NEXT_PUBLIC_WHATSAPP_PHONE en .env.local');
}

export const WHATSAPP = {
  phone,                          // "51959388698"
  display: display ?? phone,      // "959 388 698"
  baseUrl: `https://wa.me/${phone}`,
  /** Construye un link de WhatsApp con mensaje pre-cargado */
  link: (message: string) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
};