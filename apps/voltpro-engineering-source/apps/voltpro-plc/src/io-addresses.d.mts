export interface IoDevice {
  id: string;
  data: { kind: string; tag: string; label: string; sheet?: string };
  position: { x: number; y: number };
}
export interface IoProject {
  nodes: IoDevice[];
  sheets?: { id: string; name: string }[];
}
export interface IoMapEntry {
  node: IoDevice;
  direction: 'input' | 'output' | null;
  address: string | null;
  sheetId: string;
  sheetName: string;
  references: IoDevice[];
}
export function resolveIoMap(project: IoProject): IoMapEntry[];
export interface HardwareBomLine {
  id: string;
  description: string;
  quantity: number;
  channelsUsed: number;
  capacity: number | null;
  addressRange: string;
  tags: string[];
}
export function buildHardwareBom(project: IoProject): HardwareBomLine[];

