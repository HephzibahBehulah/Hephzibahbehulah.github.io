export interface WiringProject {
  version: number;
  mode: string;
  nodes: { id: string; data: { kind: string; tag: string }; position?: { x: number; y: number } }[];
  edges: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }[];
}
export interface WiringFinding {
  code: string;
  severity: 'error' | 'warning';
  deviceIds: string[];
  message: string;
}
export function analyzePLCWiring(project: WiringProject): WiringFinding[];

