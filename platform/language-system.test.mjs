import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../js/language-system.js',import.meta.url),'utf8');

function browser({host='cyber.hephzibahbehulah.com',cookie='',saved='en',readyState='complete',translations={}}={}){
  const store=new Map([['hb_language',saved]]), assigned=[],observers=[];
  const location={hostname:host,protocol:'https:',origin:'https://'+host,href:'https://'+host+'/',search:'',assign:url=>assigned.push(url)};
  const makeElement=tag=>({nodeType:1,tagName:tag.toUpperCase(),id:'',className:'',value:'',textContent:'',children:[],childNodes:[],attrs:{},listeners:{},appendChild(child){child.parent=this;this.childNodes.push(child);if(child.nodeType===1)this.children.push(child);return child;},append(...children){children.forEach(child=>this.appendChild(child));},setAttribute(key,value){this.attrs[key]=String(value);},getAttribute(key){return this.attrs[key]??null;},hasAttribute(key){return Object.hasOwn(this.attrs,key);},addEventListener(key,fn){this.listeners[key]=fn;},closest(selector){for(let node=this;node;node=node.parent){if(selector==='[translate="no"]'&&node.hasAttribute?.('translate')&&node.getAttribute('translate')==='no')return node;}return null;},querySelectorAll(){const all=[];const visit=node=>node.children.forEach(child=>{all.push(child);visit(child);});visit(this);return all;}});
  const body=makeElement('body');
  const find=(el,id)=>el.id===id?el:el.children.map(child=>find(child,id)).find(Boolean);
  const document={scripts:[],readyState,documentElement:{},body,createElement:makeElement,getElementById:id=>find(body,id),querySelectorAll:selector=>selector==='body *'?body.querySelectorAll('*'):[],addEventListener(){},_cookie:cookie};
  Object.defineProperty(document,'cookie',{get(){return this._cookie;},set(value){this._cookie=value;}});
  const context={URL,URLSearchParams,location,document,localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value))},window:{},fetch:async()=>({ok:true,json:async()=>translations}),MutationObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}},requestAnimationFrame:fn=>fn(),console};
  vm.runInNewContext(source,context);
  return {context,store,location,document,assigned,observers};
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

test('language selector offers all four languages and safely initializes once',async()=>{
  const app=browser({readyState:'complete'});
  await new Promise(resolve=>setImmediate(resolve));
  const select=app.document.getElementById('hbLanguage');
  assert.ok(select);
  assert.deepEqual(select.children.map(option=>option.value),['en','de','yo','pid']);
  select.value='pid';
  select.listeners.change.call(select);
  assert.equal(app.store.get('hb_language'),'pid');
  assert.match(app.assigned[0],/[?&]lang=pid/);
  vm.runInNewContext(source,app.context);
  assert.equal(app.document.body.children.filter(child=>child.id==='hbLanguageControl').length,1);
});

test('dynamic engineering controls and React text updates translate after the page loads',async()=>{
  const app=browser({saved:'de',translations:{'run simulation':'Simulation starten','stop simulation':'Simulation stoppen','search':'Suchen'}});
  await new Promise(resolve=>setImmediate(resolve));
  const button=app.document.createElement('button');
  button.textContent='Run simulation';
  app.document.body.appendChild(button);
  const observer=app.observers.at(-1);
  observer.callback([{target:app.document.body,addedNodes:[button]}]);
  assert.equal(button.textContent,'Simulation starten');
  button.textContent='Stop simulation';
  observer.callback([{target:button,addedNodes:[]}]);
  assert.equal(button.textContent,'Simulation stoppen');

  const input=app.document.createElement('input');
  input.setAttribute('placeholder','Search');
  app.document.body.appendChild(input);
  observer.callback([{target:app.document.body,addedNodes:[input]}]);
  assert.equal(input.getAttribute('placeholder'),'Suchen');

  const iconButton=app.document.createElement('button');
  const icon=app.document.createElement('svg');
  const label={nodeType:3,nodeValue:'Run simulation'};
  iconButton.append(icon,label);
  app.document.body.appendChild(iconButton);
  observer.callback([{target:iconButton,addedNodes:[label]}]);
  assert.equal(label.nodeValue,'Simulation starten');
  label.nodeValue='Stop simulation';
  observer.callback([{target:label,addedNodes:[]}]);
  assert.equal(label.nodeValue,'Simulation stoppen');
});
