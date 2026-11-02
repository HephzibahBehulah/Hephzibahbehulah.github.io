// ADIGUN deployment verification marker — 2026-09-26
// Free Cloudflare Workers AI fallback is enabled when the primary provider is unavailable.
import { DurableObject } from "cloudflare:workers";
import legacy from "./worker-v2.js";
import {accountGateway} from "../../platform/admin-accounts.mjs";
import {boundSandboxOutput} from "../../platform/sandbox-limits.mjs";

const SANDBOX_INACTIVITY_TIMEOUT_MS=30*60*1000;
export class Sandbox extends DurableObject {
  constructor(ctx,env){
    super(ctx,env);
    if(ctx.container?.running)void ctx.blockConcurrencyWhile(()=>ctx.container.setInactivityTimeout(SANDBOX_INACTIVITY_TIMEOUT_MS));
  }
  get container(){
    const container=this.ctx.container;
    if(!container)throw new Error("Sandbox execution plane is not configured.");
    return container;
  }
  setup=null;
  async ensureRunning(actor){
    if(this.setup===null||!this.container.running){
      this.setup=this.startContainer(actor).catch(error=>{this.setup=null;throw error;});
    }
    return this.setup;
  }
  async startContainer(actor){
    if(!this.container.running)this.container.start({
      image:this.container.images.sandbox,
      instance:"lite",
      enableInternet:false,
      labels:{workload:"adigun-private-execution",actor:String(actor||"operator").slice(0,64)}
    });
    await this.container.setInactivityTimeout(SANDBOX_INACTIVITY_TIMEOUT_MS);
  }
  async runCommand(command,actor){
    await this.ensureRunning(actor);
    const process=await this.container.exec(["sh","-c","ulimit -t 5; exec "+command],{cwd:"/workspace"});
    let timer;
    const outputPromise=process.output();
    const timedOut=Symbol("sandbox-timeout");
    const timeoutPromise=new Promise(resolve=>{timer=setTimeout(()=>resolve(timedOut),10000);});
    let output=await Promise.race([outputPromise,timeoutPromise]);
    clearTimeout(timer);
    let timeoutExceeded=false;
    if(output===timedOut){
      timeoutExceeded=true;
      try{process.kill(9);}catch{}
      output=await outputPromise;
    }
    const cpuLimitExceeded=!timeoutExceeded&&[137,152].includes(output.exitCode);
    return {
      exitCode:output.exitCode,
      success:!timeoutExceeded&&!cpuLimitExceeded&&output.exitCode===0,
      timedOut:timeoutExceeded,
      cpuLimitExceeded,
      stdout:new TextDecoder().decode(output.stdout),
      stderr:new TextDecoder().decode(output.stderr)
    };
  }
}

const corsHeaders = request => {
  const origin = request.headers.get("origin") || "";
  const allowed = new Set([
    "https://hephzibahbehulah.com",
    "https://admin.hephzibahbehulah.com"
  ]);
  const headers = {
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-hb-session,x-adigun-key,x-hb-admin-key",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
  if (allowed.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
  }
  return headers;
};

const json = (request, body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...corsHeaders(request),
      ...extra
    }
  });

const MODEL = env => env.OPENAI_MODEL || "gpt-5.6-sol";
const MAX_CHAT_BODY = 24 * 1024 * 1024;

function createEvidenceId(prefix="EVD") {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14);
  const suffix = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2,10)).replace(/-/g,"").slice(0,8).toUpperCase();
  return prefix+"-"+stamp+"-"+suffix;
}

function evidenceRecord({tool,target,result,status="observed",actor=null,startedAt=null}) {
  return {
    evidenceId:createEvidenceId(tool.toUpperCase().replace(/[^A-Z0-9]+/g,"-").slice(0,12)||"EVD"),
    tool,
    target,
    status,
    actor,
    startedAt,
    observedAt:new Date().toISOString(),
    result
  };
}

function capabilityManifest(env, authenticated=false) {
  return {
    generatedAt:new Date().toISOString(),
    subject:authenticated ? "private-adigun" : "public-adigun",
    executionPolicy: authenticated ? "cloudflare-access-read-only-recon-plus-allow-listed-sandbox-execution" : "public-read-only",
    tools: {
      "http.inspect": {available:true,execution:true,mutation:false},
      "dns.lookup": {available:true,execution:true,mutation:false},
      "github.read": {available:true,execution:true,mutation:false},
      "security.inspect": {available:true,execution:true,mutation:false},
      "recon.passive": {available:true,execution:true,mutation:false,targetLocked:true,commandCount:RECON_COUNT},
      "python.execute": {available:true,execution:true,mutation:false,isolated:true},
      "shell.execute": {available:true,execution:true,mutation:false,isolated:true},
      "tls.inspect": {available:false,execution:false,mutation:false},
      "git.test": {available:false,execution:false,mutation:false},
      "security.safe-audit": {available:true,execution:true,mutation:false,targetLocked:true,safeReadOnly:true},
      "site.safe-audit": {available:true,execution:true,mutation:false,targetLocked:true},
      "github.source.read": {available:true,execution:true,mutation:false,targetLocked:true},
      "github.logs.read": {available:true,execution:true,mutation:false,targetLocked:true,redacted:true},
      "cloudflare.inspect": {available:false,execution:false,mutation:false},
      "github.write": {available:false,execution:false,mutation:true,approvalRequired:true},
      "production.deploy": {available:false,execution:false,mutation:true,approvalRequired:true}
    },
    providers: {
      openai: Boolean(env.OPENAI_API_KEY),
      openrouter: Boolean(env.OPENROUTER_API_KEY),
      cloudflareWorkersAI: Boolean(env.AI)
    },
    authorization: {
      authenticated,
      productionMutation:false,
      sandboxShell:true,
      productionShell:false,
      secretAccess:false,
      unrelatedTargetScanning:false
    }
  };
}
const ACCESS_JWKS_CACHE = new Map();
const ACCESS_CLOCK_SKEW_SECONDS = 60;

