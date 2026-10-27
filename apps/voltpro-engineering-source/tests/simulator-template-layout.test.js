const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

test('embedded Simulator follows the compact one-row workspace shell',()=>{
 const css=read('simulator-template.css');
 const layout=read('src/ui/toolbar-layout.js');
 assert.match(css,/\.sim-app\{height:100%;min-height:0;display:grid;grid-template-rows:48px minmax\(0,1fr\)/);
 assert.match(css,/#vpSiteHeader\{position:relative!important[^}]*height:48px/);
 assert.match(css,/#vpSiteHeader\{grid-row:1;flex-wrap:nowrap/);
 assert.match(css,/\.sim-top\{display:none!important\}/);
 assert.match(css,/\.workspace\{grid-row:2/);
 assert.match(css,/#palette\.open\{transform:translateX\(0\)!important\}/);
 assert.match(css,/\.canvas-help\{[^}]*top:33px;right:auto;bottom:auto;height:auto/);
 assert.match(css,/\.sim-top \.top-actions,[\s\S]*?#themeBtn\{display:none!important\}/);
 assert.match(css,/\.vp-site-navigation\[open\] nav\{display:grid\}/);
 assert.match(css,/\.vp-toolbar-dropdown\{position:absolute[^}]*z-index:1000/);
 assert.match(layout,/pointerenter/);
 assert.doesNotMatch(layout,/makeMenu\('More'\)/);
 assert.match(layout,/const categories=\['File','Edit','View','Insert','Project','Electrical','Simulation','Reports','Tools','Window','Help'\]/);
 assert.match(layout,/vp-toolbar-quick/);
 assert.match(layout,/breadboard/);
});

test('drawing sheet scrolls independently and keeps coordinate rails visible',()=>{
 const css=read('simulator-template.css');
 const shell=read('workspace-shell.js');
 const simulator=read('simulator.js');
 assert.match(css,/#canvasWrap\{grid-column:3;grid-row:1;min-width:0;min-height:0;overflow:auto/);
 assert.match(css,/#canvas\{width:max\(100%,1800px\);height:max\(100%,1200px\)/);
 assert.match(shell,/vp-sheet-top/);
 assert.match(shell,/vp-sheet-left/);
 assert.match(shell,/vp-title-block/);
 assert.match(simulator,/if\(!e\.ctrlKey&&!e\.metaKey\)return/);
});

test('component rail, inspector tabs, and bottom simulation actions retain live controls',()=>{
 const shell=read('workspace-shell.js');
 assert.match(shell,/data-rail="wire"/);
 assert.match(shell,/data-rail="search"/);
 assert.match(shell,/data-dock-tab="properties"/);
 assert.match(shell,/data-dock-tab="results"/);
 assert.match(shell,/\["runBtn", "pauseBtn", "stopBtn"\]/);
 assert.match(shell,/restoreSimulatorChrome\(\)/);
 assert.match(shell,/app\.prepend\(doc\.adoptNode\(sharedHeader\)\)/);
 assert.match(shell,/sharedHeader\.querySelectorAll\("details\[open\]"\)/);
 assert.match(shell,/sharedHeader\.replaceChildren\(\)/);
 assert.match(shell,/vp-sim-header-utilities/);
 assert.match(shell,/syncResponsivePanels/);
 assert.match(shell,/VoltProWorkspaceControls\.setPanel\("left", true\)/);
 assert.match(shell,/VoltProWorkspaceControls\.setPanel\("right", true\)/);
});

test('saved panel states keep the Simulator rail narrow and never stretch the canvas hint',()=>{
 const css=read('simulator-template.css');
 assert.match(css,/\.workspace\.vp-managed-panels\{grid-template-columns:42px minmax\(205px,245px\) minmax\(0,1fr\) minmax\(265px,310px\)!important\}/);
 assert.match(css,/\.workspace\.vp-managed-panels\.vp-left-closed\{grid-template-columns:42px minmax\(0,1fr\) minmax\(265px,310px\)!important/);
 assert.match(css,/\.workspace\.vp-managed-panels\.vp-right-closed:not\(\.vp-left-closed\)\{grid-template-columns:42px minmax\(205px,245px\) minmax\(0,1fr\) 42px!important/);
 assert.match(css,/\.workspace\.vp-managed-panels\.vp-left-closed\.vp-right-closed\{grid-template-columns:42px minmax\(0,1fr\) 42px!important/);
 assert.match(css,/\.workspace\.vp-managed-panels #palette\{grid-column:2!important;grid-row:1!important;position:relative!important/);
 assert.match(css,/@media\(max-width:1000px\)[\s\S]*?#inspectorPanel\{position:relative!important/);
 assert.match(css,/\.canvas-help\{[^}]*bottom:auto;height:auto/);
});

test('Simulator opens on an unobstructed canvas and keeps examples optional',()=>{
 const analysis=read('src/ui/analysis-studio.js');
 assert.match(analysis,/welcome\.hidden=true/);
 assert.match(analysis,/welcome\.hidden=!welcomeOpen\|\|S\.components\.length>0/);
 assert.match(analysis,/welcomeOpen=!welcomeOpen/);
});


test('all toolbar dropdowns open on hover and close after the pointer leaves',()=>{
 const layout=read('src/ui/toolbar-layout.js');
 assert.ok(layout.includes("menus.addEventListener('pointerover'"));
 assert.ok(layout.includes("menus.addEventListener('pointerout'"));
 assert.ok(layout.includes("details.open=false;details.querySelectorAll('details[open]')"));
 const add=layout.indexOf('const addCommand='),put=layout.indexOf('const put=(node,name)=>');
 assert.ok(add>=0&&put>add,'toolbar commands remain in layout scope');
});

test('component library launcher keeps the list in the workspace sidebar',()=>{
 const launcher=read('src/ui/component-studio.js');
 const reference=read('src/ui/reference-workspace.js');
 assert.match(launcher,/Focus component search/);
 assert.match(reference,/setPanel\?\.\('left',true\)/);
 assert.ok(!reference.includes("e.stopImmediatePropagation();open();"),'component button does not open the canvas-covering dialog');
});
