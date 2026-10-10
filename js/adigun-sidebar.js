(function(){
  "use strict";
  var sidebar=document.querySelector(".os-sidebar");
  if(!sidebar)return;
  var groups=Array.prototype.slice.call(sidebar.querySelectorAll("details.os-nav-dropdown[data-nav-group]"));
  groups.forEach(function(group,index){
    var key="adigun-sidebar:"+location.pathname+":"+group.getAttribute("data-nav-group");
    try{
      var saved=localStorage.getItem(key);
      if(saved==="open")group.open=true;
      if(saved==="closed")group.open=false;
    }catch(e){}
    group.addEventListener("toggle",function(){
      try{localStorage.setItem(key,group.open?"open":"closed");}catch(e){}
    });
  });
  function setActiveFromHash(){
    var hash=location.hash;
    if(!hash)return;
    var match=Array.prototype.find.call(sidebar.querySelectorAll(".os-nav a[href^=\"#\"]"),function(a){return a.getAttribute("href")===hash;});
    if(!match)return;
    sidebar.querySelectorAll(".os-nav a.active").forEach(function(a){a.classList.remove("active");});
    match.classList.add("active");
    var parent=match.closest("details.os-nav-dropdown");
    if(parent)parent.open=true;
  }
  sidebar.querySelectorAll('.os-nav a[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(){
      sidebar.querySelectorAll(".os-nav a.active").forEach(function(item){item.classList.remove("active");});
      a.classList.add("active");
      var parent=a.closest("details.os-nav-dropdown");
      if(parent)parent.open=true;
    });
  });
  window.addEventListener("hashchange",setActiveFromHash);
  setActiveFromHash();
})();