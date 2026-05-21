import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/decor-attendance/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/decor-attendance/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-libs',
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 * 30 }
            }
          }
        ]
      },
      manifest: {
        name: 'AMBRIA हाज़िरी — Attendance',
        short_name: 'AMBRIA',
        description: 'AMBRIA Group Multi-Department Attendance App',
        start_url: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#667eea',
        background_color: '#f5f7fa',
        lang: 'hi',
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ]
});
