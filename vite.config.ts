import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Custom Vite plugin that injects strict Content Security Policy (CSP) into production builds.
 * In development mode, the meta tag is omitted so Vite HMR and Fast Refresh work unimpeded.
 */
function cspPlugin(): Plugin {
  return {
    name: 'html-csp-transform',
    transformIndexHtml(html, ctx) {
      // Allow unrestricted local dev server and HMR
      if (ctx.server) {
        return html;
      }

      // Production zero-leakage security policy: physically prevents network calls
      const csp = "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'none';";
      const cspTag = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
      return html.replace('<head>', `<head>\n    ${cspTag}`);
    },
  };
}

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
        // Optimize bundle size by isolating large dependencies into separate browser-cached chunks
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
