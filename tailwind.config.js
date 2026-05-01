/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#080a0f',
          900: '#0d1017',
          800: '#131720',
          700: '#1a2030',
          600: '#232b3e',
          500: '#2d3752',
        },
        rose: {
          brand: '#E8175D',
          light: '#FF6B96',
          dark: '#B5104A',
          glow: 'rgba(232, 23, 93, 0.3)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232, 23, 93, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(232, 23, 93, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
