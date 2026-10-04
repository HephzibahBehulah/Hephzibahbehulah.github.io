/* ADIGUN GLOBAL LANGUAGE SYSTEM v2
   Reliable page-wide language switching.
   English is the default. Supported: English, Deutsch, Yorùbá, Nigerian Pidgin.
*/
(function(){
  'use strict';

  const SUPPORTED = { en:'English', de:'Deutsch', yo:'Yorùbá', pid:'Nigerian Pidgin' };
  const KEY = 'hb_language';

  // Resolve translation files from this script's own location, not from the current page.
  const scriptEl = Array.from(document.scripts).find(s => /language-system\.js(?:\?|$)/.test(s.src));
  const scriptUrl = scriptEl ? new URL(scriptEl.src, location.href) : new URL('/js/language-system.js', location.origin);
  const translationBase = new URL('../data/translations/', scriptUrl).href;

  let current = 'en';
  let dict = {};
  const originals = new WeakMap();

  function clean(value){
    return String(value || '').replace(/^[^\p{L}\p{N}]+/u,'').replace(/[^\p{L}\p{N}]+$/u,'').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function getRequestedLanguage(){
    const q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED[q]) return q;
    const saved = localStorage.getItem(KEY);
    return SUPPORTED[saved] ? saved : 'en';
  }

  function rememberOriginal(el){
    if (!originals.has(el)) originals.set(el, {
      text: el.textContent,
      placeholder: el.getAttribute('placeholder'),
      aria: el.getAttribute('aria-label'),
      title: el.getAttribute('title')
    });
    return originals.get(el);
  }

  async function load(code){
    if(code === 'en'){
      dict = {};
      current = 'en';
      return true;
    }
    const response = await fetch(new URL(code + '.json', translationBase).href, {
      cache:'no-store',
      credentials:'same-origin'
    });
    if(!response.ok) throw new Error('Translation file unavailable: ' + response.status);
    dict = await response.json();
    current = code;
    return true;
  }

  function translateElement(el){
    if(el.nodeType !== 1 || el.id === 'hbLanguageControl') return;

    if(el.hasAttribute('data-i18n')){
      const key = el.getAttribute('data-i18n');
      const original = rememberOriginal(el);
      el.textContent = current === 'en' ? original.text : (dict[key] || original.text);
    } else if(el.children.length === 0){
      const original = rememberOriginal(el);
      const key = clean(original.text);
      if(key && dict[key]){
        el.textContent = current === 'en' ? original.text : dict[key];
      }
    }

    [
      ['data-i18n-placeholder','placeholder'],
      ['data-i18n-aria-label','aria-label'],
      ['data-i18n-title','title']
    ].forEach(([keyAttr,target])=>{
      if(!el.hasAttribute(keyAttr)) return;
      const original = rememberOriginal(el);
      const key = el.getAttribute(keyAttr);
      el.setAttribute(target, current === 'en' ? (original[target] || '') : (dict[key] || original[target] || ''));
    });
  }

  function translateAll(){
    document.querySelectorAll('body *').forEach(translateElement);
    document.documentElement.lang = current === 'yo' ? 'yo' : current === 'pid' ? 'en-NG' : current;
    const select = document.getElementById('hbLanguage');
    if(select) select.value = current;
  }

  function buildControl(){
    let wrap = document.getElementById('hbLanguageControl');
    if(wrap) return;
    wrap = document.createElement('div');
    wrap.id = 'hbLanguageControl';
    wrap.className = 'hb-mobile-language';
    wrap.setAttribute('role','group');
    wrap.setAttribute('aria-label','Language selector');

    const label = document.createElement('span');
    label.textContent = 'LANG';
    label.className = 'hb-language-label';

    const select = document.createElement('select');
    select.id = 'hbLanguage';
    select.setAttribute('aria-label','Language');
    Object.entries(SUPPORTED).forEach(([code,name])=>{
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      select.appendChild(option);
    });
    select.value = current;

    select.addEventListener('change', function(){
      const code = SUPPORTED[this.value] ? this.value : 'en';
      localStorage.setItem(KEY, code);
      const url = new URL(location.href);
      url.searchParams.set('lang', code);
      // Reloading guarantees every static and dynamically generated surface starts
      // from the correct source language and prevents renderer conflicts.
      location.assign(url.href);
    });

    wrap.append(label, select);
    document.body.appendChild(wrap);
  }

  async function init(){
    const requested = getRequestedLanguage();
    try {
      await load(requested);
    } catch(error) {
      console.error('[ADIGUN LANGUAGE] Failed to load', requested, error);
      current = 'en';
      dict = {};
    }
    buildControl();
    translateAll();

    const observer = new MutationObserver(records=>{
      let added = false;
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType === 1 && node.id !== 'hbLanguageControl'){
            added = true;
            break;
          }
        }
        if(added) break;
      }
      if(added) requestAnimationFrame(translateAll);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  window.HBLanguage = {
    set: async function(code){
      if(!SUPPORTED[code]) code='en';
      localStorage.setItem(KEY, code);
      const url = new URL(location.href);
      url.searchParams.set('lang', code);
      location.assign(url.href);
    },
    get: function(){ return current; },
    supported: SUPPORTED
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  }else{
    init();
  }
})();