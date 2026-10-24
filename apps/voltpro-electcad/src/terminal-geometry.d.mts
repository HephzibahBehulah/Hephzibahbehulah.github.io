export type TerminalPoint = { x: number; y: number };
export type TerminalPart = {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation?: number;
  mirrorX?: boolean;
};

export function terminalOffsets(type: string): TerminalPoint[];
export function terminalCount(type: string): number;
export function terminalId(componentId: string, index: number): string;
export function terminalLabel(type: string, index: number): string;
export function connectablePins(part: TerminalPart): TerminalPoint[];
