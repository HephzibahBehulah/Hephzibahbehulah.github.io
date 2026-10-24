import type { ReactNode } from 'react';

type CommandMenusProps = {
  onNew: () => void; onOpen: () => void; onSave: () => void; onExport: () => void;
  onUndo: () => void; onRedo: () => void; onDelete: () => void;
  onDraw: (kind: string) => void; onValidate: () => void; onRun: () => void;
  onGrid: () => void; onFit: () => void; onProject: () => void;
};

function Menu({ label, children }: { label: string; children: ReactNode }) {
  return <details className="plc-command-menu"><summary>{label}</summary><div className="plc-command-pop">{children}</div></details>;
}
function Item({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={event => { onClick(); event.currentTarget.closest('details')?.removeAttribute('open'); }}>{children}</button>;
}

export function PLCCommandMenus(p: CommandMenusProps) {
  return <nav className="plc-command-menus" aria-label="PLC editor commands">
    <Menu label="File"><Item onClick={p.onNew}>New control project</Item><Item onClick={p.onOpen}>Open project JSON…</Item><Item onClick={p.onSave}>Save on this device</Item><Item onClick={p.onExport}>Export PLC project JSON</Item></Menu>
    <Menu label="Edit"><Item onClick={p.onUndo}>Undo</Item><Item onClick={p.onRedo}>Redo</Item><Item onClick={p.onDelete}>Delete selected instruction</Item></Menu>
    <Menu label="Draw"><Item onClick={() => p.onDraw('no')}>Normally open contact</Item><Item onClick={() => p.onDraw('nc')}>Normally closed contact</Item><Item onClick={() => p.onDraw('coil')}>Output coil</Item><Item onClick={() => p.onDraw('TON')}>On-delay timer</Item></Menu>
    <Menu label="Tools"><Item onClick={p.onValidate}>Validate program</Item><Item onClick={p.onRun}>Run / stop simulated scan</Item><Item onClick={p.onProject}>Open project library</Item></Menu>
    <Menu label="View"><Item onClick={p.onGrid}>Toggle logic grid</Item><Item onClick={p.onFit}>Fit program to view</Item></Menu>
  </nav>;
}
