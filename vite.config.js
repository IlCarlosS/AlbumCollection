import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  root: path.join(__dirname, 'src/renderer'), // Dónde vive Vue
  plugins: [vue()],
  base: './',
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})