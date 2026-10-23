'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

class Dialog {
  constructor(){this.listeners={};this.returnValue='';this.removed=false;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  showModal(){this.open=true;}
  close(value){this.returnValue=value;this.open=false;this.listeners.close?.();}
  remove(){this.removed=true;}
}
function fixture(initial={}){
  const values=new Map(Object.entries(initial)),events={},docEvents={},doc={head:{append(){}},body:{append(d){doc.dialog=d}},dialog:null,
    createElement(){return doc.dialog=new Dialog()},getElementById(){return null},addEventListener(type,fn){docEvents[type]=fn},removeEventListener(){}};
  const state={project:{parts:[],wires:[]}},win={location:{href:'https://example.test/tool',assigned:null,assign(url){this.assigned=url}},
    setInterval(fn){this.tick=fn;return 1},clearInterval(){},addEventListener(type,fn){events[type]=fn},removeEventListener(){},confirm(){return false},alert(){}};
  const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  return {values,events,docEvents,doc,win,storage,state};
}
function closeChoice(f,value){assert.ok(f.doc.dialog?.open);f.doc.dialog.close(value);}

test('legacy unsaved state asks for recovery and Dismiss clears it without restoring',async()=>{
  const {CanvasSession}=await import('../platform/canvas-session.mjs');
  const f=fixture({'old-project':JSON.stringify({parts:[{id:'R1'}],wires:[]})});let clean=0,restored=0;
  new CanvasSession({tool:'breadboard',read:()=>f.state.project,restore:p=>{restored++;f.state.project=p},clear:()=>{f.state.project={parts:[],wires:[]}},save(){},isEmpty:p=>!p.parts.length&&!p.wires.length,onCleanOpen:()=>clean++,storage:f.storage,windowRef:f.win,documentRef:f.doc,legacyKeys:['old-project']});
  assert.equal(restored,0);assert.match(f.doc.dialog.innerHTML,/We found an unsaved project/);closeChoice(f,'dismiss');
  await new Promise(r=>setImmediate(r));
  assert.equal(restored,0);assert.deepEqual(f.state.project,{parts:[],wires:[]});assert.equal(clean,1);assert.equal(f.storage.getItem('old-project'),null);
});

test('recovery Restore loads the snapshot, then unload warns and autosave checkpoints it',async()=>{
  const {CanvasSession}=await import('../platform/canvas-session.mjs');
  const saved={parts:[{id:'LED1'}],wires:[{id:'W1'}]},f=fixture({'voltpro-recovery-v1-breadboard':JSON.stringify({version:1,data:saved})});
  new CanvasSession({tool:'breadboard',read:()=>f.state.project,restore:p=>{f.state.project=p},clear:()=>{f.state.project={parts:[],wires:[]}},save(){},isEmpty:p=>!p.parts.length&&!p.wires.length,storage:f.storage,windowRef:f.win,documentRef:f.doc});
  closeChoice(f,'accept');await new Promise(r=>setImmediate(r));assert.equal(f.state.project.parts[0].id,'LED1');
  let prevented=false;const event={preventDefault(){prevented=true},returnValue:undefined};f.events.beforeunload(event);assert.equal(prevented,true);assert.equal(event.returnValue,'');
  f.state.project.parts.push({id:'R2'});f.win.tick();const recovered=JSON.parse(f.storage.getItem('voltpro-recovery-v1-breadboard'));assert.equal(recovered.data.parts.length,2);
});

test('in-app navigation offers Save, Discard and Cancel with the requested result',async()=>{
  const {CanvasSession}=await import('../platform/canvas-session.mjs');
  const f=fixture();let saved=0,cleared=0;
  new CanvasSession({tool:'simulator',read:()=>f.state.project,restore(){},clear:()=>{cleared++;f.state.project={parts:[],wires:[]}},save:()=>{saved++},isEmpty:p=>!p.parts.length&&!p.wires.length,storage:f.storage,windowRef:f.win,documentRef:f.doc});cleared=0;
  f.state.project.parts.push({id:'Q1'});
  const anchor={href:'https://example.test/next',target:'',hasAttribute:()=>false};
  const click=()=>f.docEvents.click({defaultPrevented:false,button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,target:{closest:()=>anchor},preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){}});
  click();assert.match(f.doc.dialog.innerHTML,/Save before leaving/);assert.match(f.doc.dialog.innerHTML,/value="save"/);assert.match(f.doc.dialog.innerHTML,/value="discard"/);assert.match(f.doc.dialog.innerHTML,/value="cancel"/);closeChoice(f,'cancel');assert.equal(f.win.location.assigned,null);assert.equal(cleared,0);
  click();closeChoice(f,'save');await new Promise(r=>setImmediate(r));assert.equal(saved,1);assert.equal(f.win.location.assigned,anchor.href);
});

test('an empty but changed project is still unsaved work',async()=>{
  const {CanvasSession}=await import('../platform/canvas-session.mjs');
  const f=fixture();new CanvasSession({tool:'plc',read:()=>f.state.project,restore(){},clear(){},save(){},isEmpty:p=>!p.parts.length&&!p.wires.length,storage:f.storage,windowRef:f.win,documentRef:f.doc});
  f.state.project={parts:[],wires:[],name:'New project'};let prevented=false;f.events.beforeunload({preventDefault(){prevented=true},returnValue:''});assert.equal(prevented,true);
});
