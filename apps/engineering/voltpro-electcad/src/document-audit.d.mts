export type DocumentAuditCounts = { sheets: number; devices: number; wires: number };
export type DocumentAuditEntry = {
  at: number;
  project: string;
  before: DocumentAuditCounts;
  after: DocumentAuditCounts;
  changes: DocumentAuditCounts;
};
export function summarizeDocumentSnapshot(snapshot: string | unknown): DocumentAuditCounts;
export function documentAuditKey(projectName: string): string;
export function readDocumentAudit(projectName: string, storage?: Storage): DocumentAuditEntry[];
export function recordDocumentAudit(projectName: string, beforeSnapshot: string | unknown, afterSnapshot: string | unknown, options?: { storage?: Storage; at?: number }): DocumentAuditEntry[];
export function exportDocumentAudit(projectName: string, entries?: DocumentAuditEntry[]): string;
