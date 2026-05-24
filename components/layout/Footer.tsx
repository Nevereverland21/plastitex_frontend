import Link from 'next/link';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-navy border-t border-white/10">

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold text-white">Plasti</span>
              <span className="text-2xl font-bold text-brand-orange">tex</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Tu tienda de confianza para productos de calidad. Atendemos a todo el Perú con los mejores precios y servicio.
            </p>

            {/* Contacto */}
            <div className="mt-6 space-y-3">
              <a
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/55 hover:text-green-400 text-sm transition-colors duration-200"
              >
                <MessageCircle size={16} />
                +51 999 999 999
              </a>
              <a
                href="mailto:plastitex.panta@gmail.com"
                className="flex items-center gap-3 text-white/55 hover:text-brand-orange text-sm transition-colors duration-200"
              >
                <Mail size={16} />
                plastitex.panta@gmail.com
              </a>
              <div className="flex items-center gap-3 text-white/55 text-sm">
                <MapPin size={16} />
                Perú
              </div>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">
              Tienda
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Catálogo', href: '/catalogo' },
                { label: 'Categorías', href: '/#categorias' },
                { label: 'Destacados', href: '/#destacados' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-brand-orange text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compras */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">
              Compras
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Cómo comprar', href: '#' },
                { label: 'Métodos de pago', href: '#' },
                { label: 'Envíos', href: '#' },
                { label: 'Devoluciones', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-brand-orange text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © 2026 Plastitex. Todos los derechos reservados.
          </p>
          <p className="text-white/40 text-xs">
            Hecho con ❤️ en Perú
          </p>
        </div>
      </div>

    </footer>
  );
}