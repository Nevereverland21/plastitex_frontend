const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;

if (!phone) {
  throw new Error('Falta NEXT_PUBLIC_WHATSAPP_PHONE en .env.local');
}
function formatWhatsappDisplay(phone: string) {
  // quitar cualquier cosa que no sea número
  const digits = phone.replace(/\D/g, '');

  // Perú: +51
  if (digits.startsWith('51') && digits.length === 11) {
    const local = digits.slice(2); // quitar 51

    return local.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return digits;
}

export const WHATSAPP = {
  phone,
  display: formatWhatsappDisplay(phone),
  baseUrl: `https://wa.me/${phone}`,

  /** Construye un link de WhatsApp con mensaje pre-cargado */
  link: (message: string) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
};