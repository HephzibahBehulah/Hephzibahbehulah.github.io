const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "hephzibah-behulah-ai",
        version: "0.1.0",
        capabilities: ["agent", "rag", "document-analysis", "dataset-analysis", "automation", "ml"],
        configured: Boolean(env.AI_PROVIDER)
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return json({
        ok: false,
        error: "API route not configured yet",
        next: "Configure the provider, storage and authentication adapters before enabling production routes."
      }, 501);
    }

    return new Response("Hephzibah Behulah AI Platform API", {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
