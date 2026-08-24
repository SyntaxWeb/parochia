import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parochia: {
          navy: '#0F2D54',
          blue: '#1E4A8A',
          gold: '#D4AF37',
          goldLight: '#F5D78E',
          muted: '#94A3B8',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
