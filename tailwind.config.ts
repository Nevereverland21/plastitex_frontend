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
          navy:   '#1B2B5E',
          orange: '#FF6B2B',
          light:  '#F8F9FB',
        },
      },
    },
  },
  plugins: [],
};

export default config;