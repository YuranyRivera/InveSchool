/** @type {import('tailwindcss').Config} */

// Los colores se leen de variables CSS definidas en src/index.css.
// Así el tema vive en un solo lugar y Tailwind sigue soportando opacidades (bg-accent/10).
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: token('line'),
      },
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        elevated: token('elevated'),
        line: token('line'),
        fg: token('fg'),
        muted: token('muted'),
        subtle: token('subtle'),
        navy: token('navy'),
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
        },
        danger: {
          DEFAULT: token('danger'),
          hover: token('danger-hover'),
        },
        success: token('success'),
        warning: token('warning'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 20px 40px -24px rgb(0 0 0 / 0.8)',
        glow: '0 0 0 1px rgb(var(--color-accent) / 0.4), 0 8px 24px -8px rgb(var(--color-accent) / 0.5)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 240ms ease-out both',
      },
    },
  },
  plugins: [],
};
