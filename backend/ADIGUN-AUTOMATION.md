# ADIGUN authenticated automation

ADIGUN now has explicit tools for:

- GitHub repository inspection
- GitHub issue creation
- GitHub file creation/update
- GitHub pull-request creation
- document analysis
- CSV/JSON dataset profiling
- external Python ML jobs
- Markdown/JSON report generation
- optional R2 report storage
- optional D1 memory and automation logs
- scheduled automation heartbeat

## Required secrets / variables

Set these on the Cloudflare Worker, not in the website:

- `ADIGUN_AGENT_KEY`: private operator key used by authenticated ADIGUN actions.
- `GITHUB_TOKEN`: GitHub token with only the repository permissions required for the approved automation.
- `ML_SERVICE_URL`: URL of the protected FastAPI ML service, if ML jobs are enabled.

Never put these values in GitHub source files or browser JavaScript.

## Optional Cloudflare resources

The Worker detects these bindings when present:

- `DB`: D1 database using `database/schema.sql`.
- `R2`: R2 bucket used for generated reports.

Cron runs every six hours in UTC and records a heartbeat when D1 is configured.

## Security model

Read-only website, knowledge and GitHub inspection remain available without the operator key.

External state-changing tools require `x-adigun-key` matching `ADIGUN_AGENT_KEY`.

ADIGUN does not expose arbitrary shell execution, arbitrary SQL, unrestricted filesystem access, credential retrieval, destructive server actions or unrestricted scanning.

The browser stores the operator key only in sessionStorage after the operator enters it in the AI Lab. It is never committed to the repository.
