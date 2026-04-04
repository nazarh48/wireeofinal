import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          const normalized = id.replace(/\\/g, '/')
          const pkgMatch = normalized.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
          const pkgName = pkgMatch ? pkgMatch[1] : null

          if (pkgName === 'react' || pkgName === 'react-dom' || pkgName === 'scheduler') {
            return 'react-vendor'
          }

          if (
            pkgName?.startsWith('@mui/') ||
            pkgName?.startsWith('@emotion/') ||
            pkgName === '@popperjs/core'
          ) {
            return 'mui-vendor'
          }

          if (pkgName === 'konva' || pkgName === 'react-konva') {
            return 'konva-vendor'
          }

          if (pkgName === 'quill' || pkgName === 'react-quill') {
            return 'quill-vendor'
          }

          if (pkgName === 'xlsx') {
            return 'xlsx-vendor'
          }

          if (pkgName === 'jspdf') {
            return 'jspdf-vendor'
          }

          if (pkgName === 'html2canvas') {
            return 'html2canvas-vendor'
          }

          if (pkgName === 'pdf-lib') {
            return 'pdf-lib-vendor'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})