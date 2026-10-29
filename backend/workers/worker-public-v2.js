import legacy, { Sandbox } from "./worker-openai.js";
import publicSI from "../../platform/public-ai.mjs";

export { Sandbox };

const PUBLIC_HOSTS = new Set(["hephzibahbehulah.com", "www.hephzibahbehulah.com"]);

function json(body, status = 200, origin = "") {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "vary": "Origin"
  };
  if (PUBLIC_HOSTS.has(origin)) {
    headers["access-control-allow-origin"] = "https://" + origin;
    headers["access-control-allow-methods"] = "POST,OPTIONS";
    headers["access-control-allow-headers"] = "content-type,x-hb-session";
    headers["access-control-max-age"] = "86400";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function preflight(origin) {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "https://" + origin,
      "access-control-allow-methods": "POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-hb-session",
      "access-control-max-age": "86400",
      "vary": "Origin"
    }
  });
}

async function publicTranscribe(request, env) {
  if (!env.OPENAI_API_KEY) return json({ok:false,error:"Voice transcription is not configured."},503);
  const type = String(request.headers.get("content-type") || "").toLowerCase();
  if (!type.startsWith("multipart/form-data")) return json({ok:false,error:"Invalid audio upload."},400);
  let form;
  try { form = await request.formData(); } catch { return json({ok:false,error:"Invalid audio upload."},400); }
  const audio = form.get("audio");
  if (!(audio instanceof File)) return json({ok:false,error:"No audio file was supplied."},400);
  if (!String(audio.type || "").toLowerCase().startsWith("audio/")) return json({ok:false,error:"Only audio uploads are accepted."},415);
  if (audio.size > 25 * 1024 * 1024) return json({ok:false,error:"Audio is larger than 25 MB."},413);

  const ip = String(request.headers.get("CF-Connecting-IP") || "anonymous");
  try {
    const limiter = env.API_LIMITER;
    if (limiter?.limit) {
      const result = await limiter.limit({key:"public-transcribe:"+ip});
      if (!result.success) return json({ok:false,error:"Voice service rate limit reached. Please try again shortly."},429);
    }
  } catch {}

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "adigun-audio.webm");
  upstream.append("model", env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  upstream.append("response_format", "json");

  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method:"POST",
      headers:{authorization:"Bearer " + env.OPENAI_API_KEY},
      body:upstream
    });
    const d = await r.json().catch(()=>({}));
    if (!r.ok) return json({ok:false,error:d?.error?.message || "Voice transcription failed."},502);
    return json({ok:true,text:String(d?.text || "").trim(),model:env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe"});
  } catch {
    return json({ok:false,error:"Voice transcription service is temporarily unavailable."},502);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const originHost = url.hostname.toLowerCase();

    if (url.pathname === "/api/chat" && request.method === "POST" && PUBLIC_HOSTS.has(originHost)) return publicSI.fetch(request, env);

    if (url.pathname === "/api/transcribe" && request.method === "OPTIONS" && PUBLIC_HOSTS.has(originHost)) {
      return preflight(originHost);
    }

    if (url.pathname === "/api/transcribe" && request.method === "POST" && PUBLIC_HOSTS.has(originHost)) {
      return publicTranscribe(request, env);
    }

    return legacy.fetch(request, env, ctx);
  }
};
