import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../js/language-system.js',import.meta.url),'utf8');

function browser({host='cyber.hephzibahbehulah.com',cookie='',saved='en',readyState='complete'}={}){
  const store=new Map([['hb_language',saved]]), assigned=[];
  const location={hostname:host,protocol:'https:',origin:'https://'+host,href:'https://'+host+'/',search:'',assign:url=>assigned.push(url)};
  const makeElement=tag=>({nodeType:1,tagName:tag.toUpperCase(),id:'',className:'',value:'',textContent:'',children:[],attrs:{},listeners:{},appendChild(child){this.children.push(child);return child;},append(...children){this.children.push(...children);},setAttribute(key,value){this.attrs[key]=String(value);},getAttribute(key){return this.attrs[key]??null;},hasAttribute(key){return Object.hasOwn(this.attrs,key);},addEventListener(key,fn){this.listeners[key]=fn;},closest(){return null;}});
  const body=makeElement('body');
  const find=(el,id)=>el.id===id?el:el.children.map(child=>find(child,id)).find(Boolean);
  const document={scripts:[],readyState,documentElement:{},body,createElement:makeElement,getElementById:id=>find(body,id),querySelectorAll:()=>[],addEventListener(){},_cookie:cookie};
  Object.defineProperty(document,'cookie',{get(){return this._cookie;},set(value){this._cookie=value;}});
  const context={URL,URLSearchParams,location,document,localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value))},window:{},fetch:async()=>({ok:true,json:async()=>({})}),MutationObserver:class{observe(){}},requestAnimationFrame:fn=>fn(),console};
  vm.runInNewContext(source,context);
  return {context,store,location,document,assigned};
}

test('shared language cookie takes precedence over stale subdomain storage',async()=>{
  const app=browser({cookie:'hb_language=de',saved:'en'});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(app.context.window.HBLanguage.get(),'de');
});

test('language preference writes a one year parent-domain cookie on project subdomains',()=>{
  const app=browser({host:'engineering.hephzibahbehulah.com',readyState:'loading'});
  app.context.window.HBLanguage.set('yo');
  assert.equal(app.store.get('hb_language'),'yo');
  assert.match(app.document.cookie,/hb_language=yo/);
  assert.match(app.document.cookie,/Domain=hephzibahbehulah\.com/);
  assert.match(app.document.cookie,/Path=\//);
  assert.match(app.document.cookie,/Max-Age=31536000/);
  assert.match(app.document.cookie,/SameSite=Lax/);
  assert.match(app.document.cookie,/Secure/);
  assert.match(app.assigned[0],/[?&]lang=yo/);
});

test('preview hosts keep language locally without setting the project parent-domain cookie',()=>{
  const app=browser({host:'preview.example.pages.dev',readyState:'loading'});
  app.context.window.HBLanguage.set('pid');
  assert.equal(app.store.get('hb_language'),'pid');
  assert.equal(app.document.cookie,'');
});
