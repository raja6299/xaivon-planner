import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }

// PWA is implemented manually (see public/sw.js + public/manifest.webmanifest)
// to avoid the fragile workbox-build bundler dependency chain in this environment.
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          if (id.includes('@dnd-kit')) return 'dnd'
          if (id.includes('lucide-react') || id.includes('@headlessui')) return 'ui'
          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
