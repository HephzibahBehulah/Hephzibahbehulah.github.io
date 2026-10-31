(function(root){
 'use strict';
 const PREFIX='voltpro-simulator-audit-v1:',LIMIT=300,COALESCE_MS=2000;
 const safeText=value=>String(value??'').replace(/\s+/g,' ').slice(0,120);
 const projectKey=id=>PREFIX+encodeURIComponent(String(id||'').slice(0,100));
 function makeParameterAudit(change,meta={}){
  if(!change||typeof change!=='object')return null;
  const projectId=safeText(change.projectId),componentId=safeText(change.componentId),parameter=safeText(change.parameter);
  if(!projectId||!componentId||!parameter)return null;
  const from=safeText(change.from),to=safeText(change.to);if(from===to)return null;
  return {id:meta.id||globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2),at:meta.at||new Date().toISOString(),projectId,componentId,componentType:safeText(change.componentType),tag:safeText(change.tag||componentId),parameter,from,to};
 }
 function normalizeParameterAudit(value){
  if(!Array.isArray(value))return [];
  return value.filter(item=>item&&typeof item.id==='string'&&typeof item.at==='string'&&typeof item.projectId==='string'&&typeof item.componentId==='string'&&typeof item.parameter==='string'&&typeof item.from==='string'&&typeof item.to==='string').slice(-LIMIT);
 }
 function appendParameterAudit(entries,entry,nowMs=Date.now()){
  const current=normalizeParameterAudit(entries),previous=current.at(-1);
  if(previous&&previous.projectId===entry.projectId&&previous.componentId===entry.componentId&&previous.parameter===entry.parameter&&nowMs-Date.parse(previous.at)<=COALESCE_MS){
   return [...current.slice(0,-1),{...entry,id:previous.id,from:previous.from}].slice(-LIMIT);
  }
  return [...current,entry].slice(-LIMIT);
 }
 function loadParameterAudit(storage,projectId){
  try{const raw=storage?.getItem(projectKey(projectId));return normalizeParameterAudit(JSON.parse(raw||'[]'))}catch{return []}
 }
 function saveParameterAudit(storage,projectId,entries){
  try{storage?.setItem(projectKey(projectId),JSON.stringify(normalizeParameterAudit(entries)));return Boolean(storage)}catch{return false}
 }
 function escape(value){return String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]))}
 function downloadAudit(projectId,entries){
  const blob=new Blob([JSON.stringify({format:'voltpro-parameter-audit',version:1,projectId,exportedAt:new Date().toISOString(),company:'HEPHZIBAH BEHULAH',product:'VoltPro',entries},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='VoltPro-Parameter-History.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 function attachBrowserApi(){
  if(!root.document)return;
  let activeProjectId='';
  root.VoltProSimulatorAudit={
   setProjectId(id){activeProjectId=safeText(id);},
   record(change){const entry=makeParameterAudit({...change,projectId:change?.projectId||activeProjectId});if(!entry)return {ok:true,entries:loadParameterAudit(root.localStorage,activeProjectId)};const rows=appendParameterAudit(loadParameterAudit(root.localStorage,activeProjectId),entry);return {ok:saveParameterAudit(root.localStorage,activeProjectId,rows),entries:rows};},
   entries(){return loadParameterAudit(root.localStorage,activeProjectId);},
   open(){
    document.querySelector('#vpParameterAuditDialog')?.remove();
    const entries=loadParameterAudit(root.localStorage,activeProjectId),dialog=document.createElement('section');
    dialog.id='vpParameterAuditDialog';dialog.className='vp-audit-backdrop';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','vpAuditTitle');
    dialog.innerHTML='<div class=\"vp-audit-card\"><header><div><small>HEPHZIBAH BEHULAH · VOLTPRO</small><h2 id=\"vpAuditTitle\">Parameter change history</h2><p>Stored on this device for the active project only. It is not uploaded to cloud storage.</p></div><button type=\"button\" data-audit-close aria-label=\"Close history\">×</button></header><div class=\"vp-audit-actions\"><span>'+entries.length+' recorded changes</span><button type=\"button\" data-audit-export '+(entries.length?'':'disabled')+'>Export JSON</button></div><div class=\"vp-audit-list\">'+(entries.length?entries.slice().reverse().map(entry=>'<article><time>'+escape(new Date(entry.at).toLocaleString())+'</time><strong>'+escape(entry.tag)+' · '+escape(entry.parameter)+'</strong><span>'+escape(entry.from)+' → '+escape(entry.to)+'</span><small>'+escape(entry.componentType)+' · '+escape(entry.componentId)+'</small></article>').join(''):'<p>No parameter changes recorded for this project yet.</p>')+'</div></div>';
    dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-audit-close]'))dialog.remove();else if(event.target.closest('[data-audit-export]'))downloadAudit(activeProjectId,entries)});
    document.body.appendChild(dialog);dialog.querySelector('[data-audit-close]')?.focus();
   }
  };
 }
 root.VoltProParameterAuditCore={makeParameterAudit,normalizeParameterAudit,appendParameterAudit,loadParameterAudit,saveParameterAudit};
 attachBrowserApi();
})(typeof window==='object'?window:globalThis);
