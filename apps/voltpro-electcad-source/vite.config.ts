import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const legacyRedirect = {
  name: 'voltpro-electcad-legacy-redirect',
  apply: 'build' as const,
  transformIndexHtml: {
    order: 'post' as const,
    handler() {
      const target = 'https://engineering.hephzibahbehulah.com/voltPro-ElectCAD/';
      return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0;url=${target}">
<link rel="canonical" href="${target}">
<title>VoltPro ElectCAD has moved</title>
<meta name="robots" content="noindex,follow">
</head>
<body>
<main>
<h1>VoltPro ElectCAD has moved</h1>
<p>The electrical design workbench is now part of the engineering workspace.</p>
<p><a href="${target}">Continue to VoltPro ElectCAD</a></p>
</main>
<script>window.location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;
    }
  }
};

export default defineConfig({
  base: '/VoltPro-ElexCAD/',
  plugins: [react(), legacyRedirect],
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:4000' }
  }
});
