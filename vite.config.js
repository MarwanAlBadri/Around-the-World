import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

// Serves the Vercel function in /api/countries.js during `npm run dev`,
// so local development works exactly like production.
function apiDevServer() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/countries', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/countries.js')
        const url = new URL(req.originalUrl, 'http://localhost')
        const response = {
          status(code) { res.statusCode = code; return response },
          setHeader(key, value) { res.setHeader(key, value); return response },
          json(body) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
            return response
          },
        }
        await handler({ query: Object.fromEntries(url.searchParams) }, response)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // make RESTCOUNTRIES_API_KEY from .env available to the dev API
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

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
