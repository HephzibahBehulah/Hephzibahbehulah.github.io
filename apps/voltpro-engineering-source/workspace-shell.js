(()=>{
"use strict";
const tools = [
 {path: "/electcad", title: "ElectCAD", src: "/voltpro-electcad/?vp_embed=1"},
 {path: "/tools", title: "Engineering Tools", src: "/engineering.html?vp_embed=1"},
 {path: "/breadboard", title: "Breadboard", src: "/breadboard.html?vp_embed=1"},
 {path: "/electrical", title: "VoltPro Electrical Building", src: "/electrical-canvas.html?vp_embed=1"},
 {path: "/oscilloscope", title: "Oscilloscope", src: "/oscilloscope.html?vp_embed=1"},
 {path: "/simulator", title: "Simulator", src: "/simulator.html?vp_embed=1"},
 {path: "/plc", title: "PLC", src: "/voltpro-plc/?vp_embed=1"}
];
const rootPrefix = location.hostname.startsWith("admin.") && /^\/engineering(?:\/|$)/.test(location.pathname) ? "/engineering" : "";
const currentPath = (rootPrefix ? location.pathname.slice(rootPrefix.length) : location.pathname).replace(/\/$/,"") || "/tools";
const active = tools.find(tool => tool.path === currentPath) || tools.find(tool => tool.path === "/tools");
const nav = document.getElementById("toolNav");
const frame = document.getElementById("toolFrame");
const title = document.getElementById("toolTitle");
const status = document.getElementById("routeStatus");
for (const tool of tools) {
 const link = document.createElement("a");
 link.href = rootPrefix + tool.path;
 link.textContent = tool.title;
 if (tool.path === active.path) link.setAttribute("aria-current","page");
 nav.append(link);
}
title.textContent = active.title;
status.textContent = active.title + " · " + active.path;
frame.title = active.title + " workspace";
frame.src = rootPrefix + active.src;
const language = document.getElementById("language-control");
const choices = [...language.querySelectorAll("[data-language]")];
const saved = localStorage.getItem("hb_language") || "en";
function markLanguage(code) { for (const option of choices) option.setAttribute("aria-checked",String(option.dataset.language === code)); }
markLanguage(saved);
language.addEventListener("mouseleave",()=>{language.open=false;});
document.addEventListener("pointerdown",event=>{if(!language.contains(event.target))language.open=false;});
choices.forEach(option=>option.addEventListener("click",()=>{
 const code=option.dataset.language;
 localStorage.setItem("hb_language",code);
 markLanguage(code);
 language.open=false;
 try {
  const child=frame.contentWindow;
  if(child.HBLanguage?.set) child.HBLanguage.set(code);
  else child.location.reload();
 } catch { frame.src = rootPrefix + active.src; }
}));
document.getElementById("themeToggle").addEventListener("click",()=>{
 const next=document.documentElement.dataset.vpTheme==="light"?"dark":"light";
 document.documentElement.dataset.vpTheme=next;
 localStorage.setItem("vp-theme",next);
 try { frame.contentDocument.documentElement.dataset.vpTheme=next; } catch {}
});
frame.addEventListener("load",()=>{
 try {
  const doc=frame.contentDocument;
  const style=doc.createElement("style");
  style.id="vp-unified-shell-controls";
  style.textContent="#language-control,#vpShellLanguage,#hbLanguageControl,.vp-site-navigation,.vp-main-site-link,.profile-button,#theme,.theme-button,#vpThemeToggle,.electcad-main-site,.hb-brand,.language-switch,.icon-btn.theme-toggle,.avatar,.global-bottom-bar>a,.global-nav-separator,#bottom,header .main,#vpBottomNavigation,#vpDevelopmentBanner,#vpDevelopmentFooter{display:none!important}";
  doc.head.append(style);
  doc.documentElement.dataset.vpTheme=localStorage.getItem("vp-theme")||"dark";
  doc.documentElement.lang=localStorage.getItem("hb_language")||"en";
 } catch {}
});
})();
