import type { ComponentKind, Point } from './editor-model';

export function terminalId(componentId: string, index: number): string;
export function terminalLabel(type: ComponentKind, index: number): string;
export function connectablePins(part: { id: string; type: ComponentKind; x: number; y: number; rotation?: number; mirrorX?: boolean }): Point[];
