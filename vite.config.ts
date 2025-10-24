import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './manifest.json',
      disableAutoLaunch: false,
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    // Inject environment variables at build time
    'import.meta.env.VITE_EXCHANGE_RATE_API_KEY': JSON.stringify(
      process.env.VITE_EXCHANGE_RATE_API_KEY
    ),
  },
});
