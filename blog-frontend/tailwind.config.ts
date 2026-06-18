import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0fbff',
          100: '#daf4ff',
          200: '#b6ebff',
          300: '#78dcff',
          400: '#32c4f5',
          500: '#08a7db',
          600: '#0087ba',
          700: '#076c96',
          800: '#0b587a',
          900: '#0f4965'
        },
        ink: '#101828',
        shell: '#FFF8E9',
        coral: '#8C6CFF',
        mint: '#B5EAD7'
      },
      boxShadow: {
        pixel: '6px 6px 0 #132447',
        soft: '0 16px 48px rgba(12, 59, 118, 0.12)'
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'ocean-grid': 'linear-gradient(rgba(12, 83, 158, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(12, 83, 158, .08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
