import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/**/*', 'models/**/*', 'icons/**/*'],
      workbox: {
        // The face-api weights are ~600KB and must be cached for the kiosk to
        // work with the network unplugged.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,bin}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'MoodFood — IPC Shopping Centre',
        short_name: 'MoodFood',
        description:
          'Say hi, show us your face, and we will find you something good to eat at IPC.',
        start_url: '/',
        scope: '/',
        display: 'fullscreen',
        orientation: 'portrait',
        background_color: '#070c1c',
        theme_color: '#070c1c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
});
