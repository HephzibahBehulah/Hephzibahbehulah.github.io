export const AUDIT_STORAGE_KEY: string;
export const AUDIT_LIMIT: number;
export interface AuditProject {
  version: number;
  name: string;
  mode: string;
  nodes: { id: string; data: { tag?: string; [key: string]: unknown } }[];
  edges: { id: string; source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }[];
  sheets?: unknown[];
  faults?: unknown;
}
export interface AuditEntry {
  id: string;
  at: string;
  groupKey: string;
  summary: string;
  changes: string[];
}
export function makeAuditEntry(before: AuditProject, after: AuditProject, meta?: { id?: string; at?: string }): AuditEntry | null;
export function normalizeAudit(value: unknown): AuditEntry[];
export function parseAudit(value: string | null): AuditEntry[];
export function appendAudit(entries: AuditEntry[], entry: AuditEntry, nowMs?: number): AuditEntry[];
export function loadAudit(storage: Storage | null | undefined): AuditEntry[];
export function saveAudit(storage: Storage | null | undefined, entries: AuditEntry[]): boolean;

