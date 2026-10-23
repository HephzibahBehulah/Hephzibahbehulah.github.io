# Security

## Current safeguards
- The optional backend binds to loopback by default.
- Request JSON is limited to 2 MB.
- Project names and body shapes are validated.
- SQL uses parameterized statements and transactional project/revision writes.
- Project revision conflicts return HTTP 409.
- The AI endpoint validates component IDs and numeric coordinates and constrains the structured output schema.
- The browser never receives the OpenAI API key; it belongs in the backend environment only.
- Solver resource limits cap component and wire counts.

## Required before public hosting
- Authentication, per-project authorization and tenant isolation.
- Rate limits and abuse monitoring, especially for AI requests.
- HTTPS, trusted-origin allowlist, secure secret management, dependency scanning and security headers.
- Persistent backup/restore procedures, migrations and audit logging.
- File-upload content limits and security review.
- Threat model and penetration testing.

Do not expose the optional API directly to the public internet in its current form. Static GitHub Pages hosting only serves the client and cannot provide API secrets or backend execution.
