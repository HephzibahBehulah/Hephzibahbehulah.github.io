# Known-Good Commit Ledger

This file lists commits with documented evidence. "Known-good" is used carefully: source preservation, CI validation, deployment evidence, and live verification are tracked separately.

## 1. c90a74f4641cd6371187d820c07a228acc05ff15

- Date: 2026-09-29
- Purpose: Fix Worker syntax error blocking Cloudflare deployment.
- CI status: No GitHub status checks returned for this commit.
- Live verification: Not independently recorded in the current evidence set.
- Cloudflare deployment evidence: The commit was created specifically to restore the missing Worker export closure; the earlier commit `24b63fda921e91a36b1bd7afb331a8a99190725d` had a documented Cloudflare build failure. No independent Cloudflare deployment version is attached to this commit.
- Status: SOURCE BASELINE / ROLLBACK CANDIDATE.
- Rollback branch/tag: `production-known-good`.
- Notes: This is the preserved source baseline. It must remain untouched while newer versions are evaluated.

## 2. 899298c5fa263b0488c8136905765951d3abddc0

- Date: 2026-09-29
- Purpose: Fix ADIGUN Control terminal HELP and command routing.
- CI status: No GitHub status checks returned for this commit.
- Live verification: Earlier production verification established the ADIGUN Control terminal routing change as working.
- Cloudflare deployment evidence: Cloudflare deployment version 217 was previously verified for this commit.
- Status: DEPLOYED / VERIFIED.
- Rollback branch/tag: Not separately tagged.
- Notes: Retained as historical deployment evidence.

## 3. 72d416062cd8b827a82fac02f5b15d1cd8eb1427

- Date: 2026-09-29
- Purpose: Add PLC IOSIM and ADIGUN intelligence projects.
- CI status: No GitHub status checks returned for this commit.
- Live verification: Earlier production verification established the added project links/pages as working.
- Cloudflare deployment evidence: Cloudflare deployment version 218 was previously verified for this commit.
- Status: DEPLOYED / VERIFIED.
- Rollback branch/tag: Not separately tagged.
- Notes: Retained as historical deployment evidence.

## 4. 391598be5a3d1143e4526ea7a1a9cfaa4014cd34

- Date: 2026-09-29
- Purpose: Add ADIGUN deployment safety and rollback discipline.
- CI status: AI Platform CI run #291 completed successfully.
- Live verification: Pending fresh independent production regression verification.
- Cloudflare deployment evidence: Not independently established by the available GitHub connector.
- Status: CI VERIFIED / LIVE PENDING.
- Rollback branch/tag: None yet. Do not replace `production-known-good` with this commit until live verification is completed.
- Notes: This commit establishes the inventory and safety documentation itself.
