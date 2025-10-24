import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './manifest.json',
      disableAutoLaunch: false,
    }),
    // Copy icons to dist after build
    {
      name: 'copy-icons',
      closeBundle() {
        const iconsDir = resolve(__dirname, 'dist/icons');
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }

        const iconFiles = ['icon-16.png', 'icon-48.png', 'icon-128.png'];
        iconFiles.forEach(file => {
          const src = resolve(__dirname, 'icons', file);
          const dest = resolve(iconsDir, file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`✓ Copied ${file} to dist/icons/`);
          }
        });
      }
    }
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
