const MODEL='@cf/meta/llama-3.3-70b-instruct';
const LANGUAGES={en:'English',de:'German',yo:'Yoruba',pid:'Nigerian Pidgin English'};
const SYSTEM='You are SI, the public assistant for the Hephzibah Behulah website. Answer questions, explain concepts, perform calculations, and guide visitors around the public platform. Never claim access to private data, administrator APIs, accounts, repositories, or logs. Do not pretend to have performed an action or verified live information. Be clear about assumptions and uncertainty. Keep answers useful and concise.';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const answerOf=result=>String(result?.response||result?.choices?.[0]?.message?.content||'').trim();

export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.hostname.toLowerCase()!=='hephzibahbehulah.com')return json({ok:false,error:'This assistant is only available on the public website.'},404);
 if(request.method!=='POST')return json({ok:false,error:'Method not allowed.'},405);
 const origin=request.headers.get('origin');
 if(origin&&origin!==url.origin)return json({ok:false,error:'Origin not allowed.'},403);
 if(Number(request.headers.get('content-length')||0)>16000)return json({ok:false,error:'Message is too large.'},413);
 if(!env.API_LIMITER?.limit)return json({ok:false,error:'The public assistant limiter is not configured.'},503);
 try{
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const limit=await env.API_LIMITER.limit({key:'public-si:'+ip});
  if(!limit.success)return json({ok:false,error:'Please wait before asking another question.'},429);
 }catch{return json({ok:false,error:'The public assistant limiter is unavailable.'},503);}
 if(!env.AI?.run)return json({ok:false,error:'The public assistant is not available right now.'},503);
 let body;
 try{body=await request.json();}catch{return json({ok:false,error:'Invalid JSON.'},400);}
 const source=Array.isArray(body?.messages)?body.messages:[];
 const messages=source.filter(m=>['user','assistant'].includes(m?.role)&&typeof m.content==='string').slice(-12).map(m=>({role:m.role,content:m.content.trim().slice(0,4000)})).filter(m=>m.content);
 const total=messages.reduce((n,m)=>n+m.content.length,0);
 if(!messages.length||messages[messages.length-1].role!=='user')return json({ok:false,error:'A user message is required.'},400);
 if(total>12000)return json({ok:false,error:'Conversation is too large. Please start a new chat.'},413);
 const language=LANGUAGES[body?.language]||LANGUAGES.en;
 const prompt=SYSTEM+' Reply in '+language+' when practical.';
 const input=[{role:'system',content:prompt},...messages];
 try{
  let streamed;
  try{streamed=await env.AI.run(MODEL,{messages:input,stream:true});}catch{streamed=null;}
  const readable=streamed instanceof ReadableStream?streamed:streamed?.body;
  if(readable instanceof ReadableStream)return new Response(readable,{headers:{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache, no-transform','x-content-type-options':'nosniff','x-accel-buffering':'no'}});
  const fallback=await env.AI.run(MODEL,{messages:input});
  const answer=answerOf(fallback);
  return answer?json({ok:true,answer,fallback:true}):json({ok:false,error:'The assistant could not produce a response.'},502);
 }catch{return json({ok:false,error:'The assistant is temporarily unavailable. Please try again.'},502);}
}};
