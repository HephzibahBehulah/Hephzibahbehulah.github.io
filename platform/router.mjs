import {publicAuth} from './public-auth.mjs';
import {publicServiceWorker} from './public-sw.mjs';
const ROOT='hephzibahbehulah.com';
const ADMIN='admin.'+ROOT;
const PUBLIC=new Map([['engineering.'+ROOT,'engineering'],['cyber.'+ROOT,'cyber']]);
const PRIVATE=new Set([ADMIN]);
const WORKERS_DEV='hephzibahbehulah-github-io.hephzibah-behulah.workers.dev';
const MAIN=new Set([ROOT,'www.'+ROOT]);
const reply=(status,message)=>new Response(message,{status,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});

export function resolveRoute(url){
  const host=url.hostname.toLowerCase(),path=url.pathname;
  if(host==='www.'+ROOT)return {kind:'redirect',privateHost:false,location:'https://'+ROOT+path};
  if(host===WORKERS_DEV)return {kind:'redirect',privateHost:false,location:'https://'+ROOT+path};
  if(!PUBLIC.has(host)&&!PRIVATE.has(host)&&!MAIN.has(host))return {kind:'reject',status:404};
  let decoded;try{decoded=decodeURIComponent(path);}catch{return {kind:'reject',status:400};}
  if(decoded.includes('\\')||decoded.split('/').some(x=>x==='..'||x==='.')||decoded.includes('\0')||decoded.startsWith('/_apps/'))return {kind:'reject',status:404};
  const privateHost=PRIVATE.has(host);
  if(!privateHost&&(decoded.startsWith('/api/admin/')||['/admin','/admin/','/admin.html','/admin-tools.html','/api/automation/demo'].includes(decoded)))return {kind:'reject',status:404};
  if(!privateHost&&path.startsWith('/api/member/'))return {kind:'member',privateHost:false};
  if(!privateHost&&['/account','/account/','/account.html'].includes(path))return {kind:'account',privateHost:false};
  if(!privateHost&&decoded==='/_hb/admin-accounts-ui.js')return {kind:'reject',status:404};
  if(path.startsWith('/_hb/'))return {kind:'shared',privateHost,path};
  if(path==='/api/engineering/chat'||path==='/api/engineering/health')return {kind:'engineering-ai',privateHost};
  if(path==='/api/cyber/chat')return {kind:'cyber-ai',privateHost};
  if(privateHost&&['/api/admin/accounts','/api/admin/accounts/events','/api/admin/accounts/operations'].includes(path))return {kind:'admin-accounts',privateHost:true};
  if(!privateHost&&path.startsWith('/api/')&&!MAIN.has(host))return {kind:'reject',status:404};
  if(MAIN.has(host))return {kind:'legacy',privateHost:false};
  let app=PUBLIC.get(host),prefix='';
  if(privateHost){
    for(const name of ['engineering','cyber'])if(path==='/'+name||path.startsWith('/'+name+'/')){app=name;prefix='/'+name;break;}
    if(!app)return {kind:'legacy',privateHost:true};
  }
  if(prefix&&path===prefix)return {kind:'redirect',privateHost,location:prefix+'/'};
  const relative=path.slice(prefix.length)||'/';
  if(app==='engineering'&&/^\/voltpro-electcad(?:\/|$)/i.test(relative)){
    const suffix=relative.slice('/voltPro-ElectCAD'.length);
    if(!suffix)return {kind:'redirect',privateHost,location:prefix+'/voltPro-ElectCAD/'};
    const assetSuffix=suffix==='/'?'/index.html':suffix;
    return {kind:'app',privateHost,app,prefix,base:prefix+'/voltPro-ElectCAD/',path:'/_apps/engineering/voltpro-electcad'+assetSuffix};
  }
  if(app==='engineering'&&relative==='/voltpro-plc')return {kind:'redirect',privateHost,location:prefix+'/voltpro-plc/'};
  if(relative.endsWith('.html'))return {kind:'redirect',privateHost,location:(prefix+relative.replace(/\/index\.html$/,'/').replace(/\.html$/,''))||'/'};
  const asset=app==='engineering'&&relative==='/workspace'?'/account.html':relative.endsWith('/')?relative+'index.html':/\.[^/]+$/.test(relative)?relative:relative+'.html';
  return {kind:'app',privateHost,app,prefix,base:prefix+asset.slice(0,asset.lastIndexOf('/')+1),path:'/_apps/'+app+asset};
}

