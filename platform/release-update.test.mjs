import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./release-update.js',import.meta.url),'utf8');
function setup({running='a'.repeat(40),available='b'.repeat(40),online=true,confirmed=true,frame=false}={}){
 const nodes=[],listeners={},documentListeners={},requests=[],timers=[];let reloads=0;
 const node=tag=>({tag,style:{},children:[],listeners:{},setAttribute(){},append(...items){this.children.push(...items);},addEventListener(type,fn){this.listeners[type]=fn;},remove(){nodes.splice(nodes.indexOf(this),1);}});
 const window={top:{},self:null,confirm:()=>confirmed,addEventListener:(type,fn)=>listeners[type]=fn};window.self=frame?{}:window.top;
 const document={visibilityState:'visible',querySelector:()=>({content:running}),createElement:node,body:{append:n=>nodes.push(n)},addEventListener:(type,fn)=>documentListeners[type]=fn};
 const context={window,document,navigator:{onLine:online},location:{href:'https://engineering.hephzibahbehulah.com/plc',reload:()=>reloads++},fetch:async(url,options)=>{requests.push({url,options});return Response.json({commitHash:available});},Response,AbortSignal,Date,setInterval:fn=>timers.push(fn),setTimeout:()=>{}};
 vm.runInNewContext(source,context);
 return {window,document,nodes,listeners,requests,async ready(){await new Promise(resolve=>setImmediate(resolve));},get reloads(){return reloads;}};
}
test('running A detects deployed B without automatically reloading or changing the running identifier',async()=>{
 const h=setup();await h.ready();assert.equal(h.nodes.length,1);assert.equal(h.window.HBReleaseUpdate.running,'a'.repeat(40));assert.equal(h.window.HBReleaseUpdate.available,'b'.repeat(40));assert.equal(h.reloads,0);assert.equal(h.requests[0].options.cache,'no-store');
});
test('same build, unknown baseline, offline, and embedded frames do not display false update notices',async()=>{
 for(const options of [{available:'a'.repeat(40)},{running:'Unknown'},{online:false},{frame:true}]){const h=setup(options);await h.ready();assert.equal(h.nodes.length,0);assert.equal(h.reloads,0);}
});
test('Later preserves the page and declining reload confirmation preserves user work',async()=>{
 const h=setup({confirmed:false});await h.ready();await h.nodes[0].children[1].listeners.click();assert.equal(h.reloads,0);h.nodes[0].children[2].listeners.click();assert.equal(h.nodes.length,0);
});
test('accepting an update reloads at most once',async()=>{
 const h=setup();await h.ready();const click=h.nodes[0].children[1].listeners.click;await click();await click();assert.equal(h.reloads,1);
});
test('lazy-loading failures offer recovery without discarding work',async()=>{
 const h=setup({available:'a'.repeat(40)});await h.ready();h.listeners['vite:preloadError']();assert.equal(h.nodes.length,1);assert.equal(h.reloads,0);
});
