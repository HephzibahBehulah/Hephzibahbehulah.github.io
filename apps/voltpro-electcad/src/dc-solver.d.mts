import type { Sheet } from './editor-model';
export type DcComponentResult = { ref:string; type:string; voltageDrop:number; current:number; power:number; unit:'V/A/W' };
export type DcNodeResult = { node:string; voltage:number };
export type DcResult = { analysis:string; ground:string; nodeCount:number; componentResults:DcComponentResult[]; nodeResults:DcNodeResult[]; warnings:string[]; metadata:{solver:string;method:string;limitations:string} };
export function runDcOperatingPoint(sheet:Sheet):DcResult;
