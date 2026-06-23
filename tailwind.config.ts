import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4920A',
          hover: '#B8790A',
          light: '#FEF3C7',
          text: '#92400E',
        },
        brand: {
          DEFAULT: '#1A1830',
          muted: '#4A4870',
          faint: '#8884A8',
          surface: '#F7F6FF',
          card: '#FFFFFF',
          hover: '#F3F2FC',
          border: 'rgba(139, 92, 246, 0.12)',
        },
        purple: {
          DEFAULT: '#7C3AED',
          light: '#EDE9FE',
          border: 'rgba(139, 92, 246, 0.25)',
        },
        teal: {
          DEFAULT: '#0D9488',
          light: '#CCFBF1',
        },
      },
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
