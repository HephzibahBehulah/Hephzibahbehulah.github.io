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
 assert.match(css,/\.vp-toolbar-dropdown\{position:absolute[^}]*z-index:1000/);
 assert.match(layout,/pointerenter/);
 assert.match(layout,/makeMenu\('More'\)/);
 assert.match(layout,/MutationObserver\(moveNavigation\)/);
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
 assert.match(shell,/\["runBtn", "stepBtn", "stopBtn"\]/);
 assert.match(shell,/restoreSimulatorChrome\(\)/);
});
