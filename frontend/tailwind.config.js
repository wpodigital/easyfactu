/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // EasyFactu brand colors based on mockup
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        sidebar: {
          light: '#0c4a6e',
          dark: '#082f49',
        },
        // Card colors from mockup
        clientes: '#2d3e50',
        proveedores: '#3a6a82',
        facturas: '#4a8fa0',
        recibidas: '#d4a574',
        renta: '#c4625a',
        config: '#6d4c51',
        ayuda: '#7a5a5a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