function base64urlToBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return bytes;
}

function decodeJwtPart(value) {
  return JSON.parse(new TextDecoder().decode(base64urlToBytes(value)));
}

function normalizeTeamDomain(value) {
  const raw = String(value || "").trim().replace(/\/+$/,"");
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.pathname !== "/" || u.search || u.hash) return "";
    return u.origin;
  } catch {
    return "";
  }
}

function getAccessConfig(env) {
  const teamDomain = normalizeTeamDomain(env?.ADIGUN_ACCESS_TEAM_DOMAIN || env?.TEAM_DOMAIN || "");
  const audience = String(env?.ADIGUN_ACCESS_AUD || env?.POLICY_AUD || "").trim();
  const configuredEmail = String(env?.ADIGUN_ADMIN_EMAIL || "").trim().toLowerCase();
  return { teamDomain, audience, configuredEmail };
}

async function getAccessJwk(teamDomain, kid) {
  const cacheKey = teamDomain + "|" + kid;
  const cached = ACCESS_JWKS_CACHE.get(cacheKey);
  if (cached) return cached;
  const promise = (async () => {
    const response = await fetch(teamDomain + "/cdn-cgi/access/certs", {
      headers: { "accept": "application/json" },
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    if (!response.ok) throw new Error("Cloudflare Access signing-key endpoint unavailable.");
    const body = await response.json();
    const key = Array.isArray(body?.keys) ? body.keys.find(item => item?.kid === kid) : null;
    if (!key || key.kty !== "RSA" || key.alg !== "RS256" || !key.n || !key.e) throw new Error("Cloudflare Access signing key not found.");
    return crypto.subtle.importKey(
      "jwk",
      { kty:"RSA", n:key.n, e:key.e, alg:"RS256", ext:true },
      { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" },
      false,
      ["verify"]
    );
  })();
  ACCESS_JWKS_CACHE.set(cacheKey,promise);
  try { return await promise; } catch (error) { ACCESS_JWKS_CACHE.delete(cacheKey); throw error; }
}

async function verifyCloudflareAccessJwt(request, env) {
  const token = String(request?.headers?.get("cf-access-jwt-assertion") || "").trim();
  if (!token) return { ok:false, error:"Cloudflare Access JWT assertion is missing." };

  const { teamDomain, audience, configuredEmail } = getAccessConfig(env);
  if (!teamDomain || !audience || !configuredEmail) {
    return { ok:false, status:503, error:"ADIGUN Access JWT validation is not configured." };
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some(part => !part)) return { ok:false, error:"Invalid Cloudflare Access JWT format." };

  try {
    const header = decodeJwtPart(parts[0]);
    const payload = decodeJwtPart(parts[1]);
    if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Cloudflare Access JWT signing method.");
    if (payload.iss !== teamDomain) throw new Error("Cloudflare Access JWT issuer mismatch.");
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(audience)) throw new Error("Cloudflare Access JWT audience mismatch.");
    const now = Math.floor(Date.now()/1000);
    if (!Number.isFinite(Number(payload.exp)) || Number(payload.exp) < now - ACCESS_CLOCK_SKEW_SECONDS) throw new Error("Cloudflare Access JWT is expired.");
    if (payload.nbf != null && Number(payload.nbf) > now + ACCESS_CLOCK_SKEW_SECONDS) throw new Error("Cloudflare Access JWT is not active yet.");
    const email = String(payload.email || "").trim().toLowerCase();
    if (!email || email !== configuredEmail) throw new Error("Cloudflare Access identity is not authorized for ADIGUN Control.");
    const key = await getAccessJwk(teamDomain, header.kid);
    const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
    const signature = base64urlToBytes(parts[2]);
    const valid = await crypto.subtle.verify({name:"RSASSA-PKCS1-v1_5"}, key, signature, data);
    if (!valid) throw new Error("Cloudflare Access JWT signature verification failed.");
    return { ok:true, identity:{email,name:String(payload.name||"ADIGUN Control"),groups:Array.isArray(payload.groups)?payload.groups:[]}, claims:{iss:payload.iss,aud:audiences,sub:payload.sub||null} };
  } catch (error) {
    return { ok:false, error:String(error?.message || "Invalid Cloudflare Access JWT.") };
  }
}

function getAdminIdentity(identity) {
  return {
    email: String(identity?.email || "").trim().toLowerCase(),
    name: String(identity?.name || "ADIGUN Control"),
    groups: Array.isArray(identity?.groups) ? identity.groups : []
  };
}

function getRequestActor(request, identity=null) {
  return String(identity?.email || "").trim().toLowerCase() || "authenticated-access-user";
}

function requireAdmin(request, env) {
  const url = new URL(request.url);
  if (url.hostname !== "admin.hephzibahbehulah.com") {
    return { ok:false, response:json(request,{ok:false,error:"Private control endpoint."},404) };
  }
  return { ok:true, pending:true };
}

async function authenticateAdmin(request, env) {
  const auth = requireAdmin(request, env);
  if (!auth.ok) return auth;
  const verified = await verifyCloudflareAccessJwt(request, env);
  if (!verified.ok) {
    const status = verified.status || 401;
    return { ok:false, response:json(request,{ok:false,authenticated:false,error:verified.error},status,{
      "cache-control":"no-store",
      "www-authenticate":"Cloudflare-Access"
    }) };
  }
  return { ok:true, identity:verified.identity, claims:verified.claims };
}

const SANDBOX_COMMANDS = Object.freeze({
  "pwd": "pwd",
  "ls": "ls -la /workspace",
  "whoami": "whoami",
  "uname": "uname -a",
  "python-version": "python3 --version",
  "node-version": "node --version",
  "git-version": "git --version",
  "date": "date -u",
  "disk": "df -h /workspace",
  "memory": "free -h",
  "os": "cat /etc/os-release",
  "runtime": "printf 'Python: '; python3 --version; printf 'Node: '; node --version; printf 'Git: '; git --version; printf 'PWD: '; pwd",
  "repo-status": "git -C /workspace status --short --branch"
});

const RECON_TARGET = "https://hephzibahbehulah.com";
const RECON_REPO = "HephzibahBehulah/HephzibahBehulah.github.io";

function githubApiHeaders(env) {
  const token = String(env?.GITHUB_TOKEN || "").trim();
  return {
    "accept":"application/vnd.github+json",
    "user-agent":"ADIGUN-Private-Intelligence",
    ...(token ? {"authorization":"Bearer "+token} : {})
  };
}

async function githubApiFetch(env, path) {
  const token = String(env?.GITHUB_TOKEN || "").trim();
  if (!token) throw new Error("GitHub private-repository access is not configured. Set the GITHUB_TOKEN Worker secret.");
  const response = await fetch("https://api.github.com"+path,{headers:githubApiHeaders(env),cf:{cacheTtl:30,cacheEverything:false}});
  const body = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error("GitHub API "+response.status+": "+String(body?.message||"request failed"));
  return body;
}

async function githubFetchText(env, path) {
  const token = String(env?.GITHUB_TOKEN || "").trim();
  if (!token) throw new Error("GitHub private-repository access is not configured.");
  const response = await fetch("https://api.github.com"+path,{headers:githubApiHeaders(env),redirect:"follow"});
  const text = await response.text();
  if (!response.ok) throw new Error("GitHub API "+response.status+": "+text.slice(0,240));
  return {status:response.status,text};
}

function redactSensitiveText(value) {
  let text=String(value||"");
  text=text.replace(/-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g,"[REDACTED_PRIVATE_KEY]");
  text=text.replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+\/-]+=*/gi,"[REDACTED_AUTH_HEADER]");
  text=text.replace(/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]+\b/g,"[REDACTED_GITHUB_TOKEN]");
  text=text.replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g,"[REDACTED_API_KEY]");
  text=text.replace(/(api[_-]?key|access[_-]?token|secret|password|passwd|client[_-]?secret)\s*[:=]\s*["']?[^\s"',;]+/gi,"$1=[REDACTED]");
  return text.slice(0,60000);
}

async function privateRepositoryInspection(env, task) {
  const tree=await githubApiFetch(env,"/repos/"+RECON_REPO+"/git/trees/main?recursive=1");
  const entries=Array.isArray(tree?.tree)?tree.tree.filter(x=>x?.type==="blob"&&x.path):[];
  const q=String(task||"").toLowerCase();
  const wanted = q.includes("frontend")||q.includes("front end")||q.includes("ui")||q.includes("browser")
    ? ["index.html","ai-agent.html","admin.html","admin-tools.html","js/adigun-agent.js","js/adigun-private-operator.js","js/ai-lab.js","css/ai-lab.css","css/adigun-admin.css"]
    : q.includes("backend")||q.includes("back end")||q.includes("api")||q.includes("worker")||q.includes("server")
    ? ["backend/workers/worker-openai.js","backend/workers/worker-public-v2.js","backend/workers/worker-v2.js","backend/src/worker.js","backend/ADIGUN-AUTOMATION.md","ARCHITECTURE.md"]
    : ["README.md","ARCHITECTURE.md","backend/workers/worker-openai.js","backend/workers/worker-public-v2.js","admin.html","index.html","js/adigun-agent.js","js/adigun-private-operator.js"];
  const available=new Set(entries.map(x=>x.path));
  const paths=[...new Set(wanted.filter(p=>available.has(p)))].slice(0,16);
  const files=[];
  for(const path of paths){
    try{
      const data=await githubApiFetch(env,"/repos/"+RECON_REPO+"/contents/"+path+"?ref=main");
      let content="";
      if(data?.encoding==="base64"&&data?.content) content=new TextDecoder().decode(Uint8Array.from(atob(String(data.content).replace(/\s+/g,"")),ch=>ch.charCodeAt(0)));
      else content=String(data?.content||"");
      files.push({path,size:Number(data?.size)||content.length,content:redactSensitiveText(content).slice(0,30000)});
    }catch(error){files.push({path,error:String(error?.message||error).slice(0,240)});}
  }
  const apiRoutes=[];
  for(const file of files) for(const m of String(file.content||"").matchAll(/["'](\/api\/[A-Za-z0-9_./:-]+)["']/g)) apiRoutes.push(m[1]);
  return {target:RECON_REPO,branch:"main",
    repositoryTree:{fileCount:entries.length,sourceFileCount:entries.filter(x=>/\.(html?|css|js|json|ya?ml|toml|md|py|sh)$/i.test(x.path)).length,topLevel:[...new Set(entries.map(x=>String(x.path).split("/")[0]))].slice(0,100)},
    selectedFiles:files,apiRoutes:[...new Set(apiRoutes)].slice(0,200),
    secretReferences:[...new Set(files.flatMap(f=>[...String(f.content||"").matchAll(/\benv\.(\w+)/g)].map(m=>m[1])))]
      .filter(n=>/KEY|TOKEN|SECRET|PASSWORD|AUTH|GITHUB|CLOUDFLARE|OPENAI|ACCESS/i.test(n)).slice(0,100)};
}

async function privateWorkflowLogInspection(env) {
  const runs=await githubApiFetch(env,"/repos/"+RECON_REPO+"/actions/runs?per_page=6");
  const reports=[];
  for(const run of (runs?.workflow_runs||[]).slice(0,6)){
    const jobs=await githubApiFetch(env,"/repos/"+RECON_REPO+"/actions/runs/"+run.id+"/jobs?per_page=20");
    const jobReports=[];
    for(const job of (jobs?.jobs||[]).slice(0,8)){
      let log=null;
      try{
        const raw=await githubFetchText(env,"/repos/"+RECON_REPO+"/actions/jobs/"+job.id+"/logs");
        log=redactSensitiveText(raw.text).split("\n").slice(-180).join("\n");
      }catch(error){log="[LOG_UNAVAILABLE] "+String(error?.message||error).slice(0,180);}
      jobReports.push({id:job.id,name:job.name,status:job.status,conclusion:job.conclusion,startedAt:job.started_at,completedAt:job.completed_at,logTail:log});
    }
    reports.push({runId:run.id,name:run.name,status:run.status,conclusion:run.conclusion,headSha:String(run.head_sha||"").slice(0,12),createdAt:run.created_at,jobs:jobReports});
  }
  return {target:RECON_REPO,runCount:reports.length,runs:reports};
}

const RECON_BASES = Object.freeze({
  "http-status": {category:"web",label:"HTTP status",description:"GET the authorized production homepage and report status, final URL and timing."},
  "http-headers": {category:"web",label:"HTTP headers",description:"Read all response headers from the authorized production homepage."},
  "http-body": {category:"web",label:"HTTP body",description:"Read a bounded copy of the authorized production homepage HTML."},
  "http-links": {category:"web",label:"HTTP links",description:"Extract same-site and external hyperlinks from the authorized homepage."},
  "http-scripts": {category:"web",label:"Scripts",description:"Extract JavaScript resources referenced by the authorized homepage."},
  "http-styles": {category:"web",label:"Stylesheets",description:"Extract stylesheet resources referenced by the authorized homepage."},
  "http-images": {category:"web",label:"Images",description:"Extract image resources referenced by the authorized homepage."},
  "http-forms": {category:"web",label:"Forms",description:"Inspect forms, methods and actions on the authorized homepage."},
  "http-headings": {category:"web",label:"Headings",description:"Extract H1-H4 headings from the authorized homepage."},
  "http-meta": {category:"web",label:"Meta",description:"Inspect title, description, robots, canonical and Open Graph metadata."},
  "http-title": {category:"web",label:"Title",description:"Read the document title from the authorized homepage."},
  "http-size": {category:"web",label:"Response size",description:"Measure the bounded HTML response size and report content-length when present."},
  "http-methods": {category:"web",label:"HTTP methods",description:"Check GET, HEAD and OPTIONS behavior for the authorized homepage."},
  "dns-a": {category:"dns",label:"DNS A",description:"Resolve A records for the authorized domain through Cloudflare DNS-over-HTTPS."},
  "dns-aaaa": {category:"dns",label:"DNS AAAA",description:"Resolve AAAA records for the authorized domain."},
  "dns-mx": {category:"dns",label:"DNS MX",description:"Resolve MX records for the authorized domain."},
  "dns-ns": {category:"dns",label:"DNS NS",description:"Resolve NS records for the authorized domain."},
  "dns-txt": {category:"dns",label:"DNS TXT",description:"Resolve TXT records for the authorized domain."},
  "dns-cname": {category:"dns",label:"DNS CNAME",description:"Resolve CNAME records for the authorized domain."},
  "dns-soa": {category:"dns",label:"DNS SOA",description:"Resolve SOA records for the authorized domain."},
  "dns-caa": {category:"dns",label:"DNS CAA",description:"Resolve CAA records for the authorized domain."},
  "dns-srv": {category:"dns",label:"DNS SRV",description:"Resolve SRV records for the authorized domain."},
  "dns-dmarc": {category:"dns",label:"DMARC",description:"Read the _dmarc TXT record for the authorized domain."},
  "dns-spf": {category:"dns",label:"SPF",description:"Read root TXT records and identify SPF records."},
  "dns-dnssec": {category:"dns",label:"DNSSEC",description:"Inspect DS and DNSKEY records for the authorized domain."},
  "security-headers": {category:"security",label:"Security headers",description:"Evaluate common browser security headers from the authorized site."},
  "security-cookies": {category:"security",label:"Cookies",description:"Inspect Set-Cookie response headers without exposing cookie values beyond a bounded diagnostic."},
  "security-csp": {category:"security",label:"Content Security Policy",description:"Inspect and summarize CSP presence."},
  "security-hsts": {category:"security",label:"HSTS",description:"Inspect Strict-Transport-Security."},
  "security-referrer": {category:"security",label:"Referrer Policy",description:"Inspect Referrer-Policy."},
  "security-permissions": {category:"security",label:"Permissions Policy",description:"Inspect Permissions-Policy."},
  "security-frame": {category:"security",label:"Frame protection",description:"Inspect X-Frame-Options and frame-ancestors in CSP."},
  "security-content-type": {category:"security",label:"Content type protection",description:"Inspect X-Content-Type-Options."},
  "security-cross-origin": {category:"security",label:"Cross-origin policies",description:"Inspect COOP, COEP and CORP response headers."},
  "robots": {category:"discovery",label:"robots.txt",description:"Read the authorized site's robots.txt."},
  "sitemap": {category:"discovery",label:"sitemap.xml",description:"Read the authorized site's sitemap.xml."},
  "security-txt": {category:"discovery",label:"security.txt",description:"Check standard security.txt locations on the authorized site."},
  "manifest": {category:"discovery",label:"Web manifest",description:"Check manifest.json and manifest.webmanifest."},
  "favicon": {category:"discovery",label:"Favicon",description:"Check common favicon locations."},
  "humans": {category:"discovery",label:"humans.txt",description:"Check humans.txt."},
  "llms": {category:"discovery",label:"llms.txt",description:"Check llms.txt."},
  "ai-txt": {category:"discovery",label:"AI policy text",description:"Check common AI crawler policy text locations."},
  "ads-txt": {category:"discovery",label:"ads.txt",description:"Check ads.txt."},
  "feed": {category:"discovery",label:"Feeds",description:"Check common RSS and Atom feed locations."},
  "well-known": {category:"discovery",label:"Well-known resources",description:"Check a curated set of standard .well-known resources."},
  "github-repo": {category:"github",label:"GitHub repository",description:"Read metadata for the authorized project repository."},
  "github-commits": {category:"github",label:"GitHub commits",description:"Read recent commits from the authorized project repository."},
  "github-branches": {category:"github",label:"GitHub branches",description:"Read branches from the authorized project repository."},
  "github-runs": {category:"github",label:"GitHub Actions",description:"Read recent workflow runs for the authorized project repository."},
  "github-releases": {category:"github",label:"GitHub releases",description:"Read recent releases from the authorized project repository."},
  "github-languages": {category:"github",label:"GitHub languages",description:"Read language statistics for the authorized project repository."},
  "github-contributors": {category:"github",label:"GitHub contributors",description:"Read contributor statistics for the authorized project repository."},
  "github-tags": {category:"github",label:"GitHub tags",description:"Read tags from the authorized project repository."},
  "edge": {category:"cloudflare",label:"Edge fingerprint",description:"Inspect Cloudflare edge indicators from the authorized site's response."},
  "site-health": {category:"overview",label:"Site health",description:"Run a compact live health check against the authorized site."},
  "site-assets": {category:"overview",label:"Site assets",description:"Inventory scripts, styles, images and links from the authorized homepage."},
  "site-links": {category:"overview",label:"Site links",description:"Inventory hyperlinks from the authorized homepage."},
  "site-summary": {category:"overview",label:"Site summary",description:"Run a compact passive reconnaissance summary for the authorized site."}
});

const RECON_VARIANTS = Object.freeze([
  "json","summary","details","inspect","check","verify","report","evidence","status",
  "raw","full","quick","audit","inventory","enumerate","fingerprint","snapshot",
  "diagnostic","observe"
]);

const RECON_COMMANDS = Object.freeze((() => {
  const out = {};
  for (const base of Object.keys(RECON_BASES)) {
    out[base] = base;
    for (const variant of RECON_VARIANTS) out[base+"-"+variant] = base;
  }
  return out;
})());

const RECON_COUNT = Object.keys(RECON_COMMANDS).length;

const HELP_CATEGORIES = Object.freeze({
  "overview": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="overview"),
  "web": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="web"),
  "dns": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="dns"),
  "security": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="security"),
  "discovery": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="discovery"),
  "github": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="github"),
  "cloudflare": Object.keys(RECON_BASES).filter(k=>RECON_BASES[k].category==="cloudflare")
});

