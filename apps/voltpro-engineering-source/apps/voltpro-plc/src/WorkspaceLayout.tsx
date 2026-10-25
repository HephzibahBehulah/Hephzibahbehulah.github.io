import { useRef, useState } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { ArrowLeft, ArrowLeftRight, BookOpen, ChevronDown, CircuitBoard, Folder, FolderOpen, Globe2, Grid2X2, Info, Magnet, Minus, Moon, Plus, Save, Sun, Zap, PanelRightClose, Play, Search, Settings, SlidersHorizontal, Square, StepForward } from 'lucide-react';
import { usePLC } from './store';
import { catalog, validate, type Kind, type Project } from './model';
import { plant, reversing } from './examples';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PLCIOView } from './PLCIOView';
import { Commissioning } from './Commissioning';
import { PLCCommandMenus } from './CommandMenus';
import { AIAssistant } from './AIAssistant';
import { arduino } from './arduino';

type SettingsPatch = Partial<{ gridSpacing: number; snapToGrid: boolean; showGrid: boolean }>;
type TitlePatch = Partial<{ drafter: string; date: string; scale: string; sheetNumber: string }>;
type Props = {
  startupOpen: boolean;
  setStartupOpen: (open: boolean) => void;
  onNew: () => void;
  onReplace: (project: Project) => void;
  onLoadExample: () => void;
  onSave: () => void;
  onCloudSave: () => void;
  onStep: () => void;
  onReset: () => void;
  onUpdateSettings: (patch: SettingsPatch) => void;
  onUpdateTitle: (patch: TitlePatch) => void;
  onValidate: () => void;
  onNewSheet: () => void;
};

