const ENDPOINT='https://vnckoocsookbaqalybje.supabase.co/functions/v1/hb-admin-accounts';
const json=(data,status)=>Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
export async function accountGateway(request,env,ctx,fetcher=fetch){
 const url=new URL(request.url);
 if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return json({error:'Origin not allowed'},403);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
 if(env.API_LIMITER?.limit&&!(await env.API_LIMITER.limit({key:'admin-accounts:'+(request.headers.get('cf-connecting-ip')||'owner')})).success)return json({error:'Please wait before refreshing again'},429);
 const target=new URL(ENDPOINT);target.searchParams.set('resource',url.pathname.endsWith('/events')?'events':url.pathname.endsWith('/operations')?'operations':'users');if(url.searchParams.has('page'))target.searchParams.set('page',url.searchParams.get('page'));
 const headers={'cf-access-jwt-assertion':request.headers.get('cf-access-jwt-assertion')||'','content-type':'application/json'};
 try{const result=await fetcher(target,{method:request.method,headers,body:request.method==='POST'?request.body:undefined,redirect:'manual',signal:AbortSignal.timeout(18000),duplex:'half'});if(result.status>=300&&result.status<400)return json({error:'Account service returned an unexpected redirect'},502);return result;}catch{return json({error:'Account service is temporarily unavailable'},503);}
}