function adminSandboxId(identity) {
  const email = String(identity?.email || "").trim().toLowerCase();
  const encoded = btoa(email).replace(/[^a-z0-9]/gi, "").slice(0,48).toLowerCase();
  return "adigun-admin-" + (encoded || "operator");
}

function getAdminSandbox(env, identity) {
  if (!env.Sandbox) throw new Error("Sandbox execution plane is not configured.");
  return env.Sandbox.getByName(adminSandboxId(identity));
}

function reconHelp(topic="overview") {
  const t=String(topic||"overview").trim().toLowerCase();
  const categoryLabels={overview:"SYSTEM & OVERVIEW",web:"WEB INTELLIGENCE",dns:"DNS & NETWORK NAMING",security:"SECURITY",discovery:"DISCOVERY",github:"GITHUB INTELLIGENCE",cloudflare:"CLOUDFLARE / EDGE"};

  if(t==="linux"||t==="sandbox"){
    const commands=Object.keys(SANDBOX_COMMANDS).map(command=>({command,description:"Allow-listed isolated Linux diagnostic command."}));
    return {ok:true,type:"help",category:"sandbox",label:"ISOLATED LINUX",count:commands.length,commands,usage:["help","help linux","help all"]};
  }

  if(t==="help"||t==="commands"||t==="all"){
    const categories=Object.fromEntries(Object.entries(HELP_CATEGORIES).map(([key,names])=>[key,{label:categoryLabels[key]||key.toUpperCase(),count:names.length,commands:names.map(name=>({command:name,description:RECON_BASES[name].description,aliases:RECON_VARIANTS.map(v=>name+"-"+v)}))}]));
    return {
      ok:true,type:"help",target:RECON_TARGET,count:RECON_COUNT,
      commandRegistry:{
        system:["help","commands","clear","history","status","version","config","exit"],
        reconnaissance:["recon","full-recon","site-summary",...HELP_CATEGORIES.overview],
        web:HELP_CATEGORIES.web,
        osint:HELP_CATEGORIES.discovery,
        network:HELP_CATEGORIES.dns,
        security:HELP_CATEGORIES.security,
        github:HELP_CATEGORIES.github,
        cloudflare:HELP_CATEGORIES.cloudflare,
        utilities:["encode","decode","hash","base64","timestamp","json","regex"]
      },
      categories,variants:RECON_VARIANTS,
      usage:["help","help <category>","help <command>","help all","help linux","commands","recon"],
      note:"Read-only reconnaissance is target-locked to the authorized Hephzibah Behulah site and its public GitHub repository. Linux commands are restricted to the isolated allow-list."
    };
  }

  const sandboxCommand=Object.keys(SANDBOX_COMMANDS).find(command=>command===t);
  if(sandboxCommand) return {ok:true,type:"help",category:"sandbox",command:sandboxCommand,description:"Allow-listed isolated Linux diagnostic command.",usage:[sandboxCommand]};

  for(const [category,names] of Object.entries(HELP_CATEGORIES)){
    if(names.includes(t)){
      const base=RECON_BASES[t];
      return {ok:true,type:"help",category,categoryLabel:categoryLabels[category]||category.toUpperCase(),command:t,description:base.description,aliases:RECON_VARIANTS.map(v=>t+"-"+v),target:RECON_TARGET,readOnly:true,usage:[t,...RECON_VARIANTS.slice(0,6).map(v=>t+"-"+v)]};
    }
  }

  const variantBase=RECON_COMMANDS[t];
  if(variantBase&&RECON_BASES[variantBase]){
    const base=RECON_BASES[variantBase];
    return {ok:true,type:"help",category:base.category,categoryLabel:categoryLabels[base.category]||base.category.toUpperCase(),command:t,baseCommand:variantBase,description:base.description,readOnly:true,usage:[t,variantBase]};
  }

  return {ok:false,type:"help",error:"Unknown help topic: "+t,suggestions:["help","help all",...Object.keys(HELP_CATEGORIES),...Object.keys(RECON_BASES).slice(0,20)]};
}

