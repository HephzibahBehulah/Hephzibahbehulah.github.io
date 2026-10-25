/* Compact icon menus keep every existing action reachable without changing its handler. */
(()=>{
 'use strict';
 const icons={File:'▤',Edit:'✎',View:'▦',Insert:'⊕',Project:'▣',Electrical:'⌁',Simulation:'▶',Reports:'▥',Tools:'⚙',Window:'▢',Help:'ⓘ',More:'⋯'};
 const categories=['File','Edit','View','Insert','Project','Electrical','Simulation','Reports','Tools','Window','Help'];
 function layout(){
  const bar=document.querySelector('.toolbar');
  if(!bar||bar.dataset.organized)return;
  bar.dataset.organized='true';bar.classList.add('vp-clean-toolbar');
  const primary=document.createElement('div');primary.className='vp-toolbar-primary';
  const project=document.createElement('div');project.className='vp-toolbar-project';
  const menus=document.createElement('div');menus.className='vp-toolbar-menus';
  const bins={},menuEntries=[];
  const makeMenu=(name,parent=menus)=>{
   const details=document.createElement('details'),summary=document.createElement('summary'),box=document.createElement('div');
   details.dataset.menu=name.toLowerCase();summary.textContent=name;summary.dataset.icon=icons[name];summary.title=name;summary.setAttribute('aria-label',name+' menu');
   box.className='vp-toolbar-dropdown';details.append(summary,box);parent.append(details);
   details.addEventListener('toggle',()=>{if(details.open)for(const sibling of details.parentElement.children)if(sibling!==details&&sibling.tagName==='DETAILS')sibling.open=false;});
   details.addEventListener('pointerenter',()=>{clearTimeout(details._closeTimer);details.open=true;});
   details.addEventListener('pointerleave',()=>{details._closeTimer=setTimeout(()=>{if(!details.contains(document.activeElement))details.open=false;},260);});
   return {details,box};
  };
  for(const name of categories){const menu=makeMenu(name);bins[name]=menu.box;menuEntries.push(menu.details);}
  const more=makeMenu('More'),moreBox=more.box;
  const primaryIds=new Set(['runBtn','stopBtn','simStatus','saveBtn','vpProjectName']);
  const put=(node,name)=>{
   if(!bins[name])name='Tools';
   if(node.id==='paletteBtn')node.setAttribute('aria-label','Components');
   if(node.id==='inspectorBtn')node.setAttribute('aria-label','Properties and results');
   bins[name].append(node);
  };
  for(const group of [...bar.children])for(const node of [...group.children]){
   if(primaryIds.has(node.id)){primary.append(node);continue;}
   if(node.classList.contains('toolbar-menus')){
    for(const trigger of [...node.children]){
     const key=trigger.dataset.vpMenu;
     const section=key==='projects'?'Project':key==='motor'?'Electrical':['faults','demos','logic'].includes(key)?'Simulation':['challenges','tutorials','mcu','tools','help'].includes(key)?'Help':'Simulation';
     put(trigger,section);
    }
    continue;
   }
   if(node.id==='vpProjectName'){project.append(node);continue;}
   if(node.id==='saveBtn'){primary.append(node);continue;}
   if(['newBtn','loadBtn','exportBtn','pngBtn'].includes(node.id)){put(node,'File');continue;}
   if(['deleteBtn','undoBtn','redoBtn'].includes(node.id)){put(node,'Edit');continue;}
   if(node.id==='paletteBtn'||node.classList.contains('wire-tool')||node.id==='startWireBtn'){put(node,'Insert');continue;}
   if(node.id==='inspectorBtn'||node.id==='symbolStyle'||node.id==='gridSize'||node.id==='fitBtn'){put(node.closest('label')||node,'Window');continue;}
   const label=(node.textContent||'').trim();
   const section=/analysis|report|measure|probe|study|review/i.test(label)?'Reports':/project|save|load|export|new/i.test(label)?'Project':/wire|component|insert|draw/i.test(label)?'Insert':/grid|symbol|fit|view/i.test(label)?'View':/run|step|stop|simulation/i.test(label)?'Simulation':'Tools';
   put(node,section);
  }
  const zoom=document.querySelector('#canvasWrap .zoom');if(zoom)primary.append(zoom);
  bar.replaceChildren(project,menus,primary);
  for(const box of Object.values(bins))if(!box.childElementCount){const menu=box.parentElement;menuEntries.splice(menuEntries.indexOf(menu),1);menu.remove();}
  const moveNavigation=()=>{
   const view=menus.querySelector('[data-menu="view"] .vp-toolbar-dropdown');
   for(const selector of ['.sim-top .mode-tabs','.vp-view-tabs']){const nav=document.querySelector(selector);if(nav&&view&&nav.parentElement!==view)view.append(nav);}
  };
  moveNavigation();new MutationObserver(moveNavigation).observe(document.body,{childList:true,subtree:true});
  const adaptMenus=()=>{
   const width=window.innerWidth,ordered=menuEntries;
  const visibleCount=width<600?2:width<850?3:width<1200?4:width<1500?6:ordered.length;
   ordered.forEach((menu,index)=>{if(index<visibleCount){if(menu.parentElement!==menus)menus.insertBefore(menu,more.details);}else if(menu.parentElement!==moreBox)moreBox.append(menu);});
   if(zoom){const destination=width<600?bins.View:primary;if(zoom.parentElement!==destination)destination.append(zoom);}
   more.details.hidden=moreBox.childElementCount===0;
  };
  adaptMenus();window.addEventListener('resize',adaptMenus,{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')menus.querySelectorAll('details').forEach(menu=>menu.open=false);});
  document.addEventListener('pointerdown',event=>{if(!menus.contains(event.target))menus.querySelectorAll('details').forEach(menu=>menu.open=false);});
 }
 window.addEventListener('load',layout);
})();
