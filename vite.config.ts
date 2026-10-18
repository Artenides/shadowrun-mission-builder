import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works unmodified whether it's deployed at the
  // root of a GitHub Pages site or under a project subpath (/repo-name/).
  base: './',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
})
