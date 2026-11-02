# HEPHZIBAH BEHULAH

Repository for the main website and its retained platform services.

## Active surfaces

- Main website: https://hephzibahbehulah.com/
- Cybersecurity workspace: https://cyber.hephzibahbehulah.com/
- Admin control: https://admin.hephzibahbehulah.com/admin (Cloudflare Access protected)
- Admin tools: https://admin.hephzibahbehulah.com/admin/tools/ (private)
- Admin Cyber OS: https://admin.hephzibahbehulah.com/admin/cyber-os/ (private)

The former VoltPro engineering suite, its six public workspaces, and `/tools` have been removed from this repository build. The engineering hostname is retained by the Worker configuration and returns 404 for retired paths.

## Build and deploy

GitHub Actions validates the release and deploys the Cloudflare Worker from `main`. Run `node platform/release.mjs` to validate and build locally. The build includes the main website, admin surfaces, shared account services, and cybersecurity workspace.
