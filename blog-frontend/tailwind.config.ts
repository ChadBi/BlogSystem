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
        ink: 'var(--ink)',
        shell: '#dff6ff',
        accent: {
          DEFAULT: '#17648c',
          dark: '#8edbfa'
        },
        mint: '#B5EAD7',
        // 暗色模式语义令牌
        surface: {
          DEFAULT: '#122638',
          elevated: '#1a3449'
        }
      },
      boxShadow: {
        pixel: '4px 4px 0 var(--pixel-edge)',
        'pixel-sm': '2px 2px 0 var(--pixel-edge)',
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
