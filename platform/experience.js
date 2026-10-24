/* Shared presentation only: original sections, IDs and tool handlers remain intact. */
(()=>{'use strict';
const privatePage=location.hostname==='admin.hephzibahbehulah.com'||document.documentElement.dataset.hbPrivate==='true';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
const clean=text=>String(text||'').replace(/^[^\p{L}\p{N}]+/u,'').trim().toLowerCase();
const sectionNames=new Map([['linux terminal','ADIGUN TERMINAL'],['admin ai','ADIGUN SI'],['admin si','ADIGUN SI'],['public ai','ADIGUN AI']]);
let queued=false;
function reconcile(){
 queued=false;
 repairEngineering();
 const side=document.querySelector('.os-sidebar');
 if(side){
  if(privatePage&&!side.querySelector('[data-hb-monitor]')){const nav=side.querySelector('[data-nav-group="private-control"] nav')||side.querySelector('.os-nav');if(nav){const a=el('a','','◈ USERS & SIGN-INS');a.href='/admin#users-signins';a.dataset.hbMonitor='true';a.setAttribute('translate','no');a.onclick=async e=>{e.preventDefault();try{const module=await import('/_hb/admin-accounts-ui.js');module.openAccounts();}catch{alert('The private monitor could not load. Refresh the page and retry.');}};nav.append(a);}}

  if(/^\/(?:admin\/)?(?:tools|cyber-os)(?:\/|$)/.test(location.pathname))side.querySelectorAll('.hb-platform-apps').forEach(n=>n.remove());
  for(const a of side.querySelectorAll('a')){
   const name=clean(a.textContent),replacement=sectionNames.get(name);
   if(replacement){a.textContent=(name.includes('terminal')?'▣ ':name.includes('public')?'◉ ':'⌁ ')+replacement;a.setAttribute('translate','no');}
   if(privatePage&&(/public site/.test(name)||/cyber-os/.test(location.pathname)&&name==='portfolio terminal'))a.remove();
  }
  for(const group of side.querySelectorAll('details')){
   const summary=group.querySelector('summary');if(summary&&/^outside\s*[+−-]?$/i.test(summary.textContent.trim())){summary.textContent='EXTERNAL';summary.setAttribute('translate','no');}
  }
  // Compare real destinations rather than label case or optional www/trailing slash.
  for(const nav of side.querySelectorAll('nav')){const seen=new Set();for(const a of nav.querySelectorAll('a[href]')){let u;try{u=new URL(a.href);}catch{continue;}if(!/^https?:$/.test(u.protocol)||u.hostname===location.hostname)continue;const key=u.hostname.toLowerCase().replace(/^www\./,'')+u.pathname.toLowerCase().replace(/\/+$/,'')+u.search;if(seen.has(key))a.remove();else seen.add(key);}}
 }
 if(document.querySelector('.os-footer,.hb-footer-brand'))document.querySelectorAll('.hb-platform-footer').forEach(n=>n.remove());
 for(const node of document.querySelectorAll('.os-panel-head>span,.network-tag,.tool-lab-index,.adigun-doctrine-head>span,.adigun-overview-footer>span'))if(!node.id&&/^(?:\d{2}(?:\s*\/\s*\d{2})?|(?:HB|SYS-THINK)\s*\/+\s*\d{2})$/.test(node.textContent.trim()))node.hidden=true;
 for(const node of document.querySelectorAll('.os-panel-head>span:first-child,h1,h2,h3,.eyebrow,.adigun-overline,.hb-id-cap>b,.section-kicker,.section-index,.section-number,.panel-index')){
  if(node.closest('[role="log"],pre,code'))continue;
  if(node.children.length){const first=node.firstChild;if(first?.nodeType===3&&/^\s*\d{2}\s*\//.test(first.textContent))first.textContent=first.textContent.replace(/^\s*\d{2}\s*\/\s*/,'');continue;}
  const text=node.textContent,replacement=text.replace(/^\s*\d{2}\s*\/\s*/,'');
  const title=sectionNames.get(clean(replacement));if(title&&text!==title){node.textContent=title;node.setAttribute('translate','no');}else if(replacement!==text)node.textContent=replacement;
 }
 // Utility controls stay in normal document flow, never above workspace buttons.
 const topHeader=document.querySelector('.os-top'),mobileMenu=document.querySelector('#hbMobileNavToggle');if(topHeader&&mobileMenu&&mobileMenu.parentElement!==topHeader)topHeader.prepend(mobileMenu);
 let target=document.querySelector('#vpSiteHeader .studio-utilities-body')||document.querySelector('#vpSiteHeader .hb-vp-tools')||document.querySelector('.os-top-actions')||document.querySelector('.hb-platform-bar')||document.querySelector('.hb-account-page');
 if(!target&&document.querySelector('.os-top')){target=el('div','os-top-actions');const header=document.querySelector('.os-top'),search=header.querySelector('.cyber-top-search');header.append(target);if(search)target.prepend(search);}
 if(target){let utility=target.querySelector('.hb-utilities');if(!utility){utility=el('div','hb-utilities');utility.setAttribute('aria-label','Display preferences');utility.setAttribute('translate','no');if(target.classList.contains('hb-account-page'))target.querySelector('.hb-account-card')?.before(utility);else target.append(utility);}
  const language=document.querySelector('#hbLanguageControl');if(language&&language.parentElement!==utility)utility.prepend(language);
  if(!utility.querySelector('#hbTheme')){const label=el('label','hb-theme-control','Theme '),select=el('select');select.id='hbTheme';select.setAttribute('aria-label','Colour theme');for(const [value,name]of [['dark','Dark'],['light','Light'],['system','System']]){const o=el('option','',name);o.value=value;select.append(o);}select.value=preference;select.onchange=()=>setTheme(select.value);label.append(select);utility.append(label);}
  for(const member of document.querySelectorAll('.hb-member-actions')){if(member.parentElement!==target)target.append(member);}
 }
 decorateOverview();
 if(document.querySelector('#vpSiteHeader')&&!document.querySelector('script[src="/_hb/studio.js"]'))loadScript('/_hb/studio.js');
}
function repairEngineering(){
 const header=document.querySelector('#vpSiteHeader');if(!header)return;if(document.body.classList.contains('hb-studio'))return;
 document.body.classList.add('hb-engineering');
 let tools=header.querySelector('.hb-vp-tools');if(!tools){tools=el('div','hb-vp-tools');header.append(tools);}
 const brand=header.querySelector('.vp-site-brand');if(brand&&!brand.querySelector('img')){const image=el('img');image.src='/_hb/hb-logo.svg';image.alt='Hephzibah Behulah';brand.replaceChildren(image);brand.setAttribute('aria-label','Hephzibah Behulah engineering home');}
 const sidebar=document.querySelector('#sidebar');if(sidebar&&!sidebar.querySelector('.hb-engineering-close')){const close=el('button','hb-engineering-close','Close menu ×');close.type='button';close.onclick=()=>sidebar.classList.remove('open');sidebar.prepend(close);}
 const bar=document.querySelector('.hb-platform-bar');if(bar){const nav=bar.querySelector('.hb-platform-links');if(nav){const sites=el('details','hb-learning-nav'),title=el('summary','','Learning sites');sites.append(title,nav);tools.append(sites);}for(const child of [...bar.children])if(child.matches('.hb-utilities,.hb-member-actions'))tools.append(child);bar.remove();}
 const identity=header.querySelector('.vp-site-identity');if(identity&&identity.parentElement!==tools)tools.append(identity);
 const member=document.querySelector('.hb-member-actions');if(member&&member.parentElement!==tools)tools.append(member);
 if(identity)identity.classList.toggle('hb-native-guest-hidden',!!member&&!identity.querySelector('details'));
 const bot=document.querySelector('#hbBotLauncher');if(bot&&bot.parentElement!==tools){bot.setAttribute('translate','no');bot.setAttribute('aria-label','Open company website assistant');const label=bot.querySelector('span');if(label)label.textContent='Site AI';tools.append(bot);}const nativeBot=document.querySelector('#vpBotLauncher');if(nativeBot&&nativeBot.parentElement!==tools){nativeBot.setAttribute('translate','no');nativeBot.textContent='Circuit AI';nativeBot.setAttribute('aria-label','Open engineering circuit assistant');tools.append(nativeBot);}
 for(const link of header.querySelectorAll('.vp-account-menu a'))if(/cloud projects/i.test(link.textContent))link.href='https://engineering.hephzibahbehulah.com/workspace';
 const simulator=document.querySelector('.sim-app');if(simulator&&!simulator.dataset.hbSized){simulator.dataset.hbSized='true';const resize=()=>{const heights=[header,simulator.querySelector('.sim-top'),simulator.querySelector('.toolbar')].reduce((sum,n)=>sum+(n?.getBoundingClientRect().height||0),0);simulator.style.setProperty('--hb-canvas-height',Math.max(420,innerHeight-heights-40)+'px');};const observer=new ResizeObserver(resize);for(const n of [header,simulator.querySelector('.sim-top'),simulator.querySelector('.toolbar')])if(n)observer.observe(n);window.addEventListener('resize',resize);resize();}
}
const media=matchMedia('(prefers-color-scheme: dark)');let preference='system';
try{const shared=document.cookie.split('; ').find(x=>x.startsWith('hb-colour-theme='))?.split('=')[1];const saved=shared||localStorage.getItem('hb-colour-theme');if(['dark','light','system'].includes(saved))preference=saved;}catch{}
function applyTheme(){const theme=preference==='system'?(media.matches?'dark':'light'):preference;document.documentElement.dataset.hbTheme=theme;document.documentElement.dataset.hbThemePreference=preference;document.documentElement.style.colorScheme=theme;
 document.body.classList.toggle('light',theme==='light');document.body.classList.toggle('light-mode',theme==='light');document.body.classList.toggle('dark-mode',theme==='dark');document.body.dataset.theme=theme;
 document.querySelectorAll('#hbTheme').forEach(n=>n.value=preference);
 document.dispatchEvent(new CustomEvent('hb:theme',{detail:{theme,preference}}));}
function setTheme(value){preference=['dark','light','system'].includes(value)?value:'system';try{localStorage.setItem('hb-colour-theme',preference);if(location.hostname.endsWith('hephzibahbehulah.com'))document.cookie='hb-colour-theme='+preference+'; Domain=hephzibahbehulah.com; Path=/; Max-Age=31536000; Secure; SameSite=Lax';}catch{}applyTheme();}
media.addEventListener('change',()=>{if(preference==='system')applyTheme();});
document.addEventListener('click',event=>{if(event.target.closest?.('#themeToggle,#hbLabTheme,.theme-toggle,#themeBtn')){event.preventDefault();event.stopImmediatePropagation();setTheme(document.documentElement.dataset.hbTheme==='dark'?'light':'dark');}},true);
function decorateOverview(){
 const candidates=[document.querySelector('.tool-lab-command-deck,.tool-lab-overview,.tool-lab-hero'),document.querySelector('.toolbench-intro'),document.querySelector('.cyber-command-deck,#dashboard .cyber-hero,#dashboard .os-hero,#dashboard>.os-panel'),document.querySelector('#view>.hero,#view>.academy-command'),document.querySelector('body.hb-platform-cyber>header:not(.hb-platform-bar)'),document.querySelector('.adigun-command-overview')].filter(Boolean);
 for(const container of candidates){container.classList.add('hb-command-surface');if(container.matches('.adigun-command-overview,.academy-command,.cyber-command-deck,.tool-lab-command-deck')||container.querySelector('.hb-overview-orbit'))continue;
  const orbit=el('div','hb-overview-orbit');orbit.setAttribute('aria-hidden','true');orbit.append(el('span','hb-orbit-ring'),el('span','hb-orbit-sweep'));const logo=el('img');logo.src='/_hb/hb-logo.svg';logo.alt='';orbit.append(logo);(container.matches('.toolbench-intro')?container.firstElementChild:container).append(orbit);
 }
}
function loadScript(src){if([...document.scripts].some(s=>new URL(s.src,location.href).pathname===src))return;const s=el('script');s.src=src;s.defer=true;document.head.append(s);}
function init(){const sheet=document.querySelector('link[href="/_hb/experience.css"]');if(sheet)document.head.append(sheet);document.body.classList.add('hb-unified');applyTheme();reconcile();
 const observer=new MutationObserver(records=>{if(queued||!records.some(r=>r.addedNodes.length))return;queued=true;requestAnimationFrame(reconcile);});observer.observe(document.body,{childList:true,subtree:true});
 if(privatePage&&location.hash==='#users-signins')document.querySelector('[data-hb-monitor]')?.click();
 if(!window.HBLanguage)loadScript('/js/language-system.js?v=20261024-1');
 if(!document.querySelector('#hbBotLauncher')){const css=el('link');css.rel='stylesheet';css.href='/css/hb-bot-chat.css';document.head.append(css);loadScript('/js/hb-bot-chat.js');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
