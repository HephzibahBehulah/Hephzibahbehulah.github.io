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
  let activeMenu=null,menuCloseTimer=0;
  const mobileToggle=document.createElement('button');
  mobileToggle.type='button';mobileToggle.className='vp-mobile-menu-toggle';
  mobileToggle.textContent='☰';mobileToggle.title='Show Simulator menus';
  mobileToggle.setAttribute('aria-label','Show Simulator menus');mobileToggle.setAttribute('aria-expanded','false');
  const closeMenu=()=>{
   clearTimeout(menuCloseTimer);
   if(!activeMenu)return;
   const current=activeMenu;activeMenu=null;
   current.box.classList.remove('vp-menu-open');
   for(const property of ['left','top','position','width','max-height','z-index'])current.box.style.removeProperty(property);
   current.details.open=false;current.details.append(current.box);
   window.VoltProToolbarMenus?.close?.();
  };
  const positionMenu=details=>{
   const box=details._vpDropdown,summary=details.querySelector('summary');
   if(!box||!summary)return;
   const r=summary.getBoundingClientRect(),gutter=8,width=Math.min(280,window.innerWidth-gutter*2);
   const left=Math.max(gutter,Math.min(window.innerWidth-width-gutter,r.left));
   const top=r.bottom+4,maxHeight=Math.max(100,Math.min(window.innerHeight-top-gutter,window.innerHeight*.65));
   box.classList.add('vp-menu-open');
   if(box.parentElement!==document.body)document.body.append(box);
   box.style.setProperty('position','fixed','important');
   box.style.setProperty('left',left+'px','important');
   box.style.setProperty('top',top+'px','important');
   box.style.setProperty('width',width+'px','important');
   box.style.setProperty('max-height',maxHeight+'px','important');
   box.style.setProperty('z-index','100100','important');
  };
  const openMenu=details=>{
   if(activeMenu?.details===details){positionMenu(details);return}
   if(activeMenu)closeMenu();
   const box=details._vpDropdown;if(!box)return;
   details.open=true;activeMenu={details,box};positionMenu(details);
  };
  const scheduleMenuClose=()=>{
   clearTimeout(menuCloseTimer);
   menuCloseTimer=setTimeout(()=>{
    const nested=document.querySelector('.vp-toolbar-popover');
    if(activeMenu&&!activeMenu.details.matches(':hover')&&!activeMenu.box.matches(':hover')&&!nested?.matches(':hover'))closeMenu();
   },180);
  };
    const hoverMenus=window.matchMedia?.('(hover: hover) and (pointer: fine)');
  window.addEventListener('resize',()=>{if(activeMenu)positionMenu(activeMenu.details)},{passive:true});
  window.addEventListener('scroll',()=>{if(activeMenu)positionMenu(activeMenu.details)},true);
  mobileToggle.addEventListener('click',()=>{
   const opened=menus.classList.toggle('vp-mobile-menus-open');
   mobileToggle.setAttribute('aria-expanded',String(opened));
   mobileToggle.setAttribute('aria-label',opened?'Hide Simulator menus':'Show Simulator menus');
   mobileToggle.title=opened?'Hide Simulator menus':'Show Simulator menus';
  });
  const bins={};
  const makeMenu=(name,parent=menus)=>{
   const details=document.createElement('details'),summary=document.createElement('summary'),box=document.createElement('div');
   details.dataset.menu=name.toLowerCase();summary.textContent=name;summary.dataset.icon=icons[name];summary.title=name;summary.setAttribute('aria-label',name+' menu');
   box.className='vp-toolbar-dropdown';details._vpDropdown=box;details.append(summary,box);box.addEventListener('pointerleave',scheduleMenuClose);parent.append(details);
   details.addEventListener('toggle',()=>{if(details.open){for(const sibling of menus.children)if(sibling!==details&&sibling.tagName==='DETAILS')sibling.open=false;openMenu(details)}else if(activeMenu?.details===details)closeMenu()});
   details.addEventListener('pointerenter',()=>{if(!hoverMenus?.matches)return;clearTimeout(menuCloseTimer);openMenu(details)});
   details.addEventListener('pointerleave',()=>{if(hoverMenus?.matches)scheduleMenuClose(details)});
   return {details,box};
  };
  for(const name of categories){const menu=makeMenu(name);bins[name]=menu.box;}
  menus.append(mobileToggle);
  const primaryIds=new Set(['runBtn','pauseBtn','stopBtn','simStatus','saveBtn','vpProjectName']);
  const addCommand=(name,label,run)=>{const box=bins[name];if(!box||box.querySelector('[data-vp-command="'+label+'"]'))return;const button=document.createElement('button');button.type='button';button.className='vp-menu-command';button.dataset.vpCommand=label;button.textContent=label;button.addEventListener('click',()=>{for(const menu of menus.querySelectorAll('details'))menu.open=false;try{run()}catch(error){console.error('VoltPro menu action failed:',error);const status=document.querySelector('#simStatus');if(status){status.dataset.state='error';const text=status.querySelector('.status-label');if(text)text.textContent='ACTION UNAVAILABLE';status.setAttribute('aria-label',error.message)}}});box.append(button);};const put=(node,name)=>{
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
  const click=id=>{const el=document.getElementById(id);if(!el)throw Error('This Simulator action is unavailable.');el.click()};
  const platform=name=>{const action=window.VoltProPlatformActions?.[name];if(typeof action!=='function')throw Error('The '+name+' tool has not loaded.');action()};
  const switchView=id=>{const control=document.querySelector('[data-workspace-view="'+id+'"]');if(!control)throw Error('The '+id+' workspace is unavailable.');control.click()};
  addCommand('Edit','Lock / unlock selected group',()=>{if(!window.VoltProUI?.lockSelection?.())throw Error('Select one or more components first.')});
  addCommand('File','Save named project',()=>{if(window.VoltProProjects?.save)window.VoltProProjects.save();else click('saveBtn')});
  for(const [id,label] of [['schematic','Schematic canvas'],['breadboard','Breadboard workspace'],['pcb','PCB workspace'],['code','Code workspace'],['serial','Serial monitor'],['scope','Oscilloscope panel']])addCommand('View',label,()=>switchView(id));
  addCommand('View','Fit drawing to canvas',()=>click('fitBtn'));
  addCommand('Project','Import .voltpro / JSON',()=>{window.VoltProProjectWorkspace?.open?.();requestAnimationFrame(()=>document.querySelector('#vpImportProject')?.click())});
  addCommand('Project','Save a separate copy',()=>{window.VoltProProjectWorkspace?.open?.();requestAnimationFrame(()=>document.querySelector('#vpSaveAs')?.click())});
  addCommand('Electrical','Run circuit analysis',()=>click('runBtn'));
  addCommand('Electrical','Open engineering calculations',()=>platform('engineering'));
  addCommand('Electrical','Open component reference',()=>platform('info'));
  addCommand('Electrical','Ohm’s law lesson · series resistor',()=>{if(!window.VoltProExperimentLibrary)throw Error('Circuit experiment library is unavailable.');window.VoltProExperimentLibrary.launch(0)});
  addCommand('Electrical','Kirchhoff laws · Wheatstone bridge',()=>{if(!window.VoltProExperimentLibrary)throw Error('Circuit experiment library is unavailable.');window.VoltProExperimentLibrary.launch(1500)});
  addCommand('Electrical','Show measurement results',()=>{const controls=window.VoltProWorkspaceControls;if(controls?.setPanel)controls.setPanel('right',true);else click('inspectorBtn')});
  addCommand('Reports','Generate project report',()=>platform('docs'));
  addCommand('Reports','Create bill of materials',()=>platform('bom'));
  addCommand('Reports','Export project data',()=>click('exportBtn'));
  addCommand('Reports','Export drawing as SVG',()=>click('pngBtn'));
  addCommand('Reports','Show analysis results',()=>{const controls=window.VoltProWorkspaceControls;if(controls?.setPanel)controls.setPanel('right',true);else click('inspectorBtn')});
  addCommand('Reports','Export simulation log',()=>{const log=document.querySelector('#console')?.textContent||'';if(!log.trim())throw Error('The simulation log is empty.');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([log],{type:'text/plain'}));a.download='voltpro-simulation.log';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
  addCommand('Reports','Export terminal netlist',()=>{const state=window.S;if(!state)throw Error('Simulator project is unavailable.');const payload={project:document.querySelector('#vpProjectName')?.value||'Untitled project',components:state.components.map(c=>({id:c.id,type:c.type,terminals:window.VoltProTerminalGraph?.definitionFor?.(c.type)?.terminals?.map(t=>t.label)||[],parameters:c.props||{}})),connections:state.wires.map(w=>({id:w.id,from:w.a,to:w.b}))};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='voltpro-netlist.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
  addCommand('Window','Toggle focus mode',()=>click('vpFocusMode'));
  addCommand('Tools','Browse 10,000 wired circuit experiments',()=>{if(!window.VoltProExperimentLibrary)throw Error('Circuit experiment library is unavailable.');window.VoltProExperimentLibrary.open()});
  addCommand('Help','Open Simulator guide',()=>{const guide=document.querySelector('#guideBtn,#helpBtn,[data-help-dialog]');if(guide)guide.click();else platform('docs')});
  addCommand('Help','Interactive tutorial · first circuit',()=>window.VoltProPlatformActions?.tutorial?.('first-circuit'));
  addCommand('Help','Documentation workspace',()=>platform('docs'));  const ensureWorkspaceRail=()=>{
   const workspace=document.querySelector('.workspace');if(!workspace)return;workspace.classList.add('vp-has-rail');
   let rail=workspace.querySelector('.vp-sim-rail');
   if(!rail){rail=document.createElement('nav');rail.className='vp-sim-rail';rail.setAttribute('aria-label','Workspace and canvas tools');rail.innerHTML='<button type="button" data-rail="select" title="Select / cancel tool" aria-label="Select / cancel tool">↖</button><button type="button" data-rail="wire" title="Wire / connect terminals" aria-label="Wire / connect terminals">⌁</button><button type="button" data-rail="parts" title="Components / parts library" aria-label="Components / parts library">▤</button><button type="button" data-rail="search" title="Search components" aria-label="Search components">⌕</button><button type="button" data-rail="properties" title="Properties and results" aria-label="Properties and results">☷</button><button type="button" data-rail="fit" title="Fit drawing to view" aria-label="Fit drawing to view">⛶</button>';workspace.prepend(rail);}
   let views=rail.querySelector('.vp-workspace-view-controls');if(!views){views=document.createElement('div');views.className='vp-workspace-view-controls';views.setAttribute('role','group');views.setAttribute('aria-label','Workspace views');views.innerHTML='<span aria-hidden="true"></span>';for(const [id,glyph,label] of [['schematic','⌁','Schematic'],['breadboard','▦','Breadboard'],['pcb','▣','PCB'],['code','{}','Code'],['serial','↔','Serial'],['scope','∿','Oscilloscope']]){const button=document.createElement('button');button.type='button';button.dataset.workspaceView=id;button.textContent=glyph;button.title=label;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(id==='schematic'));button.onclick=()=>window.VoltProWorkspaceViews?.switch(id);views.append(button);}rail.append(views);}
   if(!rail.dataset.actionsBound){rail.dataset.actionsBound='true';rail.addEventListener('click',event=>{const action=event.target.closest('[data-rail]')?.dataset.rail;if(!action)return;const ui=window.VoltProUI,controls=window.VoltProWorkspaceControls;if(action==='parts'){if(controls?.setPanel)controls.setPanel('left',true);else document.querySelector('#paletteBtn')?.click()}if(action==='wire')document.querySelector('#wireBtn')?.click();if(action==='search'){if(controls?.setPanel)controls.setPanel('left',true);else document.querySelector('#palette')?.classList.add('open');document.querySelector('#componentSearch')?.focus()}if(action==='properties'){if(controls?.setPanel)controls.setPanel('right',true);else document.querySelector('#inspectorPanel')?.classList.remove('inspector-hidden')}if(action==='fit')document.querySelector('#fitBtn')?.click();if(action==='select'&&document.querySelector('#startWireBtn.active'))document.querySelector('#startWireBtn')?.click();});}
  };
  ensureWorkspaceRail();new MutationObserver(ensureWorkspaceRail).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('voltpro-workspace-view-change',()=>document.querySelectorAll('[data-workspace-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workspaceView==='scope'?Boolean(window.VoltProWorkspaceViews?.scopeOpen?.()):button.dataset.workspaceView===window.VoltProWorkspaceViews?.active?.()))));  const simActions=menus.querySelector('[data-menu="simulation"] .vp-toolbar-dropdown');
  if(simActions&&!simActions.querySelector('[data-sim-command]'))for(const [label,id] of [['Run simulation','runBtn'],['Pause / resume','pauseBtn'],['Stop simulation','stopBtn'],['Open oscilloscope','studioLaunch']]){const button=document.createElement('button');button.type='button';button.dataset.simCommand=id;button.textContent=label;button.onclick=()=>{if(id==='studioLaunch'){window.VoltProWorkspaceViews?.switch('scope');return}document.getElementById(id)?.click()};simActions.append(button);}
  const adaptMenus=()=>{
   menus.dataset.compact=String(window.innerWidth<1550);
   menus.classList.toggle('vp-mobile-menu-mode',window.innerWidth<=900);
   if(window.innerWidth>900){menus.classList.remove('vp-mobile-menus-open');mobileToggle.setAttribute('aria-expanded','false')}
  };
  adaptMenus();window.addEventListener('resize',adaptMenus,{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();menus.classList.remove('vp-mobile-menus-open');mobileToggle.setAttribute('aria-expanded','false')}});
  document.addEventListener('pointerdown',event=>{if(menus.contains(event.target)||event.target===mobileToggle)return;closeMenu();menus.querySelectorAll('details').forEach(menu=>menu.open=false);menus.classList.remove('vp-mobile-menus-open');mobileToggle.setAttribute('aria-expanded','false')});
 }
 window.addEventListener('load',layout);
})();

