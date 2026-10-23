import {verifyCloudflareAccessJwt} from './access.mjs';
const OWNER='isaacadigunoluwole@gmail.com';
const PROTECTED=new Set([OWNER,'adminhephzibahbehulah@gmail.com']);
const ACCESS={ADIGUN_ACCESS_TEAM_DOMAIN:'https://wispy-salad-ae7d.cloudflareaccess.com',ADIGUN_ACCESS_AUD:'726c315523aa5e026b1187fac0c0ddf15605f2e838bfd1ea120333b4fb9c6ffd',ADIGUN_ADMIN_EMAIL:OWNER};
const json=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
const account=u=>({id:u.id,email:u.email||'',created_at:u.created_at,last_sign_in_at:u.last_sign_in_at,email_confirmed_at:u.email_confirmed_at,banned_until:u.banned_until,owner:PROTECTED.has(String(u.email||'').toLowerCase())});
export function createAccountService({readEnv,verify=verifyCloudflareAccessJwt,fetcher=fetch}){
 return async function(request){
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
  const identity=await verify(request,ACCESS);if(!identity.ok)return json({error:'Owner authentication required'},401);
  const url=new URL(request.url),resource=url.searchParams.get('resource')||'users';
  const project=readEnv('SUPABASE_URL');let secret;
  try{secret=JSON.parse(readEnv('SUPABASE_SECRET_KEYS')||'{}').default||readEnv('SUPABASE_SERVICE_ROLE_KEY');}catch{return json({error:'Account administration is not configured'},503);}
  if(!project||!secret)return json({error:'Account administration is not configured'},503);
  const headers={apikey:secret,'content-type':'application/json'};if(!secret.startsWith('sb_secret_'))headers.authorization='Bearer '+secret;
  async function api(path,options={}){const result=await fetcher(project+path,{...options,headers:{...headers,...options.headers},redirect:'manual',signal:AbortSignal.timeout(12000)});let data;try{data=await result.json();}catch{data=null;}if(!result.ok)throw Object.assign(Error('Account provider request failed'),{status:result.status});return data;}
  try{
   if(request.method==='GET'){
    if(resource==='users'){const page=Number(url.searchParams.get('page')||1);if(!Number.isInteger(page)||page<1||page>10000)return json({error:'Invalid page'},400);const data=await api('/auth/v1/admin/users?page='+page+'&per_page=50');return json({users:(data.users||[]).map(account),page,next_page:data.next_page||null,last_page:data.last_page||null,total:data.total??null});}
    if(resource==='events')return json({events:await api('/rest/v1/hb_admin_auth_events?select=id,created_at,action,actor_id,actor_email,ip_address&order=created_at.desc&limit=100'),coverage:'Supabase authentication audit events. Cloudflare edge denials and failed-password attempts may require provider logs. Review signals are not proof of abuse.'});
    if(resource==='operations')return json({operations:await api('/rest/v1/hb_admin_operations?select=id,created_at,actor_email,target_user_id,action,reason,status&order=created_at.desc&limit=50')});
    return json({error:'Unknown resource'},404);
   }
   if(resource!=='users')return json({error:'Method not allowed'},405);
   if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Request too large'},413);
   const text=await request.text();if(text.length>4096)return json({error:'Request too large'},413);
   let body;try{body=JSON.parse(text);}catch{return json({error:'Invalid JSON'},400);}
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.user_id||'')||!['pause_login_24h','allow_login'].includes(body.action))return json({error:'Invalid account action'},400);
   const user=await api('/auth/v1/admin/users/'+body.user_id);if(account(user).owner)return json({error:'The owner account is protected from this action'},403);
   const reason=typeof body.reason==='string'?body.reason.trim():'';if(reason.length<10||reason.length>500)return json({error:'Provide an audit reason of 10 to 500 characters'},400);
   const confirmation=(body.action==='pause_login_24h'?'PAUSE LOGIN ':'ALLOW LOGIN ')+String(user.email||'').trim();if(body.confirmation!==confirmation)return json({error:'Confirmation must name the exact action and account email'},400);
   const actorEmail=String(identity.identity?.email||OWNER).trim().toLowerCase();if(!PROTECTED.has(actorEmail))return json({error:'Owner authentication required'},401);
   const audit=await api('/rest/v1/hb_admin_operations',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({actor_email:actorEmail,target_user_id:body.user_id,action:body.action,reason,status:'requested'})});const auditId=audit?.[0]?.id;if(!auditId)throw Error('Audit recording failed');
   let updated;
   try{updated=await api('/auth/v1/admin/users/'+body.user_id,{method:'PUT',body:JSON.stringify({ban_duration:body.action==='pause_login_24h'?'24h':'none'})});}
   catch(error){await api('/rest/v1/hb_admin_operations?id=eq.'+auditId,{method:'PATCH',body:JSON.stringify({status:'failed'})}).catch(()=>{});throw error;}
   let auditWarning;
   try{await api('/rest/v1/hb_admin_operations?id=eq.'+auditId,{method:'PATCH',body:JSON.stringify({status:'succeeded'})});}catch{auditWarning='The account change succeeded, but the audit entry could not be finalized. Review the requested operation before retrying.';}
   return json({account:account(updated),audit_warning:auditWarning,message:body.action==='pause_login_24h'?'New sign-ins are paused for 24 hours. Existing access tokens can remain valid until expiry.':'New sign-ins are allowed.'});
  }catch(error){return json({error:'Account provider request failed',provider_status:Number.isInteger(error.status)?error.status:undefined},502);}
 };
}
