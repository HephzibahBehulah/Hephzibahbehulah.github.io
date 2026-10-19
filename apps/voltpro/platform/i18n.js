(()=>{"use strict";
const FALLBACK="en";
const SUPPORTED=["en","de"];
let locale=localStorage.getItem("voltpro-locale");
if(!SUPPORTED.includes(locale)) locale=FALLBACK;
let dict={};

async function load(requested=locale){
  const target=SUPPORTED.includes(requested)?requested:FALLBACK;
  try{
    const r=await fetch("locales/"+target+".json",{cache:"no-store"});
    if(!r.ok) throw new Error("Locale HTTP "+r.status);
    dict=await r.json();
    locale=target;
    localStorage.setItem("voltpro-locale",locale);
    apply();
    document.dispatchEvent(new CustomEvent("voltpro:locale-changed",{detail:{locale}}));
    return dict;
  }catch(e){
    if(target!==FALLBACK) return load(FALLBACK);
    console.error("VoltPRo i18n:",e);
    return dict;
  }
}
function t(key,fallback){
  const value=key.split(".").reduce((o,k)=>o&&o[k],dict);
  return value ?? fallback ?? key;
}
function apply(root=document){
  root.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent=t(el.dataset.i18n,el.textContent);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    el.placeholder=t(el.dataset.i18nPlaceholder,el.placeholder);
  });
  document.documentElement.lang=locale;
  const toggle=document.getElementById("vpLanguageToggle");
  if(toggle) toggle.textContent=locale==="en"?"Deutsch":"English";
  const label=document.getElementById("vpLanguageLabel");
  if(label) label.textContent=locale==="en"?"Language":"Sprache";
}
function setLocale(next){return load(next);}
function toggle(){return setLocale(locale==="en"?"de":"en");}
window.VoltProI18n={load,setLocale,t,apply,toggle,get locale(){return locale}};
load();
})();