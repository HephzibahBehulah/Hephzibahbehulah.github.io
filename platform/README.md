# Integrated Hephzibah Behulah platform

This is a staged integration. It does not replace the current production entry point or claim that every existing feature has passed acceptance.

## Hostnames

- `engineering.hephzibahbehulah.com`: the pinned VoltPRo application.
- `cyber.hephzibahbehulah.com`: the pinned cybersecurity browser companion.
- `hephzibahbehulah.com`: the existing combined platform, with Cloudflare Access verification required for every request.
- `admin.hephzibahbehulah.com`: the existing control room, with the same outer Access verification and its existing private API checks.

Both private hostnames also mount the complete browser applications under `/engineering/` and `/cyber/`. Existing root content, control tools, Cyber OS, knowledge libraries, bot and terminal remain in the original Worker implementation. Native Kali/WSL execution remains local; publishing the browser companion does not publish a remote shell.

## Build

Use the exact repository commits in `source-lock.json`. Build VoltPRo's `apps/voltpro-plc` using its lockfile and build the cybersecurity companion using `core/build_app.py`. Keep its Pyodide distribution and licence files. Then, from the main repository:

```sh
node --test platform/access.test.mjs platform/router.test.mjs
node platform/preflight.mjs
node platform/build.mjs /absolute/path/to/voltpro /absolute/path/to/cyber/build-app/web
node platform/prepare-config.mjs
npx wrangler deploy --dry-run --config wrangler.platform.jsonc
```

The builder refuses incomplete original-platform snapshots and refuses to overwrite an existing release directory. Use a fresh checkout or preserve the previous generated directory before building again. The release manifest records source versions and asset checksums. The existing `wrangler.jsonc` remains the production default until a verified rollout is possible.

## Required deployment checks

1. Renew deployment access with approved, limited permissions. The previous broad Cloudflare device-login request was rejected by automatic approval review; it must not be bypassed.
2. Configure Cloudflare Access for both private hostnames, with the approved owner identity and MFA. The Worker requires the same issuer, audience and owner email through `ADIGUN_ACCESS_TEAM_DOMAIN`, `ADIGUN_ACCESS_AUD` and `ADIGUN_ADMIN_EMAIL`. If configuration is absent, it fails closed. A hostname existing in DNS is not proof that an Access policy exists.
3. Use the generated configuration's `run_worker_first: true`. Static assets must never bypass authorization. Keep the alternative `workers.dev` and preview URLs disabled.
4. Verify Supabase Auth redirect destinations for both public hostnames. The existing publishable-key client is reused; privileged keys must not be published. The shared account form supports sign-in, email confirmation and password recovery. The same identity can sign into both apps, but sessions are per origin; cross-domain single sign-on is not claimed.
5. Test email delivery, account recovery, cloud-project ownership, logout and denied direct API requests using real test accounts. Client code alone does not establish these checks.
6. Verify model availability, request limits, public tutor responses, existing private AI, bot and terminal against the deployed runtime. Local previews return a real unavailable response for live APIs rather than simulated success.
7. Complete the feature-by-feature comparison and the remaining page/button acceptance matrix, including physical mobile and WSL operation. Browser viewport checks are not physical-device certification.
8. Verify existing main-platform catalogue files, rollback, deployed version and signed-out access before switching traffic or changing VoltPRo repository visibility.

## Supabase hardening applied

`database-hardening.sql` revokes public/member execution of the internal `rls_auto_enable()` event-trigger function. Verification confirmed both execute privileges false and the trigger still enabled. Existing project and revision RLS policies remain intact. The security advisor still reports leaked-password protection disabled; that Auth setting needs separate review/configuration.

## Remaining product work

This integration makes existing browser applications available together; it does not establish full functional parity with every native desktop feature. Central user-administration tools, comprehensive Cloudflare/Supabase log ingestion, shared cross-domain sessions and additional private-AI management actions require further implementation and deployment verification. No new unrestricted administrator or shell capability is granted by this branch.
