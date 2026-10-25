/* Compact icon menus keep every existing action reachable without changing its handler. */
(()=>{
 'use strict';
 const icons={File:'▤',Edit:'✎',View:'▦',Insert:'⊕',Project:'▣',Electrical:'⌁',Simulation:'▶',Reports:'▥',Tools:'⚙',Window:'▢',Help:'ⓘ'};
 const categories=['File','Edit','View','Insert','Project','Electrical','Simulation','Reports','Tools','Window','Help'];
 function layout(){
  const bar=document.querySelector('.toolbar');
  if(!bar||bar.dataset.organized)return;
  bar.dataset.organized='true';bar.classList.add('vp-clean-toolbar');
  const primary=document.createElement('div');primary.className='vp-toolbar-primary';
  const project=document.createElement('div');project.className='vp-toolbar-project';
  const menus=document.createElement('div');menus.className='vp-toolbar-menus';
  const bins={};
  const makeMenu=(name,parent=menus)=>{
   const details=document.createElement('details'),summary=document.createElement('summary'),box=document.createElement('div');
   details.dataset.menu=name.toLowerCase();summary.textContent=name;summary.dataset.icon=icons[name];summary.title=name;summary.setAttribute('aria-label',name+' menu');
   box.className='vp-toolbar-dropdown';details.append(summary,box);parent.append(details);
   details.addEventListener('toggle',()=>{if(details.open)for(const sibling of details.parentElement.children)if(sibling!==details&&sibling.tagName==='DETAILS')sibling.open=false;});
   details.addEventListener('pointerenter',()=>{clearTimeout(details._closeTimer);details.open=true;});
   details.addEventListener('pointerleave',()=>{details._closeTimer=setTimeout(()=>{if(!details.contains(document.activeElement))details.open=false;},260);});
   return {details,box};
  };
  for(const name of categories){const menu=makeMenu(name);bins[name]=menu.box;}
  const primaryIds=new Set(['runBtn','stopBtn','simStatus','saveBtn','vpProjectName']);
  const put=(node,name)=>{
   if(!bins[name])name='Tools';
   if(node.id==='paletteBtn')node.setAttribute('aria-label','Components');
   if(node.id==='inspectorBtn')node.setAttribute('aria-label','Properties and results');
   bins[name].append(node);
  };
  for(const group of [...bar.children])for(const node of [...group.children]){
   if(node.id==='vpProjectName'){project.append(node);continue;}
   if(primaryIds.has(node.id)){primary.append(node);continue;}
   if(node.classList.contains('toolbar-menus')){
    for(const trigger of [...node.children]){
     const key=trigger.dataset.vpMenu;
     const section=key==='projects'?'Project':key==='motor'?'Electrical':['faults','demos','logic'].includes(key)?'Simulation':['challenges','tutorials','mcu','tools','help'].includes(key)?'Help':'Simulation';
     put(trigger,section);
    }
    continue;
   }
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
  const quick=document.createElement('div');quick.className='vp-toolbar-quick';quick.setAttribute('role','toolbar');quick.setAttribute('aria-label','Quick controls');
  const undo=bar.querySelector('#undoBtn');if(undo){undo.dataset.toolbarIcon='⇄';undo.title='Undo';undo.setAttribute('aria-label','Undo');quick.append(undo);}
  const grid=bar.querySelector('#gridSize')?.closest('label');if(grid){grid.dataset.toolbarIcon='▦';grid.title='Grid size';quick.append(grid);}
  const wire=bar.querySelector('.wire-tool');if(wire){const wireButton=wire.querySelector('#wireBtn');if(wireButton){wireButton.dataset.toolbarIcon='🧲';wireButton.title='Wire tool';wireButton.setAttribute('aria-label','Wire tool');}quick.append(wire);}
  const zoomControl=bar.querySelector('#canvasWrap .zoom');if(zoomControl)quick.append(zoomControl);
  const save=bar.querySelector('#saveBtn');if(save){save.dataset.toolbarIcon='▣';save.title='Save project';quick.append(save);}
  const help=document.createElement('button');help.type='button';help.className='vp-toolbar-help';help.dataset.toolbarIcon='▤';help.title='Help and tutorials';help.setAttribute('aria-label','Help and tutorials');
  const helpMenu=menus.querySelector('[data-menu="help"]');help.addEventListener('click',()=>{if(helpMenu){helpMenu.open=!helpMenu.open;helpMenu.querySelector('summary')?.focus();}});
  quick.append(help);primary.append(quick);
  if(!project.children.length){const selector=document.createElement('button');selector.type='button';selector.className='vp-project-selector';selector.innerHTML='<span aria-hidden="true">▱</span><span>Untitled project</span><span aria-hidden="true">⌄</span>';selector.setAttribute('aria-label','Project selector');selector.addEventListener('click',()=>{const projectMenu=menus.querySelector('[data-menu="project"]');if(projectMenu){projectMenu.open=!projectMenu.open;projectMenu.querySelector('summary')?.focus();}});project.append(selector);}
  const moveNavigation=()=>{
   const view=menus.querySelector('[data-menu="view"] .vp-toolbar-dropdown');
   for(const selector of ['.sim-top .mode-tabs','.vp-view-tabs']){const nav=document.querySelector(selector);if(nav&&view&&nav.parentElement!==view)view.append(nav);}
  };
  moveNavigation();new MutationObserver(moveNavigation).observe(document.body,{childList:true,subtree:true});
  const adaptMenus=()=>{menus.dataset.compact=String(window.innerWidth<1100);};
  adaptMenus();window.addEventListener('resize',adaptMenus,{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')menus.querySelectorAll('details').forEach(menu=>menu.open=false);});
  document.addEventListener('pointerdown',event=>{if(!menus.contains(event.target))menus.querySelectorAll('details').forEach(menu=>menu.open=false);});
 }
 window.addEventListener('load',layout);
})();
