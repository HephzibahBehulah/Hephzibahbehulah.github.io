/* ADIGUN GLOBAL LANGUAGE SYSTEM v1
   English is the default. User choice is persisted locally.
   This first layer localises shared navigation/UI safely; technical content can be
   progressively marked with data-i18n without duplicating HTML pages.
*/
(function(){
  'use strict';
  const SUPPORTED={en:'English',de:'Deutsch',yo:'Yorùbá',pid:'Nigerian Pidgin'};
  const KEY='hb_language';
  const base=location.pathname.indexOf('/cyber-os/')===0?'../':'';
  const original=new WeakMap();
  let dict={};
  let current='en';
  function normal(s){return String(s||'').replace(/^[^\\p{L}]+/u,'').replace(/\\s+/g,' ').trim().toLowerCase()}
  function preferred(){const q=new URLSearchParams(location.search).get('lang');return SUPPORTED[q]?q:(localStorage.getItem(KEY)&&SUPPORTED[localStorage.getItem(KEY)]?localStorage.getItem(KEY):'en')}
  function makeControl(){
    if(document.getElementById('hbLanguageControl')) return;
    const wrap=document.createElement('div');wrap.id='hbLanguageControl';wrap.className='hb-mobile-language';
    const label=document.createElement('label');label.htmlFor='hbLanguage';label.textContent='LANG';
    const select=document.createElement('select');select.id='hbLanguage';select.setAttribute('aria-label','Language');
    Object.entries(SUPPORTED).forEach(([code,name])=>{const o=document.createElement('option');o.value=code;o.textContent=name;select.appendChild(o)});
    select.value=current;select.addEventListener('change',()=>setLanguage(select.value));wrap.append(label,select);document.body.appendChild(wrap);
  }
  async function load(code){
    try{const r=await fetch(base+'data/translations/'+code+'.json',{cache:'no-store'});if(!r.ok)throw new Error('translation '+r.status);dict=await r.json();current=code;return true}catch(e){dict={};current='en';return false}
  }
  function translateNode(el){
    if(el.nodeType!==1) return;
    if(el.hasAttribute('data-i18n')){
      const key=el.getAttribute('data-i18n');
      if(!original.has(el)) original.set(el,el.textContent);
      el.textContent=current==='en'?(original.get(el)||''): (dict[key]||original.get(el)||el.textContent);
    }
    const key=normal(el.textContent);
    if(!el.hasAttribute('data-i18n') && dict[key] && el.children.length===0 && /^(A|BUTTON|OPTION|LABEL|SPAN|SMALL|DIV)$/.test(el.tagName)){
      if(!original.has(el)) original.set(el,el.textContent);
      el.textContent=current==='en'?original.get(el):dict[key];
    }
    ['placeholder','aria-label','title'].forEach(attr=>{
      if(!el.hasAttribute('data-i18n-'+attr)) return;
      const k=el.getAttribute('data-i18n-'+attr);if(!original.has(el)) original.set(el,{});const o=original.get(el);if(typeof o!=='object')return;if(o[attr]===undefined)o[attr]=el.getAttribute(attr)||'';el.setAttribute(attr,current==='en'?o[attr]:(dict[k]||o[attr]));
    });
  }
  function translateAll(){document.querySelectorAll('[data-i18n],.os-nav a,.os-side-label,.os-mini,.nav-link,.nav-cta,.panel-tools button,.resource-controls button').forEach(translateNode);document.documentElement.lang=current==='yo'?'yo':current==='pid'?'en-NG':current;const s=document.getElementById('hbLanguage');if(s)s.value=current}
  async function setLanguage(code){if(!SUPPORTED[code])code='en';localStorage.setItem(KEY,code);await load(code);translateAll();}
  async function init(){current=preferred();await load(current);makeControl();translateAll();
    const mo=new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length)){requestAnimationFrame(translateAll)}});mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.HBLanguage={set:setLanguage,get:()=>current,supported:SUPPORTED};
})();
