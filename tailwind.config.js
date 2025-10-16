/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary-color)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'secondary-color': 'var(--secondary-color)',
        'accent-color': 'var(--accent-color)',
        'success-color': 'var(--success-color)',
        'danger-color': 'var(--danger-color)',
        'warning-color': 'var(--warning-color)',
        'info-color': 'var(--info-color)',
        'text-color': 'var(--text-color)',
        'text-color-secondary': 'var(--text-color-secondary)',
        'text-color-muted': 'var(--text-color-muted)',
        'surface-ground': 'var(--surface-ground)',
        'surface-card': 'var(--surface-card)',
        'surface-border': 'var(--surface-border)',
        'surface-hover': 'var(--surface-hover)',
      },
      backgroundColor: {
        'glass': 'var(--glass-bg)',
      },
      backdropBlur: {
        'glass': 'var(--glass-blur)',
      },
      borderRadius: {
        'glass': '1rem',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
      }
    },
  },
  plugins: [],
}
