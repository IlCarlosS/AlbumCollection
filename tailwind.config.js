/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{vue,js}",
  ],
  theme: {
    extend: {
      colors: {
        // Tu paleta personalizada
        "dark-bg": "#121212",    // Fondo principal
        "dark-surface": "#1e1e1e", // Tarjetas, filas de tabla, inputs
        "dark-border": "#333333",  // Bordes sutiles
        "accent": "#10b981",       // Color esmeralda para botones/iconos
        "accent-hover": "#059669", 
        "text-main": "#e0e0e0",    // Blanco suave
        "text-dim": "#a0a0a0",     // Gris para detalles menores
      }
    },
  },
  plugins: [],
}