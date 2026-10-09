/* Shared navigation drawer for narrow screens. */
(()=>{"use strict";
function boot(){
 const sidebar=document.querySelector(".os-shell > .os-sidebar")||document.querySelector(".os-sidebar");
 if(!sidebar||sidebar.dataset.hbDrawerReady==="1")return;
 sidebar.dataset.hbDrawerReady="1";
 sidebar.id=sidebar.id||"hbPrimarySidebar";
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
 sidebar.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{close();sidebar.querySelectorAll("a").forEach(x=>x.classList.remove("active"));a.classList.add("active");}));
 window.addEventListener("hashchange",()=>{const hash=location.hash;if(!hash)return;const link=[...sidebar.querySelectorAll("a")].find(a=>a.getAttribute("href")===hash);if(link){sidebar.querySelectorAll("a").forEach(x=>x.classList.remove("active"));link.classList.add("active");}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();