const ROOT='hephzibahbehulah.com';
export const PUBLIC_ORIGINS=new Set(['https://'+ROOT,'https://engineering.'+ROOT,'https://cyber.'+ROOT]);
const AUTH='https://vnckoocsookbaqalybje.supabase.co/auth/v1';
const KEY='sb_publishable_7S5ZCRmIigdU3-aC9PEBuA_EF6lOdAF';
const encode=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decode=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
export function safeReturn(value){try{const u=new URL(value||'/', 'https://'+ROOT);return PUBLIC_ORIGINS.has(u.origin)&&!u.pathname.startsWith('/account')?u.href:'https://'+ROOT+'/';}catch{return 'https://'+ROOT+'/';}}
export function createPublicAuth({fetcher=fetch,now=()=>Date.now()}={}){
 const cache=new Map();
 async function key(env){if(!env.HB_PUBLIC_SESSION_KEY)throw Error('Public account sessions are not configured');const value=env.HB_PUBLIC_SESSION_KEY;if(!cache.has(value)){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));cache.clear();cache.set(value,crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt','decrypt']));}return cache.get(value);}
 async function seal(data,env){const iv=crypto.getRandomValues(new Uint8Array(12)),body=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('hb-public-v1')},await key(env),new TextEncoder().encode(JSON.stringify(data)));return encode(iv)+'.'+encode(body);}
 async function unseal(value,env){try{const [iv,body]=String(value||'').split('.');return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv),additionalData:new TextEncoder().encode('hb-public-v1')},await key(env),decode(body))));}catch{return null;}}
 const cookie=(request,name)=>request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
 const setCookie=(name,value,clear=false)=>name+'='+value+'; Domain='+ROOT+'; Path=/; Secure; HttpOnly; SameSite=Lax'+(clear?'; Max-Age=0':'');
 async function state(request,env){const stored=cookie(request,'__Secure-hb-member'),member=await unseal(stored,env);if(member?.kind==='member'&&member.active>now()-7200000&&member.active<=now()+60000)return {member};const trial=await unseal(cookie(request,'__Secure-hb-visit'),env);return {member:null,expired:!!stored,deadline:trial?.kind==='visit'?trial.deadline:null};}
 async function provider(path,body,token,method){const r=await fetcher(AUTH+path,{method:method||(body===undefined?'GET':'POST'),headers:{apikey:KEY,'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(20000)});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.msg||data.message||data.error_description||'Account request failed. Please retry.');return data;}
 async function validSession(member){let current=member;if(member.expires<now()+60000){const r=await provider('/token?grant_type=refresh_token',{refresh_token:member.refresh});current={...member,access:r.access_token,refresh:r.refresh_token,expires:now()+r.expires_in*1000};}const user=await provider('/user',undefined,current.access);return {current,user};}
 async function endpoint(request,env){
  const url=new URL(request.url),operation=url.pathname.split('/').pop();
  const headers=new Headers({'content-type':'application/json','cache-control':'private, no-store','x-content-type-options':'nosniff'});
  const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(!['GET','POST'].includes(request.method))return respond({error:'Method not allowed'},405);
  if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return respond({error:'Origin not allowed'},403);
  if(!PUBLIC_ORIGINS.has(url.origin))return respond({error:'Not found'},404);
  if(!['session','activity','logout'].includes(operation)&&url.hostname!==ROOT)return respond({error:'Use the main account page'},403);
  if(env.API_LIMITER?.limit&&!(await env.API_LIMITER.limit({key:'public-account:'+operation+':'+(request.headers.get('cf-connecting-ip')||'unknown')})).success)return respond({error:'Please wait before trying again'},429);
  try{
   const existing=await state(request,env);
   if(operation==='session'&&request.method==='GET'){
    if(!existing.member)return respond({authenticated:false,requires_signin:existing.expired,deadline:existing.deadline});
    if(request.headers.get('x-hb-tab')!==existing.member.tab)return respond({authenticated:false,requires_signin:true},401);
    const {current,user}=await validSession(existing.member);headers.append('set-cookie',setCookie('__Secure-hb-member',await seal(current,env)));return respond({authenticated:true,user:{id:user.id,email:user.email,display_name:user.user_metadata?.display_name},access_token:current.access,expires_at:current.expires,idle_deadline:current.active+7200000});
   }
   if(request.method!=='POST')return respond({error:'Method not allowed'},405);
   if(Number(request.headers.get('content-length')||0)>8192)return respond({error:'Request too large'},413);
   const raw=await request.text();if(raw.length>8192)return respond({error:'Request too large'},413);let body;try{body=JSON.parse(raw);}catch{return respond({error:'Invalid request'},400);}
   if(operation==='activity'||operation==='logout'){
    if(!existing.member||request.headers.get('x-hb-tab')!==existing.member.tab)return respond({error:'Sign in again'},401);
    if(operation==='logout'){await provider('/logout',{},existing.member.access).catch(()=>{});headers.append('set-cookie',setCookie('__Secure-hb-member','',true));return respond({ok:true});}
    headers.append('set-cookie',setCookie('__Secure-hb-member',await seal({...existing.member,active:now()},env)));return respond({ok:true,idle_deadline:now()+7200000});
   }
   if(operation==='recover'){if(typeof body.email!=='string')return respond({error:'Enter your email'},400);await provider('/recover?redirect_to='+encodeURIComponent('https://'+ROOT+'/account?mode=recovery'),{email:body.email});return respond({message:'If this address has an account, check your email for recovery instructions.'});}
   if(operation==='reset'){if(typeof body.access_token!=='string'||typeof body.password!=='string'||body.password.length<8)return respond({error:'Open the recovery link and choose a password with at least 8 characters'},400);await provider('/user',undefined,body.access_token);await provider('/user',{password:body.password},body.access_token,'PUT');return respond({message:'Password updated. Choose Sign in and verify your email to continue.'});}
   if(operation==='start'){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email||'')||typeof body.password!=='string'||body.password.length<8)return respond({error:'Enter your email and a password of at least 8 characters'},400);
    if(body.mode==='signup'){await provider('/signup?redirect_to='+encodeURIComponent('https://'+ROOT+'/account'),{email:body.email,password:body.password,data:{display_name:String(body.name||'').slice(0,80)}});headers.append('set-cookie',setCookie('__Secure-hb-challenge',await seal({kind:'challenge',email:body.email,mode:'signup',expires:now()+600000},env)));return respond({verify:true,message:'Check your email for your confirmation code or link. If you already registered, choose Sign in.'});}
    await provider('/token?grant_type=password',{email:body.email,password:body.password});
    await provider('/otp?redirect_to='+encodeURIComponent('https://'+ROOT+'/account'),{email:body.email,create_user:false});
    headers.append('set-cookie',setCookie('__Secure-hb-challenge',await seal({kind:'challenge',email:body.email,mode:'signin',expires:now()+600000},env)));return respond({verify:true,message:'Password accepted. Enter the code from your email to finish signing in.'});
   }
   if(operation==='verify'){
    const challenge=await unseal(cookie(request,'__Secure-hb-challenge'),env);if(challenge?.kind!=='challenge'||challenge.expires<now())return respond({error:'The verification request expired. Start again.'},401);
    if(!/^\d{6,10}$/.test(String(body.code||'')))return respond({error:'Enter the verification code from your email'},400);
    const data=await provider('/verify',{email:challenge.email,token:String(body.code),type:challenge.mode==='signup'?'signup':'email'});
    if(!data.access_token||!data.refresh_token)return respond({error:'Verification did not create a session'},401);
    const tab=crypto.randomUUID();headers.append('set-cookie',setCookie('__Secure-hb-member',await seal({kind:'member',tab,access:data.access_token,refresh:data.refresh_token,expires:now()+data.expires_in*1000,active:now()},env)));headers.append('set-cookie',setCookie('__Secure-hb-challenge','',true));return respond({ok:true,tab,next:safeReturn(body.next)});
   }
   return respond({error:'Not found'},404);
  }catch(e){return respond({error:e.message||'Account service unavailable'},400);}
 }
 async function gate(request,env){const data=await state(request,env);if(data.member)return {allowed:!new URL(request.url).pathname.startsWith('/api/')||request.headers.get('x-hb-tab')===data.member.tab};if(data.expired)return {allowed:false};if(data.deadline)return {allowed:data.deadline>now(),deadline:data.deadline};const deadline=now()+120000;return {allowed:true,deadline,cookie:setCookie('__Secure-hb-visit',await seal({kind:'visit',deadline},env))};}
 return {endpoint,gate,state};
}
export const publicAuth=createPublicAuth();
