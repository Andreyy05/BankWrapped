import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function cspPlugin(): Plugin {
  return {
    name: 'html-csp-transform',
    transformIndexHtml(html, ctx) {
      // In dev mode, do NOT inject CSP so Vite dev server, React Refresh and HMR run unrestricted
      // In production build, enforce strict privacy: connect-src 'none'
      if (ctx.server) {
        return html;
      }

      const csp = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'none';";
      const cspTag = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
      return html.replace('<head>', `<head>\n    ${cspTag}`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
});
