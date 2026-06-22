import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        brand: {
          navy:      '#1B2B5E',
          // ── Paleta corporativa Plastitex (turquesa del logo) ──────────────
          // `orange` se mantiene como NOMBRE por compatibilidad con el código
          // existente (≈196 usos), pero su VALOR ahora es el turquesa de marca.
          // Acento principal de toda la web.
          orange:    '#16A6C9',
          turquoise: '#16A6C9',  // = acento principal (alias semántico)
          teal:      '#0E7C97',  // turquesa profundo: hovers y degradados
          aqua:      '#2BC0DE',  // turquesa brillante: highlights
          light:     '#F8F9FB',
          sky:       '#2BA9E0',
        },
        // Sobrescribimos la escala `orange` por defecto de Tailwind por tonos
        // turquesa, para que los usos sueltos (text-orange-600, hover:bg-orange-500…)
        // queden alineados a la marca sin tocar 44 archivos uno por uno.
        orange: {
          50:  '#ECFBFF',
          100: '#D0F3FB',
          200: '#A6E8F5',
          300: '#6FD6EC',
          400: '#30BFDC',
          500: '#16A6C9',
          600: '#0E879F',
          700: '#106C80',
          800: '#155869',
          900: '#16495A',
          950: '#082F3C',
        },
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // NUEVO: marquee para ClientLogos
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in':    'fade-in 0.4s ease-out both',
        shimmer:      'shimmer 1.5s infinite',
        marquee:      'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;