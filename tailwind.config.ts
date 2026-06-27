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
          DEFAULT: '#002D30',
          muted: '#073238',
          faint: '#849F9F', // Muted grayish-mint for secondary text
          accent: '#6EE7B7', // Pastel mint for special highlights
          surface: '#F2FAFA',
          card: '#FFFFFF',
          hover: '#E0F4F2',
          border: 'rgba(0, 45, 48, 0.12)', // Subtle dark border based on DEFAULT
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
