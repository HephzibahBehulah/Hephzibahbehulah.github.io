/* Progressive navigation: collapsible sidebar groups, active-section tracking and mobile drawer. */
(()=>{"use strict";
function splitCyberNavigation(sidebar){
 const nav=sidebar.querySelector("#cyberNav");
 if(!nav||nav.dataset.hbGrouped==="1")return;
 const groups=[
  ["CORE",["#dashboard","#knowledge-hub","#networking","#network-academy"]],
  ["RECONNAISSANCE",["#recon-overview","#recon-workflow","#recon-toolkit","#recon-queries","#recon-evidence","#recon-learning"]],
  ["INTELLIGENCE",["#commands","#shortcuts","#frameworks","#osint","#detection","#teams","#formulas"]],
  ["LEARNING & LABS",["#games","#labs","#glossary","#learning","#cybersecurity-tools-academy","#terminal"]],
  ["AI & ASSISTANTS",["#operator","#ai-agent"]]
 ];
 const links=[...nav.querySelectorAll("a")];
 const host=nav.parentElement;
 groups.forEach(([label,hrefs])=>{
  const selected=hrefs.map(h=>links.find(a=>a.getAttribute("href")===h)).filter(Boolean);
  if(!selected.length)return;
  const heading=document.createElement("div");heading.className="os-side-label";heading.textContent=label;
  const groupNav=document.createElement("nav");groupNav.className="os-nav";
  selected.forEach(a=>groupNav.appendChild(a));
  host.insertBefore(heading,nav);host.insertBefore(groupNav,nav);
 });
 nav.remove();
 sidebar.querySelectorAll(":scope > .os-side-label").forEach(el=>{if(el.textContent.trim()==="Cyber OS")el.remove();});
 sidebar.dataset.cyberNavGrouped="1";
}
function makeCollapsibleGroups(sidebar){
 const labels=[...sidebar.querySelectorAll(":scope > .os-side-label")];
 labels.forEach((label,index)=>{
  if(label.closest("details.hb-sidebar-group"))return;
  const detail=document.createElement("details");
  detail.className="hb-sidebar-group";
  const heading=document.createElement("summary");
  heading.textContent=label.textContent.trim();
  heading.setAttribute("aria-label",heading.textContent+" navigation group");
  detail.appendChild(heading);
  let node=label.nextElementSibling;
  while(node&&!node.classList.contains("os-side-label")&&!node.classList.contains("os-status")){
   const next=node.nextElementSibling;
   detail.appendChild(node);
   node=next;
  }
  const isExternal=/external/i.test(label.textContent);
  detail.open=index===0&&!isExternal;
  label.replaceWith(detail);
 });
}
function boot(){
 const sidebar=document.querySelector(".os-shell > .os-sidebar")||document.querySelector(".os-sidebar");
 if(!sidebar||sidebar.dataset.hbDrawerReady==="1")return;
 sidebar.dataset.hbDrawerReady="1";
 sidebar.id=sidebar.id||"hbPrimarySidebar";
 splitCyberNavigation(sidebar);
 makeCollapsibleGroups(sidebar);
 const toggle=document.createElement("button");
 toggle.type="button";toggle.className="hb-mobile-nav-toggle";toggle.id="hbMobileNavToggle";
 toggle.setAttribute("aria-controls",sidebar.id);toggle.setAttribute("aria-expanded","false");
 toggle.setAttribute("aria-label","Open navigation menu");
 toggle.innerHTML='<span aria-hidden="true">☰</span><span>MENU</span>';
 document.body.appendChild(toggle);
 const backdrop=document.createElement("button");
 backdrop.type="button";backdrop.className="hb-mobile-nav-backdrop";
 backdrop.setAttribute("aria-label","Close navigation menu");backdrop.tabIndex=-1;
 document.body.appendChild(backdrop);
 const close=()=>{document.body.classList.remove("hb-mobile-nav-open");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","Open navigation menu");};
 const open=()=>{document.body.classList.add("hb-mobile-nav-open");toggle.setAttribute("aria-expanded","true");toggle.setAttribute("aria-label","Close navigation menu");};
 toggle.addEventListener("click",()=>document.body.classList.contains("hb-mobile-nav-open")?close():open());
 backdrop.addEventListener("click",close);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
 const links=[...sidebar.querySelectorAll(".os-nav a")];
 function activate(link){
  if(!link)return;
  links.forEach(a=>a.classList.toggle("active",a===link));
  const group=link.closest("details.hb-sidebar-group");
  if(group)group.open=true;
 }
 links.forEach(a=>{a.removeAttribute("target");a.addEventListener("click",()=>{activate(a);close();});});
 function syncHash(){
  const hash=location.hash;
  if(!hash)return;
  const link=links.find(a=>a.getAttribute("href")===hash);
  if(link)activate(link);
 }
 window.addEventListener("hashchange",syncHash);
 syncHash();
 if("IntersectionObserver" in window){
  const targets=links.map(a=>({a,target:document.getElementById((a.getAttribute("href")||"").slice(1))})).filter(x=>x.target);
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
   if(!visible)return;
   const match=targets.find(x=>x.target===visible.target);
   if(match)activate(match.a);
  },{rootMargin:"-18% 0px -68% 0px",threshold:[0,.1,.25,.5]});
  targets.forEach(x=>observer.observe(x.target));
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();