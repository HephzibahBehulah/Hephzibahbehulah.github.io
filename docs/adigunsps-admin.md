# AdigunSPs in the shared admin portal

Open `https://admin.hephzibahbehulah.com/`, complete the existing Cloudflare Access check, then choose **Admin account → AdigunSPs admin**.

This panel is hosted by the existing company Cloudflare Worker. Production publication remains exclusively through the company repository’s GitHub Actions pipeline. The existing account monitor and its backend are unchanged.

## Product isolation

- The panel uses only AdigunSPs project `fqcbfnktdvqojyezxeis` and schema `adigunsps`.
- It never calls the shared `/api/admin/accounts` gateway or the VoltPro backend.
- A separate AdigunSPs password sign-in is required after Cloudflare Access. Tokens stay in module memory; neither localStorage nor sessionStorage is used.
- Closing the panel signs out only that AdigunSPs session. It does not sign out the company portal or other product sessions.
- Only a permanent account with server-controlled `app_metadata.role = admin` can use the panel. Cloudflare portal access alone does not grant product permissions.
- Only the publishable client key is included. No service-role key, privileged server secret, or cross-product token is added.
- Both panel modules are denied on public company hosts and remain behind the existing private-host authorization check.

## Recipe review

The panel lists up to 100 visible submissions and their fixed input snapshots. An administrator other than the submitter can approve or reject a submission after reviewing its values and optionally adding a comment. The database assigns the reviewer and time, prevents self-review, and accepts one immutable decision per submission. Recipe values and decisions cannot be updated or deleted by browser users.

Approving does not run a program or change physical or simulated outputs. The owner can import an approved snapshot as a local copy in AdigunSPs and separately review/apply its inputs. Local copies remain editable. Approval is not engineering, legal-signature, machinery, or safety certification.

## Verification

Run `node --test platform/adigunsps-admin.test.mjs platform/router.test.mjs platform/admin-accounts.test.mjs platform/admin-security.test.mjs` for product isolation, memory-only sessions, private routes, expiry, and existing gateway regressions. Run the repository-required `node platform/release.mjs` before publishing. After GitHub Actions succeeds, verify the production Worker is Ready for that same main commit and test the live panel. Independent-reviewer browser verification requires the separately authorized product administrator to sign in themselves.
