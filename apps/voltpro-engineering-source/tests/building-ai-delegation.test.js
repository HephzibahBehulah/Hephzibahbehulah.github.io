const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
async function delegated(mode){
 const source=fs.readFileSync(path.join(__dirname,'../voltpro-assistant.js'),'utf8'),start=source.indexOf('  const answer = async'),end=source.indexOf('  const ask =',start);let calls=0,request;
 const c={TextDecoder,AbortSignal,console,location:{pathname:'/electrical'},externalMode:false,wantsExternal:()=>false,loadInternalKnowledge:async()=>[],PROJECT_CONTEXT:'',API_URL:'https://example.test/chat',getSession:()=>'',localAnswer:()=>null};c.window={VoltProBuildingAI:{context:()=> 'Electrical building contract',answer:(question,remote)=>remote()}};
 c.fetch=async(url,options)=>{calls++;request=JSON.parse(options.body);if(mode==='json')return{ok:true,headers:{get:()=> 'application/json'},json:async()=>({answer:'office project response'})};let done=false;return{ok:true,body:{getReader:()=>({read:async()=>{if(done)return{done:true};done=true;return{done:false,value:new TextEncoder().encode('data: {"type":"reset"}\n\ndata: {"type":"delta","text":"office project response"}\n\n')};}})}};};
 vm.createContext(c);vm.runInContext(source.slice(start,end)+';globalThis.pending=answer("Generate an office project");',c);const result=await c.pending;assert.equal(result.answer,'office project response');assert.equal(result.mode,'ai');assert.equal(calls,1);assert.equal(request.tool,'building-electrical');assert.match(request.siteContext,/Electrical building contract/);
}
for(const mode of ['stream','json'])test('Electrical AI remote delegation supports '+mode+' replies without function shadowing',()=>delegated(mode));
test('Electrical gateway uses a building contract on its real origin and retains the other workspace contract',async()=>{
 const {default:worker}=await import('../server/voltpro-ai-worker.mjs');let input;const env={AI:{run:async(model,options)=>{input=options;return{response:'Reviewable project draft'};}}};
 const request=tool=>new Request('https://example.test/chat',{method:'POST',headers:{origin:'https://engineering.hephzibahbehulah.com','content-type':'application/json'},body:JSON.stringify({tool,messages:[{role:'user',content:'Generate a project'}],siteContext:'Building data'})});
 const response=await worker.fetch(request('building-electrical'),env);assert.equal(response.status,200);assert.equal(response.headers.get('access-control-allow-origin'),'https://engineering.hephzibahbehulah.com');assert.equal((await response.json()).answer,'Reviewable project draft');assert.match(input.messages[0].content,/voltpro.buildingcad/);assert.equal(input.max_tokens,14000);
 await worker.fetch(request('simulator'),env);assert.match(input.messages[0].content,/zero-based terminal/);assert.equal(input.max_tokens,7000);
 const denied=await worker.fetch(new Request('https://example.test/chat',{method:'POST',headers:{origin:'https://untrusted.example'}}),env);assert.equal(denied.status,403);
});
