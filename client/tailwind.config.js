/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF7F2',       // Warm Sahel Cream
        surface: '#FFFFFF',      // Crisp Alabaster
        'border-warm': '#E7E2D8', // Warm divider
        forest: {
          DEFAULT: '#0F3D2E',    // Baobab Forest Green (primary CTA)
          hover: '#165440',
        },
        gold: {
          DEFAULT: '#C8963E',    // Burnished Sahel Gold accent
          light: '#DFC07B',
          dark: '#9F742C',
        },
        ink: {
          DEFAULT: '#141816',    // Primary high-contrast text
          subtle: '#262D2A',
        },
        muted: {
          DEFAULT: '#5C6661',    // Secondary text / subtitles
          light: '#85918B',
        },
        verified: {
          DEFAULT: '#10B981',    // Emerald verified settlement
          light: '#D1FAE5',
          dark: '#047857',
        },
        pending: {
          DEFAULT: '#D97706',    // Amber awaiting settlement
          light: '#FEF3C7',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626',    // Crimson rejected / expired
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(20, 24, 22, 0.05), 0 1px 2px -1px rgba(20, 24, 22, 0.05)',
        'warm-md': '0 4px 6px -1px rgba(20, 24, 22, 0.07), 0 2px 4px -2px rgba(20, 24, 22, 0.05)',
        'warm-lg': '0 10px 15px -3px rgba(20, 24, 22, 0.08), 0 4px 6px -4px rgba(20, 24, 22, 0.04)',
      },
    },
  },
  plugins: [],
};

