import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set the base path to the repository name for GitHub Pages deployment
  base: '/LeCaseDiCittaFutura1/',
})
