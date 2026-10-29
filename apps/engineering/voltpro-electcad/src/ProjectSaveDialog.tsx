import { useState } from 'react';
import type { ProjectMetadata } from './editor-model';

export type ProjectSaveForm = {
  name: string;
  organisation: string;
  projectNumber: string;
  client: string;
  engineer: string;
  revision: string;
  description: string;
};

type Props = {
  name: string;
  metadata: ProjectMetadata;
  busy: boolean;
  status: string;
  onCancel: () => void;
  onSaveLocal: (form: ProjectSaveForm) => void;
  onSaveCloud: (form: ProjectSaveForm) => void;
};

export default function ProjectSaveDialog({ name, metadata, busy, status, onCancel, onSaveLocal, onSaveCloud }: Props) {
  const [form, setForm] = useState<ProjectSaveForm>({
    name,
    organisation: metadata.organisation || '',
    projectNumber: metadata.projectNumber || 'VP-001',
    client: metadata.client || '',
    engineer: metadata.engineer || '',
    revision: metadata.revision || 'A',
    description: metadata.description || '',
  });
  const update = (key: keyof ProjectSaveForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const valid = Boolean(form.name.trim());
  return <div className="modal-scrim" role="presentation" onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
    <section className="settings-modal project-save-modal" role="dialog" aria-modal="true" aria-label="Save VoltPro project">
      <div className="modal-heading"><div><strong>Save VoltPro project</strong><span>Choose a name, organisation, and destination.</span></div><button className="tiny-btn" aria-label="Close save dialog" disabled={busy} onClick={onCancel}>×</button></div>
      <div className="save-form-grid">
        <label>Project name<input autoFocus value={form.name} onChange={e => update('name', e.target.value)} maxLength={200} required /></label>
        <label>Organisation<input value={form.organisation} onChange={e => update('organisation', e.target.value)} maxLength={200} /></label>
        <label>Project number<input value={form.projectNumber} onChange={e => update('projectNumber', e.target.value)} maxLength={80} /></label>
        <label>Revision<input value={form.revision} onChange={e => update('revision', e.target.value)} maxLength={20} /></label>
        <label>Client / customer<input value={form.client} onChange={e => update('client', e.target.value)} maxLength={200} /></label>
        <label>Engineer / designer<input value={form.engineer} onChange={e => update('engineer', e.target.value)} maxLength={200} /></label>
        <label className="save-form-wide">Description<input value={form.description} onChange={e => update('description', e.target.value)} maxLength={500} /></label>
      </div>
      <div className="save-destination-label">SAVE DESTINATION</div>
      <div className="save-dialog-actions">
        <button className="outline-btn" disabled={!valid || busy} onClick={() => onSaveLocal(form)}>Save local project file</button>
        <button className="primary-btn" disabled={!valid || busy} onClick={() => onSaveCloud(form)}>{busy ? 'Saving…' : 'Save to VoltPro Cloud'}</button>
      </div>
      <p className="save-dialog-note">Cloud projects are private to your signed-in VoltPro account. Local save downloads an editable .vpcad.json project file.</p>
      {status && <p className="save-dialog-status" role="status">{status}</p>}
    </section>
  </div>;
}
