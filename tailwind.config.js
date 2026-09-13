/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#231F3D',
        inkSoft: '#5B5478',
        paper: '#FFF6E9',
        card: '#FFFFFF',
        mango: '#FFB020',
        coral: '#FF5D5D',
        leaf: '#2FBF71',
        sky: '#3D9BE9',
        grape: '#8B5CF6',
        sand: '#F2E4CE',
      },
      fontFamily: {
        sans: ['Fredoka', 'ui-rounded', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        blob: '28px',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-7px)' },
          '75%': { transform: 'translateX(7px)' },
        },
        fall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(105vh) rotate(540deg)', opacity: '0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop 260ms cubic-bezier(.34,1.56,.64,1)',
        wiggle: 'wiggle 500ms ease-in-out 2',
        shake: 'shake 320ms ease-in-out',
        fall: 'fall 2.4s linear forwards',
        pulseRing: 'pulseRing 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
