import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function stripApiSuffix(url) {
  return url.replace(/\/api\/?$/, '')
}

function resolveProxyTarget(env) {
  const fallbackTarget = 'http://localhost:5000'
  const rawTarget = (
    env.VITE_PROXY_TARGET ||
    env.VITE_API_PROXY_TARGET ||
    env.VITE_API_URL ||
    fallbackTarget
  ).trim()

  try {
    return new URL(rawTarget).origin
  } catch {
    return stripApiSuffix(rawTarget) || fallbackTarget
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = resolveProxyTarget(env)

  return {
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
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure(proxy) {
            proxy.on('error', (_err, _req, res) => {
              if (!res || res.headersSent) return

              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  success: false,
                  message:
                    `API proxy could not reach ${proxyTarget}. ` +
                    'Start the backend server or update VITE_PROXY_TARGET in frontend/.env.',
                }),
              )
            })
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'node',
    },
  }
})
