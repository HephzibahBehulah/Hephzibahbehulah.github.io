const keys=new Map();
function decode(value){const raw=atob(value.replaceAll('-','+').replaceAll('_','/'));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
export async function verifyCloudflareAccessJwt(request,env,{fetcher=fetch,now=()=>Date.now()}={}){
  const configured=String(env.ADIGUN_ACCESS_TEAM_DOMAIN||env.TEAM_DOMAIN||'').trim().replace(/\/+$/,'');
  const issuer=configured.startsWith('https://')?configured:'https://'+configured;
  const audience=String(env.ADIGUN_ACCESS_AUD||env.POLICY_AUD||'').trim();
  const email=String(env.ADIGUN_ADMIN_EMAIL||'').trim().toLowerCase();
  if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(issuer)||!audience||!email)return {ok:false,status:503};
  const token=request.headers.get('cf-access-jwt-assertion')||'';
  if(!token||token.length>16000)return {ok:false};
  try{
    const parts=token.split('.');if(parts.length!==3||parts.some(x=>!x))return {ok:false};
    const header=JSON.parse(new TextDecoder().decode(decode(parts[0]))),claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const seconds=now()/1000,aud=Array.isArray(claims.aud)?claims.aud:[claims.aud];
    if(header.alg!=='RS256'||typeof header.kid!=='string'||claims.iss!==issuer||!aud.includes(audience)||typeof claims.exp!=='number'||!Number.isFinite(claims.exp)||claims.exp<seconds-60||claims.nbf!==undefined&&(typeof claims.nbf!=='number'||!Number.isFinite(claims.nbf)||claims.nbf>seconds+60)||String(claims.email||'').toLowerCase()!==email)return {ok:false};
    const keyId=issuer+'#'+header.kid;let cached=keys.get(keyId);
    if(!cached||cached.expires<now()){
      const response=await fetcher(issuer+'/cdn-cgi/access/certs',{redirect:'error',signal:AbortSignal.timeout(8000)});if(!response.ok)return {ok:false};
      const body=await response.json(),jwk=body.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)return {ok:false};
      const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
      cached={key,expires:now()+300000};if(keys.size>=32)keys.delete(keys.keys().next().value);keys.set(keyId,cached);
    }
    const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',cached.key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
    return valid?{ok:true,identity:{email},claims}:{ok:false};
  }catch{return {ok:false};}
}
