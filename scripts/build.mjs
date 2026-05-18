import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

// 1. Clean & create dist
if (existsSync(DIST)) {
  cpSync(DIST, DIST, { recursive: true }); // no-op, fs.rmSync below
}
mkdirSync(DIST, { recursive: true });

// 2. Copy static files to dist
const staticDirs = ['css', 'js', 'icons'];
for (const dir of staticDirs) {
  const src = resolve(ROOT, 'src', dir);
  if (existsSync(src)) {
    cpSync(src, resolve(DIST, dir), { recursive: true });
  }
}

// Copy root files
const rootFiles = ['index.html', 'manifest.json', 'robots.txt'];
for (const file of rootFiles) {
  const src = resolve(ROOT, 'src', file);
  if (existsSync(src)) {
    cpSync(src, resolve(DIST, file));
  }
}

// 3. Generate service worker with Workbox precache manifest
try {
  const { generateSW } = await import('workbox-build');
  const { count, size, warnings } = await generateSW({
    globDirectory: DIST,
    globPatterns: [
      '**/*.{html,css,js,json,png,svg,ico}'
    ],
    swDest: resolve(DIST, 'sw.js'),
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        // Cache Supabase API responses for offline reads
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
          networkTimeoutSeconds: 3
        }
      }
    ],
    // Skip large files
    maximumFileSizeToCacheInBytes: 200 * 1024
  });

  if (warnings.length) {
    console.warn('⚠️  Workbox warnings:', warnings);
  }
  console.log(`✅ Service worker generated — ${count} files, ${(size / 1024).toFixed(1)}KB precached`);
} catch (err) {
  console.error('❌ Workbox build failed:', err.message);
  // Fallback: copy a basic SW
  const fallbackSW = `
// Fallback service worker (Workbox build failed)
const CACHE_NAME = 'ambria-v1';
const PRECACHE = ['/', '/index.html', '/css/styles.css', '/js/app.js', '/js/i18n.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
`;
  writeFileSync(resolve(DIST, 'sw.js'), fallbackSW);
  console.log('⚠️  Wrote fallback service worker');
}

console.log('✅ Build complete → dist/');
