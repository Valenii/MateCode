/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Solo en desarrollo: sirve la función serverless api/sendEmail.ts desde el propio
 * servidor de Vite, para probar el envío de correos con `npm run dev` sin depender de
 * `vercel dev`. En producción esta ruta la sirve Vercel, por eso el plugin no se aplica al build.
 */
const devApiPlugin = (): Plugin => ({
  name: 'matecode-dev-api',
  apply: 'serve',
  configureServer(server) {
    // Vitest también levanta un servidor de Vite: los tests no deben tocar process.env
    if (process.env.VITEST) return;

    // Igual que en Vercel, la función lee sus variables desde process.env (incluidas las AWS_*,
    // que Vite no expone al cliente porque no llevan el prefijo VITE_)
    const env = loadEnv(server.config.mode, server.config.envDir || process.cwd(), '');
    for (const [key, value] of Object.entries(env)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }

    server.middlewares.use('/api/sendEmail', async (req, res) => {
      let raw = '';
      for await (const chunk of req) raw += chunk;

      // Adaptador mínimo con la forma (req, res) que usan las funciones de Vercel
      const apiRes: any = res;
      apiRes.status = (code: number) => {
        res.statusCode = code;
        return apiRes;
      };
      apiRes.json = (payload: unknown) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
        return apiRes;
      };
      (req as any).body = raw;

      try {
        const { default: handler } = await server.ssrLoadModule('/api/sendEmail.ts');
        await handler(req, apiRes);
      } catch (error) {
        server.config.logger.error(`[dev-api] ${String(error)}`);
        apiRes.status(500).json({ success: false, error: 'Error interno en la función de desarrollo.' });
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts',
    css: true,
  },
});
