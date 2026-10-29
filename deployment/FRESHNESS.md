# Site-wide deployment freshness

## Architecture and observed baseline

Production is a Cloudflare Worker (`backend/workers/worker-platform.mjs`) with a versioned ASSETS binding, built from this GitHub repository by Integrated platform validation. It is not GitHub Pages behind a generic static CDN. All seven engineering routes resolve to the shared workspace shell; embedded tools retain their own routes and assets.

On 2026-10-26 the production status API reported commit `083d45643f2d09e6defb87df0f5deb17b837d889`, matching main. All seven requested routes returned 200, `private, no-store` HTML; shared assets returned `max-age=0, must-revalidate`. A missing JS URL returned 404. The Cloudflare `HIT` header can come from the static asset binding and alone does not prove stale edge delivery. The original stale-session symptom was not reproduced in the clean browser session.

Confirmed defects in the previous worker were immediate activation, origin-wide cache inspection, and an offline fallback reading arbitrary origin caches. Network-first fetches still used the browser HTTP cache. There was no shared running-build stamp or site-wide update flow. These are addressed as reliability defects; there is no evidence that HTML was currently cached for a long browser TTL.

## Policy

- Generated HTML remains private/no-store; transformed HTML drops source validators.
- Stable-name shared and tool assets explicitly revalidate. Do not enable immutable caching merely because a path contains `assets` or a manual `?v=` string.
- Worker-generated asset responses set Cloudflare-CDN-Cache-Control to no-store. Internal content-addressed asset storage remains managed by Cloudflare.
- Worker scripts and release metadata are no-store.
- The public worker fetches HTML, code, CSS, JSON, account data, and shared resources with browser-cache bypass and never substitutes old application code after network failure.
- Only runtime WASM, fonts, and media retain a scoped offline fallback. Offline tool launch is not promised; HTML was already excluded from the prior public worker cache.
- Cleanup touches only `hb-site-*`, `voltpro-*`, and `hb-public-static-*` caches on the current origin. Projects, localStorage, IndexedDB, and unrelated caches are untouched.

## Safe updates

The build stamps every HTML entry point with its Git commit before generating the release inventory. Identity travels with the static assets and does not depend on deployment-time variables. This also covers Cloudflare Git builds outside the GitHub Actions deployment. `/_hb/release.json` reports the latest deployed build on each public host. The browser compares that with the HTML stamp, never with a baseline first learned after loading. It checks at startup, on reconnect, on return to a visible tab (throttled), and every five minutes while visible.

An update offers Reload website and Later. The reload action reminds users to save/export their work. No automatic reload occurs; other tabs keep their work. Existing service workers are checked for updates without creating a new registration or changing a scope. A waiting worker activates after the update action. The controlling tab reloads at most once. First installation does not produce an update notice.

Embedded tools report recognized lazy-module failures to the same-origin top page, which offers recovery. There is no automatic reload loop. Historical hashed bundles are not retained indefinitely by this change; very old tabs can need the offered save-and-reload recovery if a removed lazy bundle is requested. Stable-name dynamic modules are refreshed; full immutable per-release application snapshots are not introduced.

## Deployment and verification

Production runs are serialized across main and deploy tags. Worker code and static assets deploy together through Wrangler. CI runs cache/update regression tests, then verifies the expected deployed commit, each requested route's HTML stamp and caching policy, shell resources, both worker URLs, and real 404 behavior after production deployment. A green build without this live verification is insufficient.

The running browser version is inspectable as `window.HBReleaseUpdate.running`; the available version is `window.HBReleaseUpdate.available`. Engineering `/status` and `/api/status` remain available.

A first migration cannot replace JavaScript already executing in an old page. Existing users get the new updater after a normal online navigation/reload or the existing worker update flow; this change does not forcibly reload their unsaved work. Previously cached immutable browser responses cannot be remotely erased by an HTTP header or a CDN purge.

Do not rely on repeated Purge Everything, random asset query strings, or clearing all browser storage. If custom Cloudflare zone rules override these headers, inspect and remove those overrides; this source change does not edit account-level dashboard rules. Keep the previous verified Worker version available for rollback.


## Independent deployment entry points

During rollout, production briefly reported the new build with no workflow deployment timestamp while the GitHub Actions container upload had failed. A subsequent successful workflow deployment restored its timestamp. This indicates a separate deployment entry point and is why build identity must be embedded in the release rather than supplied only by GitHub Actions. Dashboard-level build triggers were not edited.