export function createPlatform({legacy,verifyAdmin,engineeringAI,cyberAI,accountAdmin,memberAuth=publicAuth}){
  return {async fetch(request,env,ctx){
    const url=new URL(request.url),route=resolveRoute(url);
    if(route.kind==='reject')return reply(route.status,'Not found');
    if(!route.privateHost&&['GET','HEAD'].includes(request.method)&&/\/(?:sw|service-worker|serviceworker)\.js$/.test(url.pathname))return new Response(request.method==='HEAD'?null:publicServiceWorker,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'}});
    if(route.kind==='member')return memberAuth.endpoint(request,env);
    if(route.kind==='account'){
      if(url.hostname!==ROOT){const target=new URL('https://'+ROOT+'/account');let destination=new URL(url.searchParams.get('next')||'/',url.origin);if(destination.origin!==url.origin)destination=new URL(url.origin+'/');target.searchParams.set('next',destination.href);return Response.redirect(target,302);}
      const asset=new URL(request.url);asset.pathname='/_hb/account.html';return env.ASSETS.fetch(new Request(asset,{method:request.method,headers:request.headers}));
    }
    if(route.privateHost){
      const verified=await verifyAdmin(request,env);
      if(!verified.ok){console.warn('HB_PRIVATE_ACCESS_DENIED',verified.code||'configuration_or_identity_rejected');return reply(verified.status||401,'Private workspace. Sign in through Cloudflare Access.');}
    }
    if(['GET','HEAD'].includes(request.method)&&(route.privateHost||route.kind==='app'&&route.path.endsWith('.html'))){const headers=new Headers(request.headers);headers.delete('if-none-match');headers.delete('if-modified-since');request=new Request(request,{headers});}
    if(route.privateHost&&['GET','HEAD'].includes(request.method)&&/\/(?:sw|service-worker|serviceworker)\.js$/.test(url.pathname))return new Response(request.method==='HEAD'?null:"self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())await caches.delete(key);await self.registration.unregister();})()));",{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'private, no-store','x-robots-tag':'noindex, nofollow, noarchive'}});
    if(route.kind==='redirect'){const next=new URL(route.location,url);next.search=url.search;return Response.redirect(next.toString(),308);}
    let visit;
    const isPage=route.kind==='app'&&route.path.endsWith('.html')||route.kind==='legacy'&&!/\.[a-z0-9]+$/i.test(url.pathname)||route.kind==='legacy'&&url.pathname.endsWith('.html');
    if(!route.privateHost&&(isPage||url.pathname.startsWith('/api/'))){
      try{visit=await memberAuth.gate(request,env);}catch{return reply(503,'Public account sessions are temporarily unavailable. Please retry.');}
      if(!visit.allowed){if(url.pathname.startsWith('/api/'))return Response.json({error:'Sign in to continue',account:'https://'+ROOT+'/account'},{status:401,headers:{'cache-control':'no-store'}});const target=new URL('https://'+ROOT+'/account');target.searchParams.set('next',url.href);return Response.redirect(target,302);}
    }
    const withVisit=response=>{if(!visit?.cookie)return response;const headers=new Headers(response.headers);headers.append('set-cookie',visit.cookie);return new Response(response.body,{status:response.status,headers});};
    if(route.kind==='cyber-ai')return withVisit(await cyberAI.fetch(request,env,ctx));
    if(route.kind==='admin-accounts')return accountAdmin(request,env,ctx);
    if(route.kind==='engineering-ai'){
      const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return reply(403,'Origin not allowed');
      if(!env.ENGINEERING_LIMITER?.limit)return reply(503,'Engineering request limiter is not configured');
      const next=new URL(request.url);next.pathname=url.pathname.endsWith('/health')?'/health':'/chat';
      const headers=new Headers(request.headers);headers.set('origin','https://'+url.hostname);
      return withVisit(await engineeringAI.fetch(new Request(next, {...request,method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,duplex:'half'}),{...env,API_LIMITER:env.ENGINEERING_LIMITER},ctx));
    }
    if(route.kind==='legacy'){
      // Preserve the existing root portfolio and all private tools. Existing
      // admin APIs keep their established hostname and authorization checks.
      // Asset HTML handling is disabled so application mounts keep their own
      // routing. Explicitly resolve the original main-domain landing file.
      let legacyRequest=request;
      if(url.hostname!==ADMIN&&url.pathname==='/'&&['GET','HEAD'].includes(request.method)){
        const landing=new URL(request.url);landing.pathname='/index.html';
        legacyRequest=new Request(landing,request);
      }
      const response=await legacy.fetch(legacyRequest,env,ctx);
      const headers=new Headers(response.headers);headers.set('cache-control','private, no-store');if(route.privateHost)headers.set('x-robots-tag','noindex, nofollow, noarchive');if(visit?.cookie)headers.append('set-cookie',visit.cookie);
      if(headers.get('content-type')?.includes('text/html')){headers.delete('etag');headers.delete('last-modified');headers.delete('content-length');}
      let result=new Response(response.body,{status:response.status,headers});
      const legacyBase=route.privateHost&&/^\/(?:admin\/)?cyber-os(?:\/|$)/.test(url.pathname)?'/cyber-os/':'/';
      if(response.ok&&headers.get('content-type')?.includes('text/html')&&typeof HTMLRewriter!=='undefined')result=new HTMLRewriter().on('head',{element(el){el.prepend('<base href="'+legacyBase+'"><link rel="stylesheet" href="/_hb/platform.css"><link rel="stylesheet" href="/_hb/member.css">'+(!route.privateHost?'<script src="/_hb/member.js" defer></script>':'')+'<script src="/_hb/platform.js" defer></script><link rel="stylesheet" href="/_hb/experience.css"><script src="/_hb/experience.js" defer></script>'+(!route.privateHost?'<script src="/js/language-system.js" defer></script>':''),{html:true});}}).transform(result);
      return result;
    }
    if(!['GET','HEAD'].includes(request.method))return reply(405,'Method not allowed');
    const next=new URL(request.url);next.pathname=route.path;
    const response=await env.ASSETS.fetch(new Request(next,{method:request.method,headers:request.headers}));
    const headers=new Headers(response.headers);headers.set('x-content-type-options','nosniff');
    if(visit?.cookie)headers.append('set-cookie',visit.cookie);
    if(route.kind==='app'&&headers.get('content-type')?.includes('text/html')){headers.delete('etag');headers.delete('last-modified');headers.delete('content-length');headers.set('cache-control','private, no-store');}
    if(route.privateHost){headers.set('cache-control','private, no-store');headers.set('x-robots-tag','noindex, nofollow, noarchive');}
    let result=new Response(response.body,{status:response.status,headers});
    if(route.kind==='app'&&response.ok&&headers.get('content-type')?.includes('text/html')&&typeof HTMLRewriter!=='undefined'){
      const base=route.base;
      result=new HTMLRewriter().on('head',{element(el){el.prepend('<base href="'+base+'"><link rel="stylesheet" href="/_hb/platform.css"><link rel="stylesheet" href="/_hb/member.css">'+(!route.privateHost?'<script src="/_hb/member.js" defer></script>':'')+'<script src="/_hb/platform.js" defer></script><link rel="stylesheet" href="/_hb/experience.css"><script src="/_hb/experience.js" defer></script>'+(!route.privateHost?'<script src="/js/language-system.js" defer></script>':''),{html:true});}}).transform(result);
    }
    return result;
  }};
}
