/* ADIGUN GLOBAL LANGUAGE SYSTEM v3
   Page-wide translation with exact, phrase, word and attribute coverage.
   English is the default. Supported: English, Deutsch, Yorùbá, Nigerian Pidgin.
*/
(function(){
  'use strict';

  const SUPPORTED = { en:'English', de:'Deutsch', yo:'Yorùbá', pid:'Nigerian Pidgin' };
  const KEY = 'hb_language';

  const scriptEl = Array.from(document.scripts).find(s => /language-system\\.js(?:\\?|$)/.test(s.src));
  const scriptUrl = scriptEl ? new URL(scriptEl.src, location.href) : new URL('/js/language-system.js', location.origin);
  const translationBase = new URL('../data/translations/', scriptUrl).href;

  let current = 'en';
  let dict = {};
  const originals = new WeakMap();

  function clean(value){
    return String(value || '')
      .replace(/^[^\\p{L}\\p{N}]+/u,'')
      .replace(/[^\\p{L}\\p{N}]+$/u,'')
      .replace(/\\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function getRequestedLanguage(){
    const q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED[q]) return q;
    const saved = localStorage.getItem(KEY);
    return SUPPORTED[saved] ? saved : 'en';
  }

  function rememberOriginal(el){
    if(!originals.has(el)){
      originals.set(el,{
        text: el.textContent,
        placeholder: el.getAttribute('placeholder'),
        aria: el.getAttribute('aria-label'),
        title: el.getAttribute('title')
      });
    }
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

  function lookup(value){
    const key = clean(value);
    if(!key) return null;
    if(Object.prototype.hasOwnProperty.call(dict,key)) return dict[key];

    // Phrase fallback: match the longest known dictionary phrase inside a label.
    const phrases = Object.keys(dict).filter(k => k.length > 2 && key.includes(k));
    phrases.sort((a,b)=>b.length-a.length);
    if(phrases.length){
      let out = String(value);
      for(const phrase of phrases){
        const translated = dict[phrase];
        const re = new RegExp('(^|[^\\p{L}\\p{N}])' + phrase.replace(/[.*+?^{}()|[\\]\\\\]/g,'\\\\$&') + '(?=$|[^\\p{L}\\p{N}])','giu');
        out = out.replace(re, (m,prefix)=>prefix + translated);
      }
      if(out !== value) return out;
    }

    // Word fallback makes labels and navigation translate even when they contain
    // punctuation, numbering or mixed technical terms.
    const words = Object.keys(dict).filter(k => /^\\p{L}[\\p{L}\\p{N} &'’.-]*$/u.test(k) && !k.includes(' '));
    let changed = false;
    const out = String(value).replace(/\\p{L}[\\p{L}\\p{N}’'-]*/gu, token=>{
      const translated = dict[token.toLowerCase()];
      if(translated && translated !== token){ changed = true; return translated; }
      return token;
    });
    return changed ? out : null;
  }

  function translateElement(el){
    if(el.nodeType !== 1 || el.id === 'hbLanguageControl') return;

    const original = rememberOriginal(el);

    if(el.hasAttribute('data-i18n')){
      const key = el.getAttribute('data-i18n');
      el.textContent = current === 'en' ? original.text : (dict[key] || lookup(original.text) || original.text);
    } else if(el.children.length === 0 && !['SCRIPT','STYLE','CODE','PRE'].includes(el.tagName)){
      const translated = current === 'en' ? original.text : lookup(original.text);
      if(translated) el.textContent = translated;
    }

    [
      ['data-i18n-placeholder','placeholder'],
      ['data-i18n-aria-label','aria-label'],
      ['data-i18n-title','title']
    ].forEach(([keyAttr,target])=>{
      if(!el.hasAttribute(keyAttr)) return;
      const key = el.getAttribute(keyAttr);
      el.setAttribute(target, current === 'en' ? (original[target] || '') : (dict[key] || lookup(original[target] || '') || original[target] || ''));
    });

    // Translate common attributes even where pages do not yet have explicit keys.
    if(current !== 'en'){
      ['placeholder','aria-label','title'].forEach(target=>{
        if(!el.hasAttribute(target)) return;
        const value = original[target];
        if(!value) return;
        const translated = lookup(value);
        if(translated) el.setAttribute(target,translated);
      });
    }
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

    select.addEventListener('change',function(){
      const code = SUPPORTED[this.value] ? this.value : 'en';
      localStorage.setItem(KEY,code);
      const url = new URL(location.href);
      url.searchParams.set('lang',code);
      location.assign(url.href);
    });

    wrap.append(label,select);
    document.body.appendChild(wrap);
  }

  async function init(){
    const requested = getRequestedLanguage();
    try{
      await load(requested);
    }catch(error){
      console.error('[ADIGUN LANGUAGE] Failed to load',requested,error);
      current='en';
      dict={};
    }

    buildControl();
    translateAll();

    const observer = new MutationObserver(records=>{
      let added=false;
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType===1 && node.id!=='hbLanguageControl'){ added=true; break; }
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
      localStorage.setItem(KEY,code);
      const url=new URL(location.href);
      url.searchParams.set('lang',code);
      location.assign(url.href);
    },
    get:function(){ return current; },
    supported:SUPPORTED
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();