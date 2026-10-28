// Cloudflare Workers Builds validates main but is not a production deploy writer.
// The GitHub Actions release is the single source of production Worker/assets updates.
console.log("Cloudflare Workers Builds validation-only mode: production deploy is owned by GitHub Actions.");
