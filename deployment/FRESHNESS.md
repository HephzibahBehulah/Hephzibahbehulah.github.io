# Site-wide deployment freshness

## Architecture

Production is the Cloudflare Worker in `backend/workers/worker-platform.mjs`, with static assets built from this repository. GitHub Actions owns production Worker deployments; Cloudflare Workers Builds is validation-only.

The release builder stamps generated pages and writes `/_hb/release.json`. The browser updater compares that release identity with the page stamp, then offers a save-and-reload flow when a newer release is available. It does not force a reload while a user may have unsaved work.

## Cache policy

- Generated HTML and release metadata are served without public caching; transformed HTML drops source validators.
- Stable shared assets revalidate. Worker-generated asset responses use `Cloudflare-CDN-Cache-Control: no-store`.
- The public service worker does not substitute old application code after a network failure. Only runtime WASM, fonts, and media use a scoped offline fallback.
- Cache cleanup is limited to the current site's `hb-site-*` and `hb-public-static-*` entries. Project data, local storage, IndexedDB, and unrelated origins are untouched.

## Deployment checks

CI runs route and update regressions, verifies the deployed commit and retained shell assets, and confirms that retired engineering workspace paths return 404 on the main and engineering hostnames. A green build without the live post-deploy verification is insufficient.

Previously cached browser responses cannot be erased by response headers alone. Avoid clearing all browser storage or using broad CDN purges as a cache fix.
