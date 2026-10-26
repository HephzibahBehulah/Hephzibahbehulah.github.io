# Private admin security and release monitoring

The administrator remains the configured Cloudflare Access owner. This release does not create accounts, widen roles, weaken Access, or introduce a second password store.

## Entry points

- Admin account menu: verified identity, expiry, Security & releases, Users & sign-ins, and sign-out.
- Sidebar: Security & releases.
- Owner-only read endpoints: `/api/admin/security` and `/api/admin/security/session`.
- Existing customer activity, account paging/search, provider sign-in events, and requested/succeeded/failed account-operation audit records remain in Users & sign-ins.

## Enforcement

Every private request still validates the signed Access JWT, including its issuer, audience, owner identity and expiry. Expired tokens have no post-expiry acceptance window. State-changing private requests additionally require the exact admin Origin; cross-site requests are refused. Private responses, including errors and account responses, use no-store, HTTPS-only browser transport enforcement (HSTS for the admin host without extending to subdomains), same-origin frame protection, no-referrer, a restrictive embedding/object/base policy, and an opaque request correlation ID. Unexpected private errors return a sanitized message.

The new report endpoint requires the configured owner and the dedicated monitoring rate-limit key. No GitHub token, Access assertion, Supabase secret, password, or email code is returned. UI output uses text nodes. Identity and report fetches do not trust a successful HTML login page as JSON. A stale or expired session disables private monitoring and offers reauthentication; the server remains the security boundary.

## Upgrade and integrity evidence

The report compares the deployed commit with GitHub main and the latest 20 production workflow runs. A deployment without a matching successful run is reported as unverified/in progress rather than malicious. Branch protection is reported separately.

Native engineering, main-site and shared-interface assets are hashed against GitHub source at the deployed commit and the deployment manifest. Built PLC, ElectCAD and Cyber application bundles are checked against the deployment manifest, which is not an independent forensic baseline. On-demand checks read the deployed asset binding; Cloudflare does not reliably support requesting a Worker’s own public routes from that Worker. External GitHub checks verify public HTTP delivery. Checks have bounded response sizes and timeouts. A mismatch is a review signal and can also result from a release race or valid rollback.

GitHub production workflows generate a JSON report checking the expected commit, seven shell routes, seven embedded applications, linked resources, selected public code hashes, unauthenticated admin boundaries and public isolation. Reports are uploaded as `production-security-report` artifacts with a requested 90-day retention. Repository/provider retention limits apply. Reports contain no customer data or authentication tokens.

## Coverage and limits

Cloudflare Access allow/deny logs remain in Cloudflare Zero Trust. Application logs cannot observe requests rejected before the Worker. The admin session check and report review emit small structured events to Worker logs; these are checks, not asserted new sign-ins. Supabase authentication events and account-operation audit records are queried through the existing owner-verified service.

No events is not proof of no activity. The current Supabase audit tables deny ordinary-user reads; the account-operation table intentionally has RLS enabled without ordinary-user policies. Leaked-password protection was reported disabled by the provider advisor and requires checking the provider setting/plan. MFA enforcement must be checked in the Access/identity-provider policy, not guessed from a logged-in browser.

The dashboard is not a packet-capture tool and cannot prove the absence of interception or compromise. A fully compromised deployment could falsify its own report. Retain independent GitHub evidence, protect source and provider accounts, review external Access logs, and keep verified deployment versions for rollback. Repository/provider administrators can alter or delete their own records.
