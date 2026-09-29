# Production Version Ledger

This file tracks production deployment evidence separately from source and CI status.

| Date | Commit | Purpose | CI | Live verification | Cloudflare evidence | Status |
|---|---|---|---|---|---|---|
| 2026-09-29 | `899298c5fa263b0488c8136905765951d3abddc0` | ADIGUN Control HELP and command routing | No status checks returned | Previously verified working | Cloudflare version 217 | DEPLOYED / VERIFIED |
| 2026-09-29 | `72d416062cd8b827a82fac02f5b15d1cd8eb1427` | PLC IOSIM and ADIGUN intelligence projects | No status checks returned | Previously verified working | Cloudflare version 218 | DEPLOYED / VERIFIED |
| 2026-09-29 | `391598be5a3d1143e4526ea7a1a9cfaa4014cd34` | Deployment safety and rollback documentation | AI Platform CI #291: success | Pending fresh verification | Not independently established | CI VERIFIED / LIVE PENDING |

## Important deployment rule

A GitHub commit and a Cloudflare deployment are different pieces of evidence.

The repository currently has no workflow that directly runs `wrangler deploy`. Therefore this ledger must never infer a successful Cloudflare deployment solely from a GitHub commit or green CI.

When a new deployment is independently confirmed, add its Cloudflare version, timestamp, commit, and verification result here.


## 2026-09-29 ADIGUN Control terminal architecture refinement

- Commit: `4d382b24f5491d8874cb59d3fe53a983b7060c54`
- Purpose: Replace the overwhelming default terminal catalog with a curated command/help experience, improve dispatch normalization, add controlled `ping` reachability, document `nmap`/`shodan` boundaries, preserve private agent routing, and refresh admin assets.
- CI: AI Platform CI run #301, success.
- Live verification: pending authenticated production regression test.
- Cloudflare deployment evidence: not independently verified.
- Status: CI VERIFIED / LIVE PENDING.
- Rollback reference: preserve `production-known-good`; do not promote a new rollback snapshot until independent live verification.
