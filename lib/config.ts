const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;

if (!phone) {
  throw new Error('Falta NEXT_PUBLIC_WHATSAPP_PHONE en .env.local');
}
function formatWhatsappDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('51') && digits.length === 11) {
    const local = digits.slice(2);
    return local.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return digits;
}

export const WHATSAPP = {
  phone,
  display: formatWhatsappDisplay(phone),
  baseUrl: `https://wa.me/${phone}`,
  link: (message: string) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
};

// Número local (sin código de país) derivado del número de WhatsApp
const localPhone = phone.replace(/^51/, '');

export const COMPANY = {
  name: 'Plastitex',
  phone: localPhone,
  phoneDisplay: WHATSAPP.display,
  phoneSecondary: '994 157 627',
  email: 'ventascorporativas@plastitex.pe',
  address: 'Jr. Áncash 919, Lima 15001',
  schedule: 'Lunes a Viernes 8am – 6pm',
};