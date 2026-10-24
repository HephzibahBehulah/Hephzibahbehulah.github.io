/* ADIGUN GLOBAL LANGUAGE SYSTEM v3
   Page-wide translation with exact, phrase, word and attribute coverage.
   English is the default. Supported: English, Deutsch, Yorùbá, Nigerian Pidgin.
*/
(function(){
  'use strict';
  if(window.__HB_LANGUAGE_SYSTEM_LOADED__) return;
  window.__HB_LANGUAGE_SYSTEM_LOADED__=true;

  const SUPPORTED = { en:'English', de:'Deutsch', yo:'Yorùbá', pid:'Nigerian Pidgin' };
  const KEY = 'hb_language';
  const COOKIE_DOMAIN = 'hephzibahbehulah.com';

  const scriptEl = Array.from(document.scripts).find(s => /language-system\.js(?:\?|$)/.test(s.src));
  const scriptUrl = scriptEl ? new URL(scriptEl.src, location.href) : new URL('/js/language-system.js', location.origin);
  const translationBase = new URL(scriptUrl.pathname.startsWith('/_hb/') ? 'data/translations/' : '../data/translations/', scriptUrl).href;

  let current = 'en';
  let dict = {};
  const originals = new WeakMap();
  const textOriginals = new WeakMap();

  function clean(value){
    return String(value || '')
      .replace(/^[^\p{L}\p{N}]+/u,'')
      .replace(/[^\p{L}\p{N}]+$/u,'')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function getRequestedLanguage(){
    const q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED[q]) return q;
    const cookie = document.cookie.split(';').map(part=>part.trim()).find(part=>part.startsWith(KEY + '='));
    const shared = cookie ? cookie.slice(KEY.length + 1) : '';
    if (SUPPORTED[shared]) return shared;
    const saved = localStorage.getItem(KEY);
    return SUPPORTED[saved] ? saved : 'en';
  }

  function rememberLanguage(code){
    localStorage.setItem(KEY,code);
    const host = location.hostname.toLowerCase();
    if(host === COOKIE_DOMAIN || host.endsWith('.' + COOKIE_DOMAIN)){
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = KEY + '=' + encodeURIComponent(code) + '; Domain=' + COOKIE_DOMAIN + '; Path=/; Max-Age=31536000; SameSite=Lax' + secure;
    }
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
        const re = new RegExp('(^|[^\\p{L}\\p{N}])' + phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?=$|[^\\p{L}\\p{N}])','giu');
        out = out.replace(re, (m,prefix)=>prefix + translated);
      }
      if(out !== value) return out;
    }

    // Word fallback makes labels and navigation translate even when they contain
    // punctuation, numbering or mixed technical terms.
    let changed = false;
    const out = String(value).replace(/\p{L}[\p{L}\p{N}’'-]*/gu, token=>{
      const translated = dict[token.toLowerCase()];
      if(translated && translated !== token){ changed = true; return translated; }
      return token;
    });
    return changed ? out : null;
  }

  function translateText(value){
    if(current==='en') return value;
    const leading=(String(value).match(/^\s*/) || [''])[0];
    const trailing=(String(value).match(/\s*$/) || [''])[0];
    const core=String(value).slice(leading.length, String(value).length-trailing.length || undefined);
    const translated=lookup(core);
    return translated ? leading+translated+trailing : value;
  }

  function translateElement(el){
    if(el.nodeType !== 1 || el.id === 'hbLanguageControl' || el.closest('[translate="no"]') || ['SCRIPT','STYLE','CODE','PRE','TEXTAREA'].includes(el.tagName) || el.isContentEditable) return;

    const original = rememberOriginal(el);

    if(el.hasAttribute('data-i18n')){
      const key = el.getAttribute('data-i18n');
      const nextText = current === 'en' ? original.text : (dict[key] || lookup(original.text) || original.text);
      if(el.textContent !== nextText) el.textContent = nextText;
    } else if(el.children.length === 0 && !['SCRIPT','STYLE','CODE','PRE'].includes(el.tagName)){
      const translated = current === 'en' ? original.text : lookup(original.text);
      if(translated && el.textContent !== translated) el.textContent = translated;
    } else {
      Array.from(el.childNodes||[]).filter(node=>node.nodeType===3).forEach(node=>{
        if(!textOriginals.has(node)) textOriginals.set(node,node.nodeValue);
        const translated=translateText(textOriginals.get(node));
        if(node.nodeValue!==translated) node.nodeValue=translated;
      });
    }

    [
      ['data-i18n-placeholder','placeholder'],
      ['data-i18n-aria-label','aria-label'],
      ['data-i18n-title','title']
    ].forEach(([keyAttr,target])=>{
      if(!el.hasAttribute(keyAttr)) return;
      const key = el.getAttribute(keyAttr);
      const nextAttr = current === 'en' ? (original[target] || '') : (dict[key] || lookup(original[target] || '') || original[target] || '');
      if(el.getAttribute(target) !== nextAttr) el.setAttribute(target,nextAttr);
    });

    // Translate common attributes even where pages do not yet have explicit keys.
    if(current !== 'en'){
      ['placeholder','aria-label','title'].forEach(target=>{
        if(!el.hasAttribute(target)) return;
        const value = original[target];
        if(!value) return;
        const translated = lookup(value);
        if(translated && el.getAttribute(target) !== translated) el.setAttribute(target,translated);
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
      rememberLanguage(code);
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

    let queued=false;
    const pending=new Set();
    const pendingText=new Set();
    const observeChanges = records=>{
      for(const record of records){
        if(record.target.nodeType===1 && record.target.id!=='hbLanguageControl') pending.add(record.target);
        else if(record.target.nodeType===3) pendingText.add(record.target);
        for(const node of record.addedNodes||[]){
          if(node.nodeType===3){pendingText.add(node);continue;}
          if(node.nodeType!==1 || node.id==='hbLanguageControl') continue;
          pending.add(node);
          node.querySelectorAll?.('*').forEach(child=>pending.add(child));
        }
      }
      if(queued || (!pending.size && !pendingText.size)) return;
      queued=true;
      requestAnimationFrame(()=>{
        queued=false;
        const changed=[...pending];
        pending.clear();
        const changedText=[...pendingText];
        pendingText.clear();
        changed.forEach(el=>{
          if(el.nodeType!==1 || el.closest?.('[translate="no"]')) return;
          const original=originals.get(el);
          if(original && el.children.length===0 && !el.hasAttribute('data-i18n')){
            const live=el.textContent;
            const localized=current==='en' ? original.text : lookup(original.text);
            if(live && live!==original.text && live!==localized) original.text=live;
          }
          if(original){
            for(const [attribute,key] of [['placeholder','placeholder'],['aria-label','aria'],['title','title']]){
              const live=el.getAttribute(attribute), prior=original[key];
              const localized=current==='en' ? prior : lookup(prior||'');
              if(live && live!==prior && live!==localized) original[key]=live;
            }
          }
          translateElement(el);
        });
        changedText.forEach(node=>{
          if(!textOriginals.has(node)) textOriginals.set(node,node.nodeValue);
          const live=node.nodeValue, original=textOriginals.get(node), localized=translateText(original);
          if(live!==original && live!==localized) textOriginals.set(node,live);
          const translated=translateText(textOriginals.get(node));
          if(live!==translated) node.nodeValue=translated;
        });
      });
    };
    const observer = new MutationObserver(observeChanges);
    observer.observe(document.body,{childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title'],subtree:true});
  }

  window.HBLanguage = {
    set: async function(code){
      if(!SUPPORTED[code]) code='en';
      rememberLanguage(code);
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
