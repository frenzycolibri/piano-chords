const CACHE = 'piano-chords-v2';
const FILES = [
    './',
    'index.html',
    'style.css',
    'manifest.webmanifest',
    'js/app.js',
    'js/a11y.js',
    'js/config.js',
    'js/configure.js',
    'js/keyboard.js',
    'js/practice.js',
    'js/staff.js',
    'js/theory.js',
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(removeOldCaches());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
});

async function removeOldCaches() {
    for (const key of await caches.keys()) {
        if (key !== CACHE) {
            await caches.delete(key);
        }
    }
}