function makeDohUrl(name,type) {
  return "https://cloudflare-dns.com/dns-query?name="+encodeURIComponent(name)+"&type="+encodeURIComponent(type);
}

async function doh(name,type) {
  const response=await fetch(makeDohUrl(name,type),{headers:{"accept":"application/dns-json"}});
  const data=await response.json().catch(()=>({}));
  return {
    httpStatus:response.status,
    status:data.Status,
    name,
    type,
    answers:(data.Answer||[]).slice(0,50).map(a=>({name:a.name,type:a.type,data:a.data,ttl:a.TTL})),
    authority:(data.Authority||[]).slice(0,20).map(a=>({name:a.name,type:a.type,data:a.data,ttl:a.TTL}))
  };
}

async function fetchRecon(path, options={}) {
  const started=Date.now();
  const response=await fetch(RECON_TARGET+path,{redirect:"follow",...options});
  const headers=Object.fromEntries(response.headers);
  let body=null;
  if(options.method!=="HEAD" && options.readBody!==false) body=(await response.text()).slice(0,120000);
  return {httpStatus:response.status,ok:response.ok,finalUrl:response.url,durationMs:Date.now()-started,headers,body};
}

function parseHtml(html) {
  const text=String(html||"");
  const title=(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()||null;
  const links=[...text.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]).filter(Boolean);
  const scripts=[...text.matchAll(/<script\b[^>]*src\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]).filter(Boolean);
  const styles=[...text.matchAll(/<link\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]).filter(Boolean);
  const images=[...text.matchAll(/<img\b[^>]*src\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]).filter(Boolean);
  const headings=[...text.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({level:Number(m[1]),text:m[2].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()})).filter(x=>x.text);
  const forms=[...text.matchAll(/<form\b([^>]*)>/gi)].map(m=>{const a=m[1];return {method:(a.match(/\bmethod\s*=\s*["']?([^"'\s>]+)/i)||[])[1]||"GET",action:(a.match(/\baction\s*=\s*["']([^"']*)["']/i)||[])[1]||""};});
  const metas={};
  for(const m of text.matchAll(/<meta\b[^>]*>/gi)){
    const tag=m[0], name=(tag.match(/\bname\s*=\s*["']([^"']+)["']/i)||[])[1], property=(tag.match(/\bproperty\s*=\s*["']([^"']+)["']/i)||[])[1], content=(tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)||[])[1];
    if((name||property)&&content) metas[name||property]=content;
  }
  const canonical=(text.match(/<link\b[^>]*rel\s*=\s*["'][^"']*\bcanonical\b[^"']*["'][^>]*href\s*=\s*["']([^"']+)["']/i)||[])[1]||null;
  return {title,links:[...new Set(links)].slice(0,300),scripts:[...new Set(scripts)].slice(0,200),styles:[...new Set(styles)].slice(0,200),images:[...new Set(images)].slice(0,300),headings:headings.slice(0,100),forms:forms.slice(0,50),meta:metas,canonical};
}

async function githubJson(path) {
  const response=await fetch("https://api.github.com"+path,{headers:{"accept":"application/vnd.github+json","user-agent":"ADIGUN-Private-Intelligence"}});
  const data=await response.json().catch(()=>({}));
  return {httpStatus:response.status,ok:response.ok,data};
}

async function executeReconBase(base) {
  const started=new Date().toISOString();
  if(base==="site-health"||base==="http-status"){
    const r=await fetchRecon("/");
    return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,ok:r.ok,finalUrl:r.finalUrl,durationMs:r.durationMs}};
  }
  if(base==="http-headers"||base.startsWith("security-")||base==="edge"){
    const r=await fetchRecon("/",{method:"HEAD",readBody:false});
    const h=r.headers;
    if(base==="http-headers") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,headers:h}};
    if(base==="security-headers") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,checks:{
      hsts:h["strict-transport-security"]||null,csp:h["content-security-policy"]||null,xFrame:h["x-frame-options"]||null,xContentType:h["x-content-type-options"]||null,referrer:h["referrer-policy"]||null,permissions:h["permissions-policy"]||null,coop:h["cross-origin-opener-policy"]||null,coep:h["cross-origin-embedder-policy"]||null,corp:h["cross-origin-resource-policy"]||null
    }}};
    if(base==="security-cookies") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,setCookie:h["set-cookie"]||null}};
    const map={"security-csp":"content-security-policy","security-hsts":"strict-transport-security","security-referrer":"referrer-policy","security-permissions":"permissions-policy","security-content-type":"x-content-type-options"};
    if(map[base]) return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,header:map[base],value:h[map[base]]||null,present:Boolean(h[map[base]])}};
    if(base==="security-frame") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,xFrameOptions:h["x-frame-options"]||null,cspFrameAncestors:(h["content-security-policy"]||"").match(/frame-ancestors[^;]*/i)?.[0]||null}};
    if(base==="security-cross-origin") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,coop:h["cross-origin-opener-policy"]||null,coep:h["cross-origin-embedder-policy"]||null,corp:h["cross-origin-resource-policy"]||null}};
    return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,cloudflareRay:h["cf-ray"]||null,server:h.server||null,edgeIndicators:{cfRay:Boolean(h["cf-ray"]),serverCloudflare:String(h.server||"").toLowerCase().includes("cloudflare")}}};
  }
  if(base.startsWith("http-")||base==="site-assets"||base==="site-links"||base==="http-meta"||base==="http-title"||base==="http-size"){
    const r=await fetchRecon("/");
    const parsed=parseHtml(r.body);
    if(base==="http-body") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,body:r.body}};
    if(base==="http-links"||base==="site-links") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,links:parsed.links}};
    if(base==="http-scripts") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,scripts:parsed.scripts}};
    if(base==="http-styles") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,styles:parsed.styles}};
    if(base==="http-images") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,images:parsed.images}};
    if(base==="http-forms") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,forms:parsed.forms}};
    if(base==="http-headings") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,headings:parsed.headings}};
    if(base==="http-meta") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,title:parsed.title,meta:parsed.meta,canonical:parsed.canonical}};
    if(base==="http-title") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,title:parsed.title}};
    if(base==="http-size") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,contentLength:r.headers["content-length"]||null,measuredBodyBytes:new TextEncoder().encode(r.body||"").length}};
    if(base==="site-assets") return {target:RECON_TARGET,result:{httpStatus:r.httpStatus,scripts:parsed.scripts,styles:parsed.styles,images:parsed.images}};
  }
  if(base==="http-methods"){
    const [get,head,options]=await Promise.all([
      fetchRecon("/",{readBody:false}),
      fetchRecon("/",{method:"HEAD",readBody:false}),
      fetchRecon("/",{method:"OPTIONS",readBody:false})
    ]);
    return {target:RECON_TARGET,result:{GET:get.httpStatus,HEAD:head.httpStatus,OPTIONS:options.httpStatus}};
  }
  const dnsTypes={"dns-a":1,"dns-aaaa":28,"dns-mx":15,"dns-ns":2,"dns-txt":16,"dns-cname":5,"dns-soa":6,"dns-caa":257,"dns-srv":33};
  if(dnsTypes[base]) return {target:RECON_TARGET,result:await doh("hephzibahbehulah.com",dnsTypes[base])};
  if(base==="dns-dmarc") return {target:RECON_TARGET,result:await doh("_dmarc.hephzibahbehulah.com",16)};
  if(base==="dns-spf"){
    const d=await doh("hephzibahbehulah.com",16);
    return {target:RECON_TARGET,result:{...d,spf:d.answers.filter(a=>String(a.data||"").toLowerCase().includes("v=spf1"))}};
  }
  if(base==="dns-dnssec"){
    const [ds,dnskey]=await Promise.all([doh("hephzibahbehulah.com",43),doh("hephzibahbehulah.com",48)]);
    return {target:RECON_TARGET,result:{DS:ds,DNSKEY:dnskey}};
  }
  const fixedPaths={
    "robots":["/robots.txt"],"sitemap":["/sitemap.xml"],"security-txt":["/.well-known/security.txt","/security.txt"],
    "manifest":["/manifest.json","/manifest.webmanifest"],"favicon":["/favicon.ico","/favicon.svg"],
    "humans":["/humans.txt"],"llms":["/llms.txt"],"ai-txt":["/ai.txt","/ai-policy.txt"],
    "ads-txt":["/ads.txt"],"feed":["/feed.xml","/rss.xml","/atom.xml"],
    "well-known":["/.well-known/change-password","/.well-known/assetlinks.json","/.well-known/apple-app-site-association"]
  };
  if(fixedPaths[base]){
    const results=await Promise.all(fixedPaths[base].map(async path=>{
      try{const r=await fetchRecon(path,{readBody:true});return {path,httpStatus:r.httpStatus,ok:r.ok,finalUrl:r.finalUrl,content:String(r.body||"").slice(0,30000)};}
      catch(error){return {path,error:String(error?.message||error)};}
    }));
    return {target:RECON_TARGET,result:{checks:results}};
  }
  const gh={
    "github-repo":"/repos/"+RECON_REPO,
    "github-commits":"/repos/"+RECON_REPO+"/commits?per_page=20",
    "github-branches":"/repos/"+RECON_REPO+"/branches?per_page=50",
    "github-runs":"/repos/"+RECON_REPO+"/actions/runs?per_page=20",
    "github-releases":"/repos/"+RECON_REPO+"/releases?per_page=20",
    "github-languages":"/repos/"+RECON_REPO+"/languages",
    "github-contributors":"/repos/"+RECON_REPO+"/contributors?per_page=50",
    "github-tags":"/repos/"+RECON_REPO+"/tags?per_page=50"
  };
  if(gh[base]){
    const r=await githubJson(gh[base]);
    return {target:RECON_REPO,result:r};
  }
  if(base==="site-summary"||base==="site-assets"||base==="site-links"){
    const names=["site-health","security-headers","dns-a","dns-aaaa","dns-mx","dns-ns","dns-txt","robots","sitemap","http-meta","http-links","http-scripts","http-styles","edge","github-repo"];
    const rows=await Promise.all(names.map(async name=>({command:name,...await executeReconBase(name)})));
    return {target:RECON_TARGET,result:{checks:rows}};
  }
  throw new Error("Unknown reconnaissance operation: "+base);
}

