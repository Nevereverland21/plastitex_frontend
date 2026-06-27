import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Mail, MapPin, Phone, Heart } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { WHATSAPP } from '@/lib/config';

const SOCIAL = {
  facebook:  'https://www.facebook.com/multiindustriasplastitex?locale=es_LA',
  instagram: 'https://www.instagram.com/plastitex/',
  tiktok:    'https://www.tiktok.com/@plastitex_peru',
  linkedin:  'https://www.linkedin.com/company/plastitex',
  youtube:   'https://www.youtube.com/@plastitex',
};

const WHATSAPP_URL = WHATSAPP.baseUrl;

export default function Footer() {
  return (
    <footer className="bg-brand-navy">

      {/* ═════════════════ MAIN ═════════════════ */}
      <div className="container-wide py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ─── Columna 1: Marca ─── */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Image
                src="/logo_sin_frase.webp"
                alt="Plastitex"
                width={180}
                height={55}
                className="h-11 w-auto brightness-0 invert"
                priority={false}
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Transformamos ideas en Merchandising. Fabricantes directos de artículos
              publicitarios con más de 14 años de experiencia en Perú.
            </p>
            {/* Redes sociales */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <SocialLink href={SOCIAL.facebook}  label="Facebook">  <FaFacebookF size={15} />  </SocialLink>
              <SocialLink href={SOCIAL.instagram} label="Instagram"> <FaInstagram size={15} /> </SocialLink>
              <SocialLink href={SOCIAL.tiktok}    label="TikTok">    <FaTiktok size={15} />    </SocialLink>
              <SocialLink href={SOCIAL.linkedin}  label="LinkedIn">  <FaLinkedinIn size={15} /></SocialLink>
              <SocialLink href={SOCIAL.youtube}   label="YouTube">   <FaYoutube size={15} />   </SocialLink>
            </div>
          </div>

          {/* ─── Columna 2: Empresa ─── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5">
              Empresa
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/nosotros">Quiénes somos</FooterLink>
              <FooterLink href="/nosotros#mision">Misión y Visión</FooterLink>
              <FooterLink href="/catalogo">Catálogo de productos</FooterLink>
              <FooterLink href="/trabaja-con-nosotros">Trabaja con nosotros</FooterLink>
              <FooterLink href="/reclamos">Libro de reclamaciones</FooterLink>
              <FooterLink href="/seguimiento">Seguimiento de pedidos</FooterLink>
            </ul>
          </div>

          {/* ─── Columna 3: Productos ─── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5">
              Productos
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/catalogo?category=tomatodos">Tomatodos</FooterLink>
              <FooterLink href="/catalogo?category=mugs">Mugs personalizados</FooterLink>
              <FooterLink href="/catalogo?category=llaveros">Llaveros</FooterLink>
              <FooterLink href="/catalogo?category=usb">USB personalizados</FooterLink>
              <FooterLink href="/catalogo">Ver todo el catálogo</FooterLink>
            </ul>
          </div>

          {/* ─── Columna 4: Contacto ─── */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-5">
              Contáctanos
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-white/70 hover:text-green-400
                             text-sm transition-colors group"
                >
                  <MessageCircle size={15} strokeWidth={2.5} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block">{WHATSAPP.display}</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:ventascorporativas@plastitex.pe"
                  className="flex items-center gap-2.5 text-white/70 hover:text-brand-orange
                             text-sm transition-colors break-all"
                >
                  <Mail size={15} strokeWidth={2.5} className="flex-shrink-0" />
                  ventascorporativas@plastitex.pe
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@plastitex.pe"
                  className="flex items-center gap-2.5 text-white/70 hover:text-brand-orange
                             text-sm transition-colors"
                >
                  <Mail size={15} strokeWidth={2.5} className="flex-shrink-0" />
                  info@plastitex.pe
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-white/70 text-sm">
                <MapPin size={15} strokeWidth={2.5} className="flex-shrink-0" />
                Lima, Perú
              </li>
              <li className="flex items-center gap-2.5 text-white/70 text-sm">
                <Phone size={15} strokeWidth={2.5} className="flex-shrink-0" />
                L–V 9am – 6pm
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ═════════════════ BOTTOM BAR ═════════════════ */}
      <div className="border-t border-white/10">
        <div className="container-wide py-5
                        flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Plastitex — Transformamos ideas en Merchandising.
            Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/reclamos"
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Libro de reclamaciones
            </Link>
            <span className="text-white/20">·</span>
            <p className="text-white/40 text-xs flex items-center gap-1">
              Hecho con <Heart size={11} className="text-brand-orange fill-brand-orange" /> en Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-white/60 hover:text-white text-sm transition-colors
                   hover:translate-x-0.5 inline-block transition-transform duration-200"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-orange border border-white/10
                 hover:border-brand-orange text-white/60 hover:text-white
                 flex items-center justify-center
                 transition-all duration-300 hover:scale-110"
    >
      {children}
    </a>
  );
}