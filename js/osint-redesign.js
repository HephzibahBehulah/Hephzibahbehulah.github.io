document.addEventListener("DOMContentLoaded",()=>{const body=document.body,q=document.getElementById("osSearch"),nodes=[...document.querySelectorAll(".os-node,.os-leaf")],info=document.getElementById("nodeInfo"),reset=document.getElementById("resetTree"),theme=document.getElementById("themeToggle"),dialog=document.getElementById("notesDialog"),notes=document.getElementById("notesToggle");
const brandCss=document.createElement("link");brandCss.rel="stylesheet";brandCss.href="css/hb-brand.css?v=20260925-2";document.head.appendChild(brandCss);
document.title="Hephzibah Behulah | Intelligence • Engineering • Security";
const brand=document.querySelector(".os-brand");if(brand)brand.innerHTML='<img class="hb-brand-mark" src="assets/hb-logo.svg" alt="HB"><span class="hb-brand-name"><strong>HEPHZIBAH BEHULAH</strong><small>INTELLIGENCE · ENGINEERING · SECURITY</small></span>';
document.querySelectorAll('.os-nav a[href="about.html"],.os-nav a[href="contact.html"]').forEach(a=>a.remove());
const external=[...document.querySelectorAll('.os-nav a')].find(a=>a.textContent.toLowerCase().includes('linkedin'));if(external)external.parentElement.insertAdjacentHTML('beforeend','<a href="https://x.com/hephzibahBehulah" target="_blank" rel="noopener">𝕏 x</a><a href="https://www.facebook.com/HephzibahBehulah" target="_blank" rel="noopener">f facebook</a><a href="https://gitbook.io" target="_blank" rel="noopener">▤ gitbook</a>');
const hero=document.querySelector('.os-title');if(hero&&!document.querySelector('.hb-hero-motto')){hero.insertAdjacentHTML('afterend','<div class="hb-hero-motto"><b>LEARN</b> · BUILD · TEST · SECURE</div>');const lead=document.querySelector('.os-lead');if(lead)lead.textContent='Electronics → automation → software, with a focus on cybersecurity, data and practical technical systems.';}
const oldFooter=document.querySelector('.os-footer');if(oldFooter){oldFooter.classList.add('hb-footer-brand');oldFooter.setAttribute('aria-label','Hephzibah Behulah social links');oldFooter.innerHTML='<div class="hb-footer-top"><div class="hb-footer-identity"><img src="assets/hb-logo.svg" alt="HB logo"><div><strong>HEPHZIBAH BEHULAH</strong><span>Engineering → Intelligence → Security</span></div></div><div class="hb-socials"><a class="hb-social gh" href="https://github.com/HephzibahBehulah" target="_blank" rel="noopener" aria-label="GitHub">GH</a><a class="hb-social in" href="https://linkedin.com/in/isaacoluwoleadigun" target="_blank" rel="noopener" aria-label="LinkedIn">in</a><a class="hb-social x" href="https://x.com/hephzibahBehulah" target="_blank" rel="noopener" aria-label="X">𝕏</a><a class="hb-social fb" href="https://www.facebook.com/HephzibahBehulah" target="_blank" rel="noopener" aria-label="Facebook">f</a><a class="hb-social gb" href="https://gitbook.io" target="_blank" rel="noopener" aria-label="GitBook">GB</a><a class="hb-social blog" href="https://hephzibahbehulah.blogspot.com" target="_blank" rel="noopener" aria-label="Blog">BLOG</a></div></div><div class="hb-footer-bottom"><span>© 2026 Hephzibah Behulah</span><span>Electronics · Automation · Software · Data · Security</span></div>';if(oldFooter.parentElement!==document.body||oldFooter.nextElementSibling)document.body.appendChild(oldFooter);}
function cleanPublicCopy(){
if(dialog)dialog.remove();if(notes)notes.remove();document.querySelector('.os-metrics')?.remove();
const sectionHeads=[['#resourceMatrix','RESOURCE MATRIX'],['#ebookVault','EBOOK VAULT'],['#toolbench','TOOLBENCH']];
sectionHeads.forEach(([id,title])=>{const section=document.querySelector(id);if(!section)return;const head=section.querySelector('.os-panel-head');if(head){const spans=head.querySelectorAll('span');if(spans[0])spans[0].textContent=title;if(spans[1])spans[1].style.display='none';}section.querySelectorAll('.resource-note').forEach(n=>n.remove());});
const mega=document.querySelector('#megaTools');if(mega){const h=mega.querySelector('.os-panel-head');if(h){const s=h.querySelectorAll('span');if(s[0])s[0].textContent='MEGA TOOLS';if(s[1])s[1].style.display='none';}mega.querySelectorAll('.resource-note').forEach(n=>n.remove());}
const knowledge=document.querySelector('#knowledgeLibrary');if(knowledge){const h=knowledge.querySelector('.os-panel-head');if(h){const s=h.querySelectorAll('span');if(s[0])s[0].textContent='KNOWLEDGE LIBRARY';if(s[1])s[1].style.display='none';}knowledge.querySelectorAll('.resource-note').forEach(n=>n.remove());}
const tree=document.querySelector('#tree');if(tree){const toolbar=tree.querySelector('.os-tree-toolbar span');if(toolbar)toolbar.textContent='Explore';}
const toolbench=document.querySelector('#toolbench');if(toolbench){toolbench.querySelectorAll('.os-kicker').forEach(e=>{if(e.textContent.includes('NO BACKEND'))e.remove();});const p=toolbench.querySelector('.toolbench-intro p');if(p)p.remove();addEquationDeck(toolbench);}
const framework=document.querySelector('#projects .legend');if(framework){framework.previousElementSibling?.remove();framework.parentElement?.remove();}
const bible=document.querySelector('#genzBible');if(bible){const h=bible.querySelector('.os-panel-head');if(h){const spans=h.querySelectorAll('span');if(spans[0])spans[0].textContent='BIBLE QUIZ';if(spans[1])spans[1].style.display='none';}const p=bible.querySelector('.bible-console p');if(p)p.textContent='Read, compare and test your knowledge with scripture-based questions.';bible.querySelector('#quizPool')?.remove();}
}
function addEquationDeck(toolbench){if(toolbench.querySelector('.hb-equation-deck'))return;const intro=toolbench.querySelector('.toolbench-intro');if(!intro)return;const deck=document.createElement('div');deck.className='hb-equation-deck';deck.innerHTML='<div class="hb-equation"><b>Ohm’s Law</b><code>V = I × R</code><span>Voltage, current and resistance</span></div><div class="hb-equation"><b>Power</b><code>P = V × I</code><span>Electrical power</span></div><div class="hb-equation"><b>Energy</b><code>E = P × t</code><span>Energy from power and time</span></div><div class="hb-equation"><b>Current</b><code>I = Q / t</code><span>Charge per unit time</span></div><div class="hb-equation"><b>Voltage Divider</b><code>Vout = Vin × R2 / (R1 + R2)</code><span>Output voltage across R2</span></div><div class="hb-equation"><b>Series Resistance</b><code>Rt = R1 + R2 + …</code><span>Total resistance in series</span></div><div class="hb-equation"><b>Frequency</b><code>f = 1 / T</code><span>Cycles per second</span></div><div class="hb-equation"><b>Efficiency</b><code>η = Pout / Pin × 100%</code><span>Useful output versus input</span></div>';intro.insertBefore(deck,intro.querySelector('#microTools'));}
cleanPublicCopy();
function injectPolishCSS(){if(document.getElementById('hbPolishCSS'))return;const s=document.createElement('style');s.id='hbPolishCSS';s.textContent=`.hb-ref-label{font:9px "JetBrains Mono",monospace;letter-spacing:.12em;color:var(--cyan);margin:18px 0 8px}.hb-equation-deck{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:4px 0 4px}.hb-equation{padding:14px 15px;border:1px solid rgba(127,255,212,.16);background:linear-gradient(135deg,rgba(127,255,212,.045),rgba(110,80,255,.035));min-height:78px;display:flex;flex-direction:column;justify-content:center;gap:6px}.hb-equation b{font-size:12px;letter-spacing:.06em}.hb-equation code{font:600 14px/1.35 "JetBrains Mono",monospace;color:inherit}.hb-equation span{font-size:11px;opacity:.58}.hb-footer-brand{width:100%;box-sizing:border-box;margin-top:36px;padding:34px clamp(20px,5vw,70px) 24px;border-top:1px solid rgba(127,255,212,.14);background:rgba(4,9,14,.96);position:relative;z-index:3}.hb-footer-top{display:flex;align-items:center;justify-content:space-between;gap:28px;max-width:1320px;margin:0 auto}.hb-footer-identity{display:flex;align-items:center;gap:16px}.hb-footer-identity img{width:58px;height:58px;display:block}.hb-footer-identity strong{display:block;font-size:15px;letter-spacing:.08em}.hb-footer-identity span{display:block;margin-top:5px;font:11px "JetBrains Mono",monospace;opacity:.58}.hb-socials{display:flex;gap:8px;flex-wrap:wrap}.hb-social{display:inline-flex;align-items:center;justify-content:center;min-width:40px;height:36px;padding:0 9px;border:1px solid rgba(127,255,212,.16);color:inherit;text-decoration:none;font:700 11px "JetBrains Mono",monospace;box-sizing:border-box}.hb-social:hover{border-color:rgba(127,255,212,.5);transform:translateY(-1px)}.hb-footer-bottom{max-width:1320px;margin:25px auto 0;padding-top:15px;border-top:1px solid rgba(127,255,212,.08);display:flex;justify-content:space-between;gap:15px;font:10px "JetBrains Mono",monospace;opacity:.45}.os-shell>.hb-footer-brand{grid-column:1/-1}.os-main~.hb-footer-brand{display:block}@media(max-width:900px){.hb-equation-deck{grid-template-columns:repeat(2,minmax(0,1fr))}.hb-footer-top,.hb-footer-bottom{flex-direction:column;align-items:flex-start}.hb-footer-brand{margin-top:24px}}@media(max-width:560px){.hb-equation-deck{grid-template-columns:1fr}.hb-footer-identity img{width:48px;height:48px}}`;document.head.appendChild(s)}injectPolishCSS();
function select(n){nodes.forEach(x=>x.classList.remove("selected"));n.classList.add("selected");const text=n.dataset.info||"Technical branch.";if(info)info.innerHTML="<b>"+n.childNodes[0].textContent.trim()+"</b><span>"+text+"</span>"}nodes.forEach(n=>n.addEventListener("click",()=>select(n)));q?.addEventListener("input",e=>{const s=e.target.value.toLowerCase().trim();nodes.forEach(n=>n.style.opacity=!s||n.textContent.toLowerCase().includes(s)||String(n.dataset.info||"").toLowerCase().includes(s)?"1":".15")});reset?.addEventListener("click",()=>{if(q)q.value="";nodes.forEach(n=>{n.style.opacity="1";n.classList.remove("selected")});if(info)info.innerHTML="<b>CORE</b><span>Select a node to inspect its branch.</span>"});theme?.addEventListener("click",()=>{body.classList.toggle("light");localStorage.setItem("hb-theme",body.classList.contains("light")?"light":"dark")});if(localStorage.getItem("hb-theme")==="light")body.classList.add("light");});/* HB MOTION ENGINE // presentation layer only */
document.addEventListener("DOMContentLoaded",()=>{
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const root=document.documentElement, body=document.body;
  const dot=document.createElement("div"), ring=document.createElement("div");
  dot.className="hb-cursor-dot"; ring.className="hb-cursor-ring"; body.append(dot,ring); body.classList.add("hb-pointer-ready");
  let tx=0,ty=0,rx=0,ry=0,raf=0;
  window.addEventListener("pointermove",e=>{
    tx=e.clientX;ty=e.clientY;
    root.style.setProperty("--mx",e.clientX+"px");root.style.setProperty("--my",e.clientY+"px");
    dot.style.transform="translate("+e.clientX+"px,"+e.clientY+"px) translate(-50%,-50%)";
    ring.style.transform="translate("+e.clientX+"px,"+e.clientY+"px) translate(-50%,-50%)";
    dot.style.opacity="1";ring.style.opacity="1";
    if(!raf)raf=requestAnimationFrame(()=>{
      rx+=(tx-rx)*.14;ry+=(ty-ry)*.14;
      ring.style.transform="translate("+rx+"px,"+ry+"px) translate(-50%,-50%)";raf=0;
    });
  },{passive:true});
  document.addEventListener("pointerout",e=>{if(!e.relatedTarget){dot.style.opacity="0";ring.style.opacity="0"}});
  const interactive="a,button,input,select,.os-node,.os-leaf,.os-item,.intel-card,.ebook-card,.engineering-card,.micro-tool-row";
  document.addEventListener("pointerover",e=>{if(e.target.closest(interactive))body.classList.add("hb-cursor-active")});
  document.addEventListener("pointerout",e=>{if(e.target.closest(interactive)&&!e.relatedTarget?.closest(interactive))body.classList.remove("hb-cursor-active")});
  const revealTargets=[...document.querySelectorAll(".os-panel,.resource-hub")];
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("hb-reveal");revealObserver.unobserve(entry.target)}});
  },{threshold:.08,rootMargin:"0px 0px -40px"});
  revealTargets.forEach(el=>revealObserver.observe(el));
  const navLinks=[...document.querySelectorAll('.os-nav a[href^="#"]')];
  const sections=navLinks.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const navObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const link=navLinks.find(a=>a.getAttribute("href")==="#"+entry.target.id);
        if(link){navLinks.forEach(a=>a.classList.remove("active"));link.classList.add("active")}
      }
    });
  },{rootMargin:"-25% 0px -60% 0px",threshold:0});
  sections.forEach(s=>navObserver.observe(s));
  navLinks.forEach(a=>a.addEventListener("click",()=>{navLinks.forEach(x=>x.classList.remove("active"));a.classList.add("active")}));
  const tiltTargets=[...document.querySelectorAll(".os-hero>.os-panel,.hb-workbench-panel")];
  tiltTargets.forEach(card=>{
    card.addEventListener("pointermove",e=>{
      if(window.innerWidth<901)return;
      const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      card.style.transform="perspective(1100px) rotateX("+(py*-1.2)+"deg) rotateY("+(px*1.2)+"deg) translateY(-2px)";
    });
    card.addEventListener("pointerleave",()=>{card.style.transform=""});
  });
  const treeNodes=[...document.querySelectorAll(".map-node,.map-leaf,.os-tree .os-node,.os-tree .os-leaf")];
  treeNodes.forEach((node,i)=>{
    node.style.transitionDelay=(i%7)*18+"ms";
    node.addEventListener("pointerenter",()=>node.style.zIndex="8");
    node.addEventListener("pointerleave",()=>node.style.zIndex="2");
  });
  const internal=[...document.querySelectorAll('a[href^="#"]')];
  const cover=document.createElement("div");cover.className="hb-route-cover";body.appendChild(cover);
  internal.forEach(a=>a.addEventListener("click",()=>{const target=document.querySelector(a.getAttribute("href"));if(!target)return;cover.classList.add("active");setTimeout(()=>cover.classList.remove("active"),180)}));
});