export function WorkspaceLayout(p: Props) {
  const s = usePLC(), selected = s.project.nodes.find(n => n.id === s.selected);
  const [dockTab, setDockTab] = useState<'properties' | 'results' | 'commissioning'>('properties');
  const [libraryOpen, setLibraryOpen] = useState(false), [exampleNumber, setExampleNumber] = useState('1'), [moreSettings, setMoreSettings] = useState(false);
  const [headerDialog, setHeaderDialog] = useState<'help' | 'about' | null>(null);
  const [themeLight, setThemeLight] = useState(() => localStorage.getItem('vp-theme') === 'light');
  const [locale, setLocale] = useState(() => localStorage.getItem('hb_language') || 'en');
  const file = useRef<HTMLInputElement>(null);
  const { fitView, zoomTo, screenToFlowPosition } = useReactFlow(), viewport = useViewport();
  const zoomLevels = [.25,.35,.45,.55,.65,.75,.85,1,...Array.from({ length: 15 }, (_, index) => (index + 11) / 10)];
  const stepZoom = (direction: -1 | 1) => {
    const current = zoomLevels.reduce((best, level, index) => Math.abs(level - viewport.zoom) < Math.abs(zoomLevels[best] - viewport.zoom) ? index : best, 0);
    zoomTo(zoomLevels[Math.max(0, Math.min(zoomLevels.length - 1, current + direction))]);
  };
  const title = s.project.titleBlock || { drafter: '—', date: new Date().toISOString().slice(0, 10), scale: '1:1', sheetNumber: '1 / 1' };
  const setView = (view: 'ladder' | 'fbd' | 'plc') => {
    usePLC.setState(view === 'plc' ? { view } : { view, project: { ...s.project, mode: view } });
  };
  const draw = (kind: Kind, x?: number, y?: number) => {
    const item = catalog.find(entry => entry.kind === kind);
    if (!item || s.running) return;
    const raw = x === undefined ? screenToFlowPosition({ x: innerWidth / 2, y: innerHeight / 2 }) : { x, y: y ?? 0 };
    const position = { x: Math.round(raw.x / s.gridSpacing) * s.gridSpacing, y: Math.round(raw.y / s.gridSpacing) * s.gridSpacing };
    const index = s.project.nodes.length + 1;
    const tag = (kind === 'coil' || kind.startsWith('aux') ? 'KM' : kind === 'lamp' ? 'H' : kind === 'TON' || kind === 'TOF' ? 'T' : 'S') + index;
    s.setProject({ ...s.project, nodes: [...s.project.nodes, { id: crypto.randomUUID(), type: 'device', position, data: { kind, tag, sheet: s.sheet, label: item.label, preset: 1000, pin: Math.min(19, index + 1) } }] });
  };
  const remove = () => {
    const ids = new Set(s.project.nodes.filter(n => n.selected || n.id === s.selected).map(n => n.id));
    s.setProject({ ...s.project, nodes: s.project.nodes.filter(n => !ids.has(n.id)), edges: s.project.edges.filter(e => !e.selected && !ids.has(e.source) && !ids.has(e.target)) });
    usePLC.setState({ selected: null });
  };
  const duplicate = () => {
    if (!selected) return;
    s.setProject({ ...s.project, nodes: [...s.project.nodes, { ...structuredClone(selected), id: crypto.randomUUID(), position: { x: selected.position.x + 180, y: selected.position.y + 20 }, data: { ...selected.data, tag: selected.data.tag + '_copy' } }] });
  };
  const exportProject = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(s.project, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = s.project.name + '.vplc.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportArduino = () => {
    try {
      const url = URL.createObjectURL(new Blob([arduino(s.project)], { type: 'text/plain' }));
      const link = document.createElement('a'); link.href = url; link.download = s.project.name + '.ino'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      usePLC.setState({ error: 'Arduino sketch exported. Review the hardware notes in the file.' });
    } catch (error) { usePLC.setState({ error: (error as Error).message }); }
  };
  const updateSettings = (patch: SettingsPatch) => p.onUpdateSettings(patch);
  const updateTitle = (patch: TitlePatch) => p.onUpdateTitle(patch);
  const sheetList = s.project.sheets || [{ id: 'main', name: 'Main drawing' }];
  const loadLibrary = (project: Project) => p.onReplace(project);

  return <div className="plc-app">
    <header className="topbar plc-reference-header" onKeyDown={event => { if (event.key === 'Escape') event.currentTarget.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(menu => {menu.open=false;}); }} onClick={event => { const target=event.target as HTMLElement; if(target.closest('.plc-command-pop button, .plc-command-pop a')) target.closest('details')?.removeAttribute('open'); }}>
      <div className="plc-shell-slot" hidden />
      <div className="plc-header-identity">
        <a className="plc-main-site" href="https://hephzibahbehulah.com/" target="_top"><ArrowLeft size={14}/><span>Main Site</span></a>
        <a className="plc-company-logo" href="https://hephzibahbehulah.com/" target="_top" aria-label="Hephzibah Behulah main site"><img src="/assets/hb-logo.svg" alt="HB"/></a>
        <span className="plc-header-divider"/>
        <div className="plc-header-brand"><span className="plc-brand-mark"><Zap size={17} fill="currentColor"/></span><strong>VoltPro<span>PLC</span></strong></div>
        <span className="plc-header-divider"/>
        <details className="plc-project-dropdown"><summary aria-label="Project menu"><Folder size={15}/><span>{s.project.name}</span><ChevronDown size={14}/></summary><div className="plc-command-pop">
          <label className="plc-menu-field">Project name<input aria-label="Project name" value={s.project.name} maxLength={100} onChange={e => usePLC.setState({ project: { ...s.project, name: e.target.value } })}/></label>
          <button onClick={p.onNew}>New control project</button><button onClick={() => file.current?.click()}>Open project JSON</button><button onClick={p.onSave}>Save on this device</button><button onClick={p.onCloudSave}>Save to VoltPro cloud</button><button onClick={exportProject}>Export PLC project JSON</button>
        </div></details>
      </div>
      <div className="plc-header-center">
      <PLCCommandMenus
        onHelp={() => setHeaderDialog('help')} onAbout={() => setHeaderDialog('about')} onResults={() => { setDockTab('results'); usePLC.setState({right:true}); }} onNew={p.onNew} onOpen={() => file.current?.click()} onSave={p.onSave} onCloudSave={p.onCloudSave} onExport={exportProject}
        onUndo={s.undo} onRedo={s.redo} onDelete={remove} onDuplicate={duplicate} onDraw={draw}
        onValidate={p.onValidate} onFit={() => fitView({ padding: .15 })} sheet={s.sheet} sheets={sheetList}
        onSheet={id => usePLC.setState({ sheet: id, selected: null })} onNewSheet={p.onNewSheet}
        onLoadExample={p.onLoadExample}
        onArduino={exportArduino} onReset={p.onReset} onView={setView}
        onFocusCanvas={() => { const open = !s.left && !s.right; usePLC.setState({ left: open, right: open }); }}
        onToggleInteractive={() => usePLC.setState({ interactive: !s.interactive })} interactive={s.interactive}
        canUndo={!!s.past.length} canRedo={!!s.future.length} canDelete={!!selected} canDuplicate={!!selected} running={s.running}
      />
      <div className="plc-header-tools" aria-label="Canvas tools">
        <button aria-label="Switch ladder and function block view" title="Switch ladder and function block view" onClick={() => setView(s.view === 'ladder' ? 'fbd' : 'ladder')}><ArrowLeftRight size={17}/></button>
        <span className="plc-header-divider"/>
        <button className={s.grid ? 'active' : ''} aria-label="Grid" aria-pressed={s.grid} onClick={() => updateSettings({showGrid:!s.grid})}><Grid2X2 size={16}/></button>
        <button className={s.snapToGrid ? 'active' : ''} aria-label="Snap to Grid" aria-pressed={s.snapToGrid} onClick={() => updateSettings({snapToGrid:!s.snapToGrid})}><Magnet size={16}/></button>
        <div className="zoom-controls" aria-label="Canvas zoom controls"><button aria-label="Zoom out" onClick={() => stepZoom(-1)}><Minus size={14}/></button><button className="plc-fit-zoom" aria-label="Zoom to fit" onClick={() => fitView({padding:.15})}>{Math.round(viewport.zoom*100)}%</button><button aria-label="Zoom in" onClick={() => stepZoom(1)}><Plus size={14}/></button></div>
        <button className="plc-header-save" aria-label="Save project" title="Save project" onClick={p.onSave}><Save size={17}/></button>
      </div></div>
      <div className="plc-header-actions">
        <details className="plc-project-dropdown plc-workspace-menu"><summary aria-label="My workspace and examples"><BookOpen size={16}/></summary><div className="plc-command-pop"><a href="/workspace" target="_top">My workspace</a><button onClick={() => p.setStartupOpen(true)}>Starter projects</button><button onClick={() => {setLibraryOpen(true);usePLC.setState({left:true});}}>PLC project library</button></div></details>
        <label className="plc-header-language"><Globe2 size={14}/><select aria-label="Interface language" value={locale} onChange={e => {const code=e.target.value;setLocale(code);localStorage.setItem('hb_language',code);const host=window.parent as Window & {HBLanguage?:{set:(code:string)=>void}};host.HBLanguage?.set(code);}}><option value="en">EN</option><option value="de">DE</option><option value="yo">YO</option><option value="pcm">PCM</option></select></label>
        <button aria-label={themeLight?'Switch to dark theme':'Switch to light theme'} onClick={() => {const light=!themeLight;setThemeLight(light);const theme=light?'light':'dark';localStorage.setItem('vp-theme',theme);document.documentElement.dataset.vpTheme=theme;window.parent.document.documentElement.dataset.vpTheme=theme;}}>{themeLight?<Moon size={16}/>:<Sun size={16}/>}</button>
        <button aria-label="About and readiness" onClick={() => setHeaderDialog('about')}><Info size={16}/></button>
        <a className="plc-header-account" aria-label="VoltPro account" href="/workspace" target="_top">VP</a>
      </div>
      <input type="file" accept=".json" ref={file} hidden onChange={async e => {
        const f = e.target.files?.[0]; if (!f) return;
        try { if (f.size > 1500000) throw Error('Project exceeds 1.5 MB.'); const project = JSON.parse(await f.text()) as Project; const errors = validate(project); if (errors.length) throw Error(errors.join(' ')); p.onReplace(project); }
        catch (error) { usePLC.setState({ error: error instanceof Error ? error.message : 'Invalid project file.' }); }
        e.target.value = '';
      }}/>
    </header>

    {headerDialog && <div className="plc-header-dialog-backdrop" onClick={e => {if(e.target===e.currentTarget)setHeaderDialog(null);}}><section role="dialog" aria-modal="true" aria-label={headerDialog==='help'?'PLC editor help':'About VoltProPLC'}><button aria-label="Close dialog" onClick={() => setHeaderDialog(null)}>×</button><h2>{headerDialog==='help'?'VoltProPLC · Editor help':'VoltProPLC · About & readiness'}</h2><p>{headerDialog==='help'?'Choose a device, connect its terminals, then use Run or Single scan. File opens and saves PLC projects. View switches between ladder, function block and PLC I/O. Grid, snapping and zoom controls act on the drawing canvas.':'Development build — not for production documentation. Standards and catalogs are pending verified integration.'}</p>{headerDialog==='about'&&<a href="/status" target="_top">View live gap register</a>}</section></div>}
    {p.startupOpen && <section className="plc-starter-overlay" role="dialog" aria-modal="true" aria-label="Starter projects"><button className="plc-starter-close" onClick={() => p.setStartupOpen(false)} aria-label="Close starter projects">×</button><small>VOLTPro PLC · START A PROJECT</small><h2>Choose a control project</h2><p>Load an executable library example or close this panel to build a blank project.</p><div>{Array.from({ length: 10 }, (_, i) => i + 1).map(id => <button key={id} onClick={() => { try { const project = window.VoltProPLCLibrary?.get(id); if (!project) throw Error('Project library did not load.'); const errors = validate(project); if (errors.length) throw Error(errors.join(' ')); usePLC.getState().setProject(project, false); usePLC.getState().setView(project.mode); usePLC.setState({ inputs: {}, result: null, trace: [], selected: null }); p.setStartupOpen(false); setTimeout(() => fitView({ padding: .18 }), 100); } catch (error) { usePLC.setState({ error: (error as Error).message }); } }}>Library example {id}</button>)}</div><button className="plc-blank" onClick={() => p.setStartupOpen(false)}>Start with a blank project</button></section>}

    <main className="workspace">
      <nav className="plc-rail" aria-label="PLC workspace panels">
        <button title="Device library" aria-label="Device library" aria-expanded={s.left && !libraryOpen} onClick={() => { setLibraryOpen(false); usePLC.setState({ left: !s.left }); }}><CircuitBoard size={18}/></button>
        <button title="Project library" aria-label="Project library" aria-expanded={s.left && libraryOpen} onClick={() => { setLibraryOpen(true); usePLC.setState({ left: true }); }}><FolderOpen size={18}/></button>
        <button title="Search components" aria-label="Search components" onClick={() => { setLibraryOpen(false); usePLC.setState({ left: true }); setTimeout(() => document.querySelector<HTMLInputElement>('.palette .search input')?.focus(), 0); }}><Search size={18}/></button>
        <button title="Commissioning bench" aria-label="Commissioning bench" onClick={() => { setDockTab('commissioning'); usePLC.setState({ right: true }); }}><SlidersHorizontal size={18}/></button>
        <button title="Workspace properties and results" aria-label="Workspace properties and results" onClick={() => { setDockTab('properties'); usePLC.setState({ right: true }); }}><Info size={18}/></button>
      </nav>
      {s.left && (libraryOpen
        ? <aside className="palette" onMouseLeave={() => usePLC.setState({ left: false })}><header><strong>PROJECT LIBRARY</strong><button aria-label="Close project library" onClick={() => usePLC.setState({ left: false })}>×</button></header><section className="plc-library"><p>100,000 parameter variants across 10 original timer/counter logic templates. These are teaching models, not 100,000 distinct installations or certified vendor programs.</p><label>Variant ID <input aria-label="PLC variant number" type="number" min="1" max="100000" value={exampleNumber} onChange={e => setExampleNumber(e.target.value)}/></label><button onClick={() => { try { const project = window.VoltProPLCLibrary?.get(Number(exampleNumber)); if (!project) throw Error('Project library did not load.'); loadLibrary(project); } catch (error) { usePLC.setState({ error: (error as Error).message }); } }}>Load variant</button>{window.VoltProPLCLibrary?.families.map(family => <button key={family.id} onClick={() => setExampleNumber(String(family.first))}>{family.name}</button>)}<button onClick={() => loadLibrary(plant())}>20-drive industrial plant · 40 sheets</button><button onClick={() => loadLibrary(reversing())}>Interlocked reversing control</button><button onClick={() => setLibraryOpen(false)}>Close library</button><p>Up to 100 sheets, 300 total devices and 1,000 wires. Shared coil/auxiliary tags connect control behavior across sheets.</p></section></aside>
        : <Sidebar add={draw} onMouseLeave={() => usePLC.setState({ left: false })}/>)}

      <section className={'canvas canvas-view-' + s.view + (s.right ? ' dock-visible' : '')}>
        {s.view === 'plc' ? <PLCIOView project={s.project}/> : <Canvas add={draw}/>}
        <div className="plc-ruler plc-ruler-top" aria-label="PLC drawing columns">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i}</span>)}</div>
        <div className="plc-ruler plc-ruler-bottom" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i}</span>)}</div>
        <div className="plc-ruler plc-ruler-left" aria-label="PLC drawing rows">{Array.from({ length: 6 }, (_, i) => <span key={i}>{String.fromCharCode(65 + i)}</span>)}</div>
        <div className="plc-ruler plc-ruler-right" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i}>{String.fromCharCode(65 + i)}</span>)}</div>
        <div className="canvas-caption">PLC logic workspace · drag to pan · Ctrl+wheel to zoom<span>{s.view === 'ladder' ? 'LADDER' : s.view === 'fbd' ? 'FUNCTION BLOCK DIAGRAM' : 'PLC I/O'}</span></div>
        <div className={'plc-canvas-status ' + (s.running ? 'running' : '')} role="status">{s.running ? 'RUNNING · 20 ms PLC scan' : 'STOPPED · Run to monitor PLC logic'}</div>
        <section className="plc-title-block" aria-label="PLC program identification"><strong>HEPHZIBAH BEHULAH</strong><b>PLC PROGRAM IDENTIFICATION</b><label>PROJECT NAME<input value={s.project.name} maxLength={100} onChange={e => usePLC.setState({ project: { ...s.project, name: e.target.value } })}/></label><div className="plc-title-grid"><label>DRAFTER<input value={title.drafter} maxLength={80} onChange={e => p.onUpdateTitle({ drafter: e.target.value })}/></label><label>DATE<input type="date" value={title.date} onChange={e => p.onUpdateTitle({ date: e.target.value })}/></label><label>SCALE<input value={title.scale} maxLength={20} onChange={e => p.onUpdateTitle({ scale: e.target.value })}/></label><label>SHEET NUMBER<input value={title.sheetNumber} maxLength={20} onChange={e => p.onUpdateTitle({ sheetNumber: e.target.value })}/></label></div><small>© Hephzibah Behulah · All rights reserved</small></section>
      </section>

      {s.right && <aside className="properties" onMouseLeave={() => usePLC.setState({ right: false })}><header><strong>WORKSPACE DOCK</strong><button aria-label="Collapse properties" onClick={() => usePLC.setState({ right: false })}><PanelRightClose size={18}/></button></header><nav className="plc-dock-tabs" role="tablist" aria-label="Workspace dock tabs"><button role="tab" aria-selected={dockTab === 'properties'} onClick={() => setDockTab('properties')}><Settings size={14}/>Properties</button><button role="tab" aria-selected={dockTab === 'results'} onClick={() => setDockTab('results')}><StepForward size={14}/>Results</button><button role="tab" aria-selected={dockTab === 'commissioning'} onClick={() => setDockTab('commissioning')}>Commissioning</button></nav><div className="plc-dock-content">{dockTab === 'commissioning' ? <Commissioning/> : dockTab === 'results' ? <><h2>Simulation results</h2><div className="tag-list">{Object.entries(s.result?.tags || {}).map(([tag, value]) => <div key={tag}><span>{tag}</span><b className={value ? 'on' : ''}>{value ? 'ON' : 'OFF'}</b></div>)}</div><h3>Recent transitions</h3><ol className="plc-trace">{s.trace.slice(-30).reverse().map((event, index) => <li key={index}>Scan {event.scan} · {event.text}</li>)}</ol><p className="hint">{s.result?.warnings.join(' ') || s.error || 'Run the PLC scan to see output tags and transitions.'}</p></> : selected ? <><h2>{selected.data.kind}</h2>{(['tag', 'label', 'preset', 'pin'] as const).map(key => <label key={key}>{key === 'preset' ? (['CTU', 'CTD'].includes(selected.data.kind) ? 'Counter preset (edges)' : 'Timer preset (ms)') : key === 'pin' ? 'Arduino digital pin' : key}<input disabled={s.running} value={selected.data[key]} type={key === 'pin' || key === 'preset' ? 'number' : 'text'} onChange={e => { const value = key === 'pin' || key === 'preset' ? Number(e.target.value) : e.target.value; s.setProject({ ...s.project, nodes: s.project.nodes.map(node => node.id === selected.id ? { ...node, data: { ...node.data, [key]: value } } : node) }); }}/></label>)}<p>Auxiliary contacts and their coil share a tag. Overload power and control contacts share their trip input when tags match.</p><p className="status">{s.result?.active[selected.id] ? 'ENERGIZED / CLOSED' : 'INACTIVE / OPEN'}</p></> : <><h2>Build. Connect. Run.</h2><p>Drag a device from the library. Connect its numbered terminals. Click a component to edit its tag and parameters.</p><p>The motor example includes a seal-in contact. Release Start after two scans; KM1 stays energized until Stop or overload trips.</p><p>Digital teaching model: live colour means reachable supply or Boolean signal, not a calculated current or certified protection study.</p><p className="hint">Each coil reads the previous scan’s auxiliary state. A1 connects to the switched live rail; A2 returns to N.</p></>}</div><section className="plc-document-settings"><h3>DOCUMENT SETTINGS</h3><label>Grid spacing<select aria-label="Grid spacing" value={s.gridSpacing} onChange={e => updateSettings({ gridSpacing: Number(e.target.value) })}><option value={10}>10 mm</option><option value={20}>20 mm</option><option value={40}>40 mm</option></select></label><label className="plc-setting-toggle">Snap to grid<input type="checkbox" checked={s.snapToGrid} onChange={e => updateSettings({ snapToGrid: e.target.checked })}/></label><label className="plc-setting-toggle">Show drawing grid<input type="checkbox" checked={s.grid} onChange={e => updateSettings({ showGrid: e.target.checked })}/></label><button className="plc-more-settings" aria-expanded={moreSettings} onClick={() => setMoreSettings(value => !value)}><Settings size={14}/>{moreSettings ? 'Less settings' : 'More settings'}</button>{moreSettings && <div className="plc-advanced-settings"><p>Grid and snapping settings are stored with this PLC project.</p><p>Logic scan period: <b>20 ms</b> · Maximum 300 devices and 1,000 wires.</p></div>}</section></aside>}
    </main>

    <footer className="statusbar"><div className="plc-run-controls"><span className={s.running ? 'live-dot' : ''}>{s.running ? '● RUNNING' : '○ STOPPED'}</span><button className={s.running ? 'run stop' : 'run'} onClick={() => usePLC.setState({ running: !s.running, error: '' })}>{s.running ? <Square size={15}/> : <Play size={15}/>} {s.running ? 'Stop' : 'Run'}</button><button title="Single 20 ms scan" disabled={s.running} onClick={p.onStep}><StepForward size={15}/>Single scan</button></div><span>Scan {s.result?.scan || 0}</span><span>{s.project.nodes.length} devices · {s.project.edges.length} wires</span><output role="status">{s.error || s.result?.warnings.join(' ') || 'Ready · Save or export to keep your project.'}</output></footer>
    <AIAssistant/>
  </div>;
}
