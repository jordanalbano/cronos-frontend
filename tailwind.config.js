/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary-color)',
        'text-color': 'var(--text-color)',
        'text-color-secondary': 'var(--text-color-secondary)',
        'surface-ground': 'var(--surface-ground)',
        'surface-card': 'var(--surface-card)',
        'surface-border': 'var(--surface-border)',
      },
      backgroundColor: {
        'glass': 'var(--glass-bg)',
      },
      backdropBlur: {
        'glass': 'var(--glass-blur)',
      },
      borderRadius: {
        'glass': '1rem',
      }
    },
  },
  plugins: [],
}
