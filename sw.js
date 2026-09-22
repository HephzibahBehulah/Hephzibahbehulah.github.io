// sw.js - Service Worker for offline support
const CACHE_NAME = 'hephzibah-2026-09-22-v1';
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
    '/js/terminal-emulator.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
            .then(response => response || fetch(e.request))
    );
});
