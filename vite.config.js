import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

// Serves the Vercel function in /api/countries.js during `npm run dev`,
// so local development works like production.
function apiDevServer() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/countries', async (req, res, next) => {
        const response = {
          status(code) { res.statusCode = code; return response },
          setHeader(key, value) { res.setHeader(key, value); return response },
          json(body) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
            return response
          },
        }
        try {
          const { default: handler } = await server.ssrLoadModule('/api/countries.js')
          const url = new URL(req.originalUrl, 'http://localhost')
          await handler({ query: Object.fromEntries(url.searchParams) }, response)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // make REST_COUNTRIES_API_KEY from .env.local available to the dev API only
  // (it has no VITE_ prefix, so it is never added to the browser code)
  const env = loadEnv(mode, process.cwd(), 'REST_COUNTRIES_')
  if (env.REST_COUNTRIES_API_KEY) {
    process.env.REST_COUNTRIES_API_KEY = env.REST_COUNTRIES_API_KEY
  }

  return {
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      apiDevServer(),
    ],
  }
})