function reconEvidence(base,data,actor) {
  return evidenceRecord({
    tool:"recon."+base,
    target:RECON_TARGET,
    actor,
    status:"observed",
    startedAt:data.startedAt,
    result:data.result
  });
}

async function executeReconCommand(request, command) {
  const raw=String(command||"").trim();
  if(!raw) return json(request,{ok:false,error:"Enter a command. Type help to see the reconnaissance catalog."},400);
  const lower=normalizeAdminCommand(raw);
  if(lower==="help"||lower==="commands") return json(request,reconHelp("overview"));
  if(lower.startsWith("help ")) return json(request,reconHelp(lower.slice(5)));
  if(lower==="recon"||lower==="full-recon"||lower==="recon-all"){
    const started=Date.now();
    const names=["site-health","security-headers","dns-a","dns-aaaa","dns-mx","dns-ns","dns-txt","dns-caa","dns-dnssec","robots","sitemap","security-txt","http-meta","http-links","http-scripts","http-styles","http-headings","edge","github-repo","github-commits","github-runs"];
    const rows=await Promise.all(names.map(async name=>{try{return {command:name,...await executeReconBase(name)};}catch(error){return {command:name,error:String(error?.message||error)};}}));
    const evidence=evidenceRecord({tool:"recon.full",target:RECON_TARGET,actor:getRequestActor(request),status:"observed",startedAt:new Date(started).toISOString(),result:{checks:rows}});
    return json(request,{ok:true,command:raw,label:"Full passive reconnaissance",durationMs:Date.now()-started,result:{checks:rows},evidence});
  }
  const base=RECON_COMMANDS[lower];
  if(!base) return null;
  const started=new Date().toISOString();
  try{
    const data=await executeReconBase(base);
    const evidence=reconEvidence(base,{...data,startedAt:started},getAdminIdentity().email);
    return json(request,{ok:true,command:raw,baseCommand:base,label:RECON_BASES[base].label,description:RECON_BASES[base].description,target:RECON_TARGET,durationMs:Date.now()-new Date(started).getTime(),result:data.result,evidence});
  }catch(error){
    return json(request,{ok:false,command:raw,baseCommand:base,error:String(error?.message||error),durationMs:Date.now()-new Date(started).getTime()},502);
  }
}

