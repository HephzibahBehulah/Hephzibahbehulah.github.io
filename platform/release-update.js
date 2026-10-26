(()=>{
'use strict';
if(window.HBReleaseUpdate)return;
const reportFailure=()=>{
 if(window.top!==window.self){window.top.postMessage({type:'HB_TOOL_ASSET_FAILED'},location.origin);return;}
 show('A tool could not load. Check your connection, save your work, then reload the website.');
};
window.addEventListener('vite:preloadError',reportFailure);
window.addEventListener('unhandledrejection',event=>{if(/Failed to fetch dynamically imported module|Loading chunk .+ failed|Importing a module script failed/i.test(String(event.reason?.message||'')))reportFailure();});
if(window.top!==window.self)return;
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data?.type==='HB_TOOL_ASSET_FAILED')reportFailure();});
const running=document.querySelector('meta[name="hb-release"]')?.content||'Unknown';
const valid=value=>/^[a-f0-9]{40}$/i.test(value||'');
let checking=false,lastCheck=0,notice,registrations=[],activating=false,reloaded=false;
window.HBReleaseUpdate={running,available:null,check};
function show(message='A website update is available. Save your work before reloading.'){
 if(notice)return;
 notice=document.createElement('aside');notice.id='hb-release-update';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
 Object.assign(notice.style,{position:'fixed',bottom:'20px',right:'20px',zIndex:'2147483647',maxWidth:'min(420px,calc(100vw - 40px))',padding:'16px',background:'#122333',color:'#fff',border:'1px solid #71d5e8',borderRadius:'10px',boxShadow:'0 8px 32px #0008',font:'14px/1.5 system-ui'});
 const text=document.createElement('p');text.textContent=message;text.style.margin='0 0 10px';
 const reload=document.createElement('button');reload.type='button';reload.textContent='Reload website';reload.addEventListener('click',apply);
 const later=document.createElement('button');later.type='button';later.textContent='Later';later.style.marginLeft='10px';later.addEventListener('click',()=>{notice.remove();notice=null;});
 notice.append(text,reload,later);document.body.append(notice);
}
function reloadOnce(){if(reloaded)return;reloaded=true;location.reload();}
async function apply(){
 if(activating)return;
 if(!window.confirm('Reload this website? Save or export any unsaved work first. Other open tabs will not be reloaded.'))return;
 activating=true;
 // Do not automatically replace code in other open tabs. Their next online
 // requests use the same network-only policy, and each tab offers its own reload.
 const waiting=registrations.filter(reg=>reg.waiting&&location.href.startsWith(reg.scope)).sort((a,b)=>b.scope.length-a.scope.length).slice(0,1);
 if(!waiting.length){reloadOnce();return;}
 let remaining=waiting.length;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(--remaining<=0)reloadOnce();});
 for(const reg of waiting)reg.waiting.postMessage({type:'HB_ACTIVATE_UPDATE'});
 setTimeout(()=>{if(!reloaded){activating=false;notice?.remove();notice=null;show('The update is still preparing. Please try Reload website again.');}},10000);
}
async function check(force=false){
 if(checking||!navigator.onLine||document.visibilityState==='hidden'||!force&&Date.now()-lastCheck<60000)return;
 checking=true;lastCheck=Date.now();
 try{
  const response=await fetch('/_hb/release.json',{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(10000)});
  if(response.ok){const release=await response.json();if(valid(running)&&valid(release.commitHash)&&release.commitHash!==running){window.HBReleaseUpdate.available=release.commitHash;show();}}
  await Promise.allSettled(registrations.map(reg=>reg.update()));
 }catch{}finally{checking=false;}
}
async function workers(){
 if(!('serviceWorker' in navigator))return;
 try{
  // Update existing registrations, including legacy nested scopes. This does
  // not add a new PWA or change any existing registration's scope.
  registrations=await navigator.serviceWorker.getRegistrations();
  for(const reg of registrations){
   if(reg.waiting&&location.href.startsWith(reg.scope)&&navigator.serviceWorker.controller)show();
   reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&location.href.startsWith(reg.scope)&&navigator.serviceWorker.controller)show();});});
  }
 }catch{}
}
window.addEventListener('online',()=>check(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
// A missing lazy bundle must not cause an automatic, potentially destructive reload.

workers().then(()=>check(true));setInterval(()=>check(),5*60*1000);
})();
