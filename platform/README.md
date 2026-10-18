# Integrated Hephzibah Behulah platform

This integration is deployed on the four hostnames below. It preserves the original platform and adds the pinned public browser applications. Full product acceptance, authenticated private-tool checks and every native feature are not yet complete.

## Hostnames

- `engineering.hephzibahbehulah.com`: the pinned VoltPRo application.
- `cyber.hephzibahbehulah.com`: the pinned cybersecurity browser companion.
- `hephzibahbehulah.com`: the existing combined platform, with Cloudflare Access verification required for every request.
- `admin.hephzibahbehulah.com`: the existing control room, with the same outer Access verification and its existing private API checks.

Both private hostnames also mount the complete browser applications under `/engineering/` and `/cyber/`. Existing root content, control tools, Cyber OS, knowledge libraries, bot and terminal remain in the original Worker implementation. Native Kali/WSL execution remains local; publishing the browser companion does not publish a remote shell.

## Build

Use the exact repository commits in `source-lock.json`. Build VoltPRo's `apps/voltpro-plc` using its lockfile and build the cybersecurity companion using `core/build_app.py`. Keep its Pyodide distribution and licence files. Then, from the main repository:

```sh
node --test platform/access.test.mjs platform/router.test.mjs platform/engineering-ai.test.mjs platform/app-archives.test.mjs
node platform/preflight.mjs
node platform/build.mjs /absolute/path/to/voltpro /absolute/path/to/cyber/build-app/web
node platform/prepare-config.mjs
npx wrangler deploy --dry-run --config wrangler.platform.jsonc
```

The builder refuses incomplete original-platform snapshots and refuses to overwrite an existing release directory. Use a fresh checkout or preserve the previous generated directory before building again. The release manifest records source versions and asset checksums. `wrangler.jsonc` now uses the integrated entry point and requires the generated assets; it cannot silently fall back to the older public root.

For Cloudflare automatic builds, use `node platform/release.mjs` as the build command and `npx wrangler deploy` as the deploy command. The release command downloads the exact browser-only release archives in `public-apps-lock.json`, verifies SHA-256 checksums, runs the boundary tests, rebuilds the complete original platform plus both apps, and prepares deployment configuration. It does not require public repositories or a cross-repository GitHub token. These archives contain browser-delivered application assets, not backend secrets or the native Kali execution application. A hash mismatch stops the build. To update an app, build and validate its new pinned revision, publish its versioned browser archive, and update both locks together.

## Required deployment checks

1. Deployment login was renewed with explicitly approved account/user/zone read, Worker script/route write, container write and background access. The container permission was approved separately after Cloudflare required it to preserve the existing terminal container.
2. Both private hostnames now share the existing owner-email Access application, with authenticator MFA required. Signed-out requests to both hosts and their API/assets redirect to Cloudflare login. The Worker additionally verifies issuer, audience, signature and owner identity. Authenticated acceptance still requires the owner's login and MFA; denied public requests do not prove successful owner access.
3. Use the generated configuration's `run_worker_first: true`. Static assets must never bypass authorization. Keep the alternative `workers.dev` and preview URLs disabled.
4. Supabase now has exact confirmation/recovery callbacks for both public roots and the engineering account page. Its default site URL is the clean engineering account URL. Existing GitHub Pages callbacks remain allowed. The existing publishable-key client is reused; privileged keys must not be published. The same identity can sign into both apps, but sessions are per origin; cross-domain single sign-on is not claimed.
5. Test email delivery, account recovery, cloud-project ownership, logout and denied direct API requests using real test accounts. Client code alone does not establish these checks.
6. Engineering health and both public tutors returned successful responses from the deployed Workers AI runtime. The engineering health regression is covered by a test. Private AI, bot and terminal still need owner-authenticated acceptance. Local previews return an unavailable response for live APIs rather than simulated success.
7. Complete the feature-by-feature comparison and the remaining page/button acceptance matrix, including physical mobile and WSL operation. Browser viewport checks are not physical-device certification.
8. All fourteen original catalogue files were restored byte-for-byte against their original Git blob hashes. Original-platform preflight and 28 live route/access checks passed. The original production rollback version is `d9affc88-749f-49f6-acf8-7c9c71d5f969`; rolling it back does not remove the new Cloudflare Access policy. Keep private protection active during any rollback.

## Supabase hardening applied

`database-hardening.sql` revokes public/member execution of the internal `rls_auto_enable()` event-trigger function. Verification confirmed both execute privileges false and the trigger still enabled. Existing project and revision RLS policies remain intact. The security advisor still reports leaked-password protection disabled; that Auth setting needs separate review/configuration.

## Remaining product work

This integration makes existing browser applications available together; it does not establish full functional parity with every native desktop feature. Comprehensive Cloudflare/Supabase log ingestion, shared cross-domain sessions and additional private-AI management actions require further implementation and deployment verification. No new unrestricted administrator or shell capability is granted by this branch.

## Owner account administration

The private Applications menu includes Accounts & sign-ins. Both Cloudflare Worker routing and the Supabase `hb-admin-accounts` function independently verify the signed Cloudflare owner identity. The server-only service credential never reaches the client. Public origins reject the account API and its UI module. The function entry point is `platform/admin-accounts-entry.ts`; deploy it with `admin-accounts-core.mjs` and `access.mjs`. Platform JWT verification is replaced by the function's explicit Cloudflare signature, issuer, audience, expiry and owner checks. Apply `admin-accounts-schema.sql` to provision the restricted audit view and RLS-enabled operation history.

The panel lists 50 accounts per page, recent Supabase audit events and recorded owner operations. Member accounts can have new sign-ins paused for 24 hours or allowed again, with confirmation. Both known owner identities are protected. Existing access tokens can remain valid until expiry; this is not immediate session revocation. Account changes require an audit record first; a finalization failure is reported separately from the applied change. Neither this panel nor private AI claims that audit coverage proves malicious behavior. Private AI can inspect account and event summaries but cannot change account state through its chat tools.

Owner-authenticated private AI and terminal HELP have returned real responses. The public owner account is confirmed and recorded a successful sign-in on 2026-10-18. End-to-end cloud-project save/reload and recovery-email delivery still require acceptance in an authenticated public session. Supabase leaked-password protection is shown as requiring Pro on the current Free plan; no paid upgrade was made.