function normalizeAdminCommand(command) {
  const raw=String(command||"").trim().toLowerCase().replace(/\s+/g," ");
  const aliases=Object.freeze({"dns-lookup":"dns-a","dns lookup":"dns-a","site-headers":"http-headers","site-robots":"robots","site-sitemap":"sitemap","repository-status":"github-repo","repo-status":"github-repo","github-status":"github-repo","cf":"edge","cloudflare-edge":"edge"});
  return aliases[raw] || raw;
}
async function executeAdminCommand(request, env, command) {
  const raw=String(command||"").trim();
  if(!raw) return json(request,{ok:false,error:"Enter a command. Type help to see the command registry."},400);
  const lower=raw.toLowerCase();
  if(lower==="help"||lower==="commands"||lower.startsWith("help ")) return executeReconCommand(request,lower);
  const recon=await executeReconCommand(request,lower);
  if(recon) return recon;
  const identity={...getAdminIdentity(),email:getRequestActor(request)};
  const shellCommand=SANDBOX_COMMANDS[lower];
  if(!shellCommand) return json(request,{ok:false,error:"Unknown command. Type HELP to see the command registry.",available:["help","commands",...Object.keys(SANDBOX_COMMANDS),...Object.keys(RECON_COMMANDS)]},400);
  return executeSandboxCommand(request,env,null,lower);
}

async function executeSandboxCommand(request, env, ctx, command) {
  const recon=await executeReconCommand(request,command);
  if(recon) return recon;
  const identity={...getAdminIdentity(),email:getRequestActor(request)};
  const shellCommand=SANDBOX_COMMANDS[command];
  if(!shellCommand) return json(request,{ok:false,error:"Unknown command. Type help for the reconnaissance catalog.",available:["help","recon",...Object.keys(SANDBOX_COMMANDS),...Object.keys(RECON_COMMANDS)]},400);
  const started=Date.now();
  try{
    const sandbox=await getAdminSandbox(env,identity);…58645 tokens truncated…complete. Cloudflare deploy runs as the configured deploy command.');