/* HB REFINEMENT ENGINE // presentation layer only */
document.addEventListener("DOMContentLoaded", function(){
  var body=document.body, root=document.documentElement;
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var flash=document.createElement("div");
  flash.className="hb-domain-flash";
  body.appendChild(flash);
  var beacon=document.createElement("div");
  beacon.className="hb-ambient-beacon";
  beacon.title="system heartbeat";
  body.appendChild(beacon);

  function setDomain(domain){
    if(!domain)return;
    body.setAttribute("data-hb-domain",domain);
    flash.classList.remove("active");
    void flash.offsetWidth;
    flash.classList.add("active");
    window.setTimeout(function(){flash.classList.remove("active");},220);
  }
  function domainFor(el){
    if(!el)return null;
    var id=(el.id||"").toLowerCase();
    var text=(el.textContent||"").toLowerCase();
    if(id.indexOf("engineering")>-1)return "engineering";
    if(id.indexOf("data")>-1)return "data";
    if(id.indexOf("cyber")>-1||id.indexOf("pentest")>-1||text.indexOf("security")>-1)return "security";
    if(id.indexOf("osint")>-1||text.indexOf("osint")>-1)return "osint";
    if(id.indexOf("ai")>-1)return "ai";
    if(id.indexOf("learn")>-1||id.indexOf("ebook")>-1||id.indexOf("knowledge")>-1)return "learning";
    if(id.indexOf("network")>-1)return "network";
    return null;
  }
  document.querySelectorAll(".os-nav a[href^='#']").forEach(function(a){
    a.addEventListener("click",function(){
      setDomain(domainFor(document.querySelector(a.getAttribute("href"))));
    });
  });
  document.querySelectorAll("#tree .map-node,#tree .map-leaf,#tree .os-node,#tree .os-leaf").forEach(function(n){
    n.addEventListener("pointerenter",function(){
      var cls=n.classList;
      if(cls.contains("eng"))setDomain("engineering");
      else if(cls.contains("data"))setDomain("data");
      else if(cls.contains("cyber"))setDomain("security");
      else if(cls.contains("osint"))setDomain("osint");
      else if(cls.contains("ai"))setDomain("ai");
      else if(cls.contains("learn"))setDomain("learning");
      else if(cls.contains("web"))setDomain("network");
    });
  });
  if(!reduced){
    var px=0,py=0;
    window.addEventListener("pointermove",function(e){
      px+=(e.clientX-px)*.035;
      py+=(e.clientY-py)*.035;
      root.style.setProperty("--hb-parallax-x",px+"px");
      root.style.setProperty("--hb-parallax-y",py+"px");
    },{passive:true});
  }

  var commands=[
    ["Overview","Jump to the main view","#overview"],
    ["Intelligence Tree","Explore the knowledge map","#tree"],
    ["Resource Matrix","Open technical sources","#resourceMatrix"],
    ["Ebook Vault","Open the ebook archive","#ebookVault"],
    ["Toolbench","Open study tools","#toolbench"],
    ["Mega Tools","Browse the tool catalogue","#megaTools"],
    ["Engineering","Open engineering lab","#engineeringLab"],
    ["Knowledge","Open the knowledge library","#knowledgeLibrary"],
    ["Bible Quiz","Start the Bible study section","#genzBible"],
    ["Projects","Open projects and workbench","#projects"],
    ["Recon Hub","Open the reconnaissance hub","recon-hub.html"],
    ["Terminal","Open the browser command terminal","#terminal"],
    ["Engineering Library","Open the engineering library","engineering-library.html"]
  ];

  var overlay=document.createElement("div");
  overlay.className="hb-command-overlay";
  overlay.innerHTML='<div class="hb-command" role="dialog" aria-modal="true" aria-label="Command palette"><div class="hb-command-top"><span>⌘K</span><input class="hb-command-input" autocomplete="off" placeholder="Jump to a section or hub..." aria-label="Command search"></div><div class="hb-command-list"></div><div class="hb-command-foot">↑ ↓ navigate · Enter open · Esc close</div></div>';
  body.appendChild(overlay);
  var input=overlay.querySelector(".hb-command-input");
  var list=overlay.querySelector(".hb-command-list");
  var selected=0, filtered=commands;

  function renderCommands(){
    list.innerHTML=filtered.map(function(c,i){
      return '<button class="hb-command-item '+(i===selected?"selected":"")+'" data-target="'+c[2]+'"><span>'+c[0]+'</span><small>'+c[1]+'</small></button>';
    }).join("");
  }
  function closePalette(){overlay.classList.remove("open");}
  function go(target){
    if(target.indexOf("#")===0){
      var el=document.querySelector(target);
      if(el){
        setDomain(domainFor(el));
        el.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
      }
    }else{
      if(!reduced){
        var route=document.querySelector(".hb-route-cover");
        if(route)route.classList.add("active");
        window.setTimeout(function(){location.href=target;},170);
      }else location.href=target;
    }
    closePalette();
  }
  function openPalette(){
    input.value="";
    filtered=commands;
    selected=0;
    renderCommands();
    overlay.classList.add("open");
    input.focus();
  }
  input.addEventListener("input",function(){
    var q=input.value.toLowerCase().trim();
    filtered=commands.filter(function(c){return (c[0]+" "+c[1]).toLowerCase().indexOf(q)>-1;});
    selected=0;
    renderCommands();
  });
  list.addEventListener("click",function(e){
    var b=e.target.closest("[data-target]");
    if(b)go(b.getAttribute("data-target"));
  });
  input.addEventListener("keydown",function(e){
    if(e.key==="ArrowDown"){e.preventDefault();selected=Math.min(selected+1,Math.max(0,filtered.length-1));renderCommands();}
    else if(e.key==="ArrowUp"){e.preventDefault();selected=Math.max(selected-1,0);renderCommands();}
    else if(e.key==="Enter"){e.preventDefault();if(filtered[selected])go(filtered[selected][2]);}
    else if(e.key==="Escape")closePalette();
  });
  overlay.addEventListener("click",function(e){if(e.target===overlay)closePalette();});
  document.addEventListener("keydown",function(e){
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){
      e.preventDefault();
      if(overlay.classList.contains("open"))closePalette();else openPalette();
    }
    if(e.key==="Escape"&&overlay.classList.contains("open"))closePalette();
  });
  renderCommands();
});
