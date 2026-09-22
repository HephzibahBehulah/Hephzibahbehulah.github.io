// sw.js - Service Worker (Smart Fetch Strategy)
const CACHE_NAME = 'hephzibah-2026-09-23-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/portfolio.html',
    '/resources.html',
    '/contact.html',
    '/pentest.html',
    '/css/main.css',
    '/css/dark.css',
    '/css/responsive.css',
    '/css/pentest.css',
    '/css/osint-style.css',
    '/css/cursor.css',
    '/js/main.js',
    '/js/theme.js',
    '/js/animations.js',
    '/js/custom-cursor.js',
    '/js/osint-tree.js',
    '/js/particles.js',
    '/js/projects-data.js',
    '/js/quiz.js',
    '/js/rate-limit.js',
    '/js/sw-register.js',
    '/js/tree-data.js',
    '/js/typing-effect.js',
    '/js/lazy-load.js',
    '/js/performance.js',
    '/js/pentest.js',
    '/css/features.css',
    '/css/accessibility.css',
    '/css/tree-styles.css',
    '/js/terminal-emulator.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// ========================================
// INSTALL: Pre-cache all assets
// ========================================
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ========================================
// ACTIVATE: Clean up old caches
// ========================================
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// ========================================
// FETCH: Smart caching strategy
// ========================================
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    
    // Skip non-GET requests (POST, PUT, etc.)
    if (e.request.method !== 'GET') return;
    
    // Skip non-http(s) protocols (chrome-extension, data:, etc.)
    if (!url.protocol.startsWith('http')) return;
    
    // Skip cross-origin requests that aren't in our cache
    // (except Google Fonts and CDN which are in ASSETS)
    
    // ========================================
    // HTML PAGES: Network-first (always fresh)
    // ========================================
    if (e.request.headers.get('accept')?.includes('text/html')) {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    // Update cache with fresh version
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    // Offline fallback: serve cached version
                    return caches.match(e.request);
                })
        );
        return;
    }
    
    // ========================================
    // CSS/JS/IMAGES/FONTS: Cache-first (fast)
    // ========================================
    e.respondWith(
        caches.match(e.request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                
                return fetch(e.request).then(response => {
                    // Only cache successful responses
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }
                    
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(e.request, clone);
                    });
                    return response;
                });
            })
    );
});
