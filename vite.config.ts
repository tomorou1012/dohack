import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    tailwind(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 6, // 6 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?timestamp=${Math.floor(Date.now() / (1000 * 60 * 30))}`; // Cache for 30 minutes
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'SafeBridge - 災害時AIガイド＆地域連携',
        short_name: 'SafeBridge',
        description: '災害時の迅速な避難をサポートする総合ガイドアプリ',
        theme_color: '#ef4444',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: '避難所マップ',
            short_name: 'マップ',
            description: '現在地周辺の避難所を確認',
            url: '/map',
            icons: [
              {
                src: 'icon-192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'AI相談',
            short_name: 'チャット',
            description: 'AIに災害時の相談',
            url: '/chat',
            icons: [
              {
                src: 'icon-192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      },
    }),
  ],
});