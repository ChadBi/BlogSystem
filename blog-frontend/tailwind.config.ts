import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
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
        // accent 取代旧 coral 命名（值不变 #8C6CFF，实为紫色，是品牌有意为之）
        accent: {
          DEFAULT: '#8C6CFF',
          dark: '#A78BFA'
        },
        mint: '#B5EAD7',
        // 暗色模式语义令牌
        surface: {
          DEFAULT: '#111827',
          elevated: '#1f2937'
        }
      },
      boxShadow: {
        pixel: '6px 6px 0 #132447',
        'pixel-sm': '3px 3px 0 #132447',
        'pixel-glow': '0 0 0 2px #B5EAD7, 0 0 16px rgba(181, 234, 215, .4)',
        soft: '0 16px 48px rgba(12, 59, 118, 0.12)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      backgroundImage: {
        'ocean-grid': 'linear-gradient(rgba(12, 83, 158, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(12, 83, 158, .08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
