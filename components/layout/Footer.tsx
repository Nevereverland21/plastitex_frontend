import Image from 'next/image';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';

// ─────────────────────────────────────────────────────────────────────────────
// URLs de redes sociales — editar aquí si cambian las cuentas
// ─────────────────────────────────────────────────────────────────────────────
const SOCIAL = {
  facebook:  'https://www.facebook.com/multiindustriasplastitex?locale=es_LA',
  instagram: 'https://www.instagram.com/plastitex/',
  tiktok:    'https://www.tiktok.com/@plastitex_peru',
};

const WHATSAPP_URL = 'https://wa.me/51999999999';
const PHONE_DISPLAY = '+51 999 999 999';
const EMAIL = 'plastitex.panta@gmail.com';

export default function Footer() {
  return (
    <footer className="bg-brand-navy">
      {/* ═════════════════ MAIN ═════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-start">

          {/* ─── Columna izquierda: marca + contacto ─── */}
          <div>
            {/* Logo */}
            <div className="mb-5">
              <Image
                src="/logo-plastitex.png"
                alt="Plastitex"
                width={180}
                height={55}
                className="h-11 w-auto brightness-0 invert"
                priority={false}
              />
            </div>

            <p className="text-white/60 text-sm leading-relaxed max-w-md mb-6">
              Tu tienda de confianza para merchandising y artículos personalizados.
              Atendemos a todo el Perú con los mejores precios y servicio.
            </p>

            {/* Contacto */}
            <ul className="space-y-2.5">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-white/70 hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle size={15} strokeWidth={2.5} />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2.5 text-white/70 hover:text-brand-orange text-sm transition-colors break-all"
                >
                  <Mail size={15} strokeWidth={2.5} />
                  {EMAIL}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-white/70 text-sm">
                <MapPin size={15} strokeWidth={2.5} />
                Perú
              </li>
            </ul>
          </div>

          {/* ─── Columna derecha: síguenos ─── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5">
              Síguenos
            </h4>
            <div className="flex items-center gap-3">
              <SocialLink href={SOCIAL.facebook} label="Facebook">
                <FaFacebookF size={18} />
              </SocialLink>

              <SocialLink href={SOCIAL.instagram} label="Instagram">
                <FaInstagram size={18} />
              </SocialLink>

              <SocialLink href={SOCIAL.tiktok} label="TikTok">
                <FaTiktok size={18} />
              </SocialLink>
            </div>
            <p className="text-white/40 text-xs mt-4 max-w-[250px] leading-relaxed">
              Descubre nuestras novedades, ofertas y productos personalizables.
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════════ BOTTOM BAR ═════════════════ */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Plastitex. Todos los derechos reservados.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1.5">
            Hecho con <span className="text-brand-orange">❤</span> en Perú
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────────────────────────────────────

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full
                 bg-white/5 hover:bg-brand-orange
                 border border-white/10 hover:border-brand-orange
                 text-white/70 hover:text-white
                 flex items-center justify-center
                 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
    >
      {children}
    </a>
  );
}

