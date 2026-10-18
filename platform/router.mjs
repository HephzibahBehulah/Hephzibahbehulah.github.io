const ROOT='hephzibahbehulah.com';
const ADMIN='admin.'+ROOT;
const PUBLIC=new Map([['engineering.'+ROOT,'engineering'],['cyber.'+ROOT,'cyber']]);
const PRIVATE=new Set([ROOT,'www.'+ROOT,ADMIN]);
const reply=(status,message)=>new Response(message,{status,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});

export function resolveRoute(url){
  const host=url.hostname.toLowerCase(),path=url.pathname;
  if(!PUBLIC.has(host)&&!PRIVATE.has(host))return {kind:'reject',status:404};
  let decoded;try{decoded=decodeURIComponent(path);}catch{return {kind:'reject',status:400};}
  if(decoded.includes('\\')||decoded.split('/').some(x=>x==='..'||x==='.')||decoded.includes('\0')||decoded.startsWith('/_apps/'))return {kind:'reject',status:404};
  const privateHost=PRIVATE.has(host);
  if(path.startsWith('/_hb/'))return {kind:'shared',privateHost,path};
  if(path==='/api/engineering/chat'||path==='/api/engineering/health')return {kind:'engineering-ai',privateHost};
  if(path==='/api/cyber/chat')return {kind:'cyber-ai',privateHost};
  if(!privateHost&&path.startsWith('/api/'))return {kind:'reject',status:404};
  let app=PUBLIC.get(host),prefix='';
  if(privateHost){
    for(const name of ['engineering','cyber'])if(path==='/'+name||path.startsWith('/'+name+'/')){app=name;prefix='/'+name;break;}
    if(!app)return {kind:'legacy',privateHost:true};
  }
  if(prefix&&path===prefix)return {kind:'redirect',privateHost,location:prefix+'/'};
  const relative=path.slice(prefix.length)||'/';
  if(app==='engineering'&&relative==='/voltpro-plc')return {kind:'redirect',privateHost,location:prefix+'/voltpro-plc/'};
  if(relative.endsWith('.html'))return {kind:'redirect',privateHost,location:(prefix+relative.replace(/\/index\.html$/,'/').replace(/\.html$/,''))||'/'};
  const asset=relative.endsWith('/')?relative+'index.html':/\.[^/]+$/.test(relative)?relative:relative+'.html';
  return {kind:'app',privateHost,app,prefix,base:prefix+asset.slice(0,asset.lastIndexOf('/')+1),path:'/_apps/'+app+asset};
}

export function createPlatform({legacy,verifyAdmin,engineeringAI,cyberAI}){
  return {async fetch(request,env,ctx){
    const url=new URL(request.url),route=resolveRoute(url);
    if(route.kind==='reject')return reply(route.status,'Not found');
    if(route.privateHost){
      const verified=await verifyAdmin(request,env);
      if(!verified.ok)return reply(verified.status||401,'Private workspace. Sign in through Cloudflare Access.');
    }
    if(route.kind==='redirect'){const next=new URL(route.location,url);next.search=url.search;return Response.redirect(next.toString(),308);}
    if(route.kind==='cyber-ai')return cyberAI.fetch(request,env,ctx);
    if(route.kind==='engineering-ai'){
      const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return reply(403,'Origin not allowed');
      if(!env.ENGINEERING_LIMITER?.limit)return reply(503,'Engineering request limiter is not configured');
      const next=new URL(request.url);next.pathname=url.pathname.endsWith('/health')?'/health':'/chat';
      const headers=new Headers(request.headers);headers.set('origin','https://'+url.hostname);
      return engineeringAI.fetch(new Request(next, {...request,method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,duplex:'half'}),{...env,API_LIMITER:env.ENGINEERING_LIMITER},ctx);
    }
    if(route.kind==='legacy'){
      // Preserve the existing root portfolio and all private tools. Existing
      // admin APIs keep their established hostname and authorization checks.
      const response=await legacy.fetch(request,env,ctx);
      const headers=new Headers(response.headers);headers.set('cache-control','private, no-store');headers.set('x-robots-tag','noindex, nofollow, noarchive');
      let result=new Response(response.body,{status:response.status,headers});
      if(response.ok&&headers.get('content-type')?.includes('text/html')&&typeof HTMLRewriter!=='undefined')result=new HTMLRewriter().on('head',{element(el){el.append('<link rel="stylesheet" href="/_hb/platform.css"><script src="/_hb/platform.js" defer></script>',{html:true});}}).transform(result);
      return result;
    }
    if(!['GET','HEAD'].includes(request.method))return reply(405,'Method not allowed');
    const next=new URL(request.url);next.pathname=route.path;
    const response=await env.ASSETS.fetch(new Request(next,{method:request.method,headers:request.headers}));
    const headers=new Headers(response.headers);headers.set('x-content-type-options','nosniff');
    if(route.privateHost){headers.set('cache-control','private, no-store');headers.set('x-robots-tag','noindex, nofollow, noarchive');}
    let result=new Response(response.body,{status:response.status,headers});
    if(route.kind==='app'&&response.ok&&headers.get('content-type')?.includes('text/html')&&typeof HTMLRewriter!=='undefined'){
      const base=route.base;
      result=new HTMLRewriter().on('head',{element(el){el.prepend('<base href="'+base+'"><link rel="stylesheet" href="/_hb/platform.css"><script src="/_hb/platform.js" defer></script>',{html:true});}}).transform(result);
    }
    return result;
  }};
}
