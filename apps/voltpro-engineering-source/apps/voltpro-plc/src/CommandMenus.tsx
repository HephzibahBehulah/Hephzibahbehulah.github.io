import type { ReactNode } from 'react';
import type { Kind } from './model';

type CommandMenusProps = {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onCloudSave: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDraw: (kind: Kind) => void;
  onValidate: () => void;
  onFit: () => void;
  sheet: string;
  sheets: { id: string; name: string }[];
  onSheet: (id: string) => void;
  onNewSheet: () => void;
  onLoadExample: () => void;
  onArduino: () => void;
  onReset: () => void;
  onView: (view: 'ladder' | 'fbd' | 'plc') => void;
  onFocusCanvas: () => void;
  onToggleInteractive: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
  running: boolean;
  interactive: boolean;
};

function Menu({ label, children }: { label: string; children: ReactNode }) {
  return <details className="plc-command-menu"><summary>{label}</summary><div className="plc-command-pop">{children}</div></details>;
}

function Item({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={event => { onClick(); event.currentTarget.closest('details')?.removeAttribute('open'); }}>{children}</button>;
}

export function PLCCommandMenus(p: CommandMenusProps) {
  return <nav className="plc-command-menus" aria-label="PLC editor commands">
    <Menu label="File"><Item onClick={p.onNew}>New control project</Item><Item onClick={p.onOpen}>Open / import project JSON…</Item><Item onClick={p.onSave}>Save on this device</Item><Item onClick={p.onCloudSave}>Save private cloud project</Item><Item onClick={p.onExport}>Export PLC project JSON</Item></Menu>
    <Menu label="Edit"><Item disabled={!p.canUndo || p.running} onClick={p.onUndo}>Undo</Item><Item disabled={!p.canRedo || p.running} onClick={p.onRedo}>Redo</Item><Item disabled={!p.canDelete || p.running} onClick={p.onDelete}>Delete selected instruction</Item><Item disabled={!p.canDuplicate || p.running} onClick={p.onDuplicate}>Duplicate selected instruction</Item></Menu>
    <Menu label="Draw"><Item onClick={() => p.onDraw('no')}>Normally open contact</Item><Item onClick={() => p.onDraw('nc')}>Normally closed contact</Item><Item onClick={() => p.onDraw('coil')}>Output coil</Item><Item onClick={() => p.onDraw('TON')}>On-delay timer</Item><Item onClick={() => p.onDraw('AND')}>AND function block</Item></Menu>
    <Menu label="Project"><div className="projectbar plc-system-project-slot"/><label className="plc-menu-field">Drawing sheet<select aria-label="Drawing sheet" value={p.sheet} onChange={event => p.onSheet(event.target.value)}>{p.sheets.map(sheet => <option key={sheet.id} value={sheet.id}>{sheet.name}</option>)}</select></label><Item onClick={p.onNewSheet}>Add drawing sheet</Item><Item onClick={p.onLoadExample}>Load example project</Item><Item onClick={p.onArduino}>Export Arduino sketch</Item></Menu>
    <Menu label="Simulation"><Item disabled={p.running} onClick={p.onReset}>Reset scan memory</Item></Menu>
    <Menu label="Tools"><Item onClick={p.onValidate}>Validate program</Item></Menu>
    <Menu label="View"><Item onClick={() => p.onView('ladder')}>Ladder diagram</Item><Item onClick={() => p.onView('fbd')}>Function block diagram</Item><Item onClick={() => p.onView('plc')}>PLC I/O</Item><Item onClick={p.onFit}>Fit drawing to canvas</Item><Item onClick={p.onToggleInteractive}>{p.interactive ? 'Lock canvas editing' : 'Enable canvas editing'}</Item><Item onClick={p.onFocusCanvas}>Focus canvas</Item></Menu>
  </nav>;
}
