# VoltPRo PWA

The application uses a small service worker and web manifest so the Academy and simulator can be cached for offline study after the first successful load.

Heavy simulation engines should remain separately cacheable/lazy-loaded as they are added. Do not bundle large WASM engines into the initial page shell.

Offline mode is intended for education and local project work. It does not imply that external datasheets, standards databases or cloud services are available offline.
