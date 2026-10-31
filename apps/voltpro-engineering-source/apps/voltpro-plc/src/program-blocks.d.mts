export type ProgramBlockKind = 'main' | 'subroutine' | 'interrupt';
export type ProgramBlock = { id: string; name: string; kind: ProgramBlockKind; sheetId: string; trigger?: string };
export type ProgramCall = { id: string; fromBlockId: string; toBlockId: string };
export function normalizeProgramStructure<T extends object>(project: T): T & { sheets: { id: string; name: string }[]; programBlocks: ProgramBlock[]; programCalls: ProgramCall[] };
export function validateProgramStructure(value: unknown): string[];
export function createProgramBlock<T extends object>(project: T, input: { id: string; sheetId: string; name: string; kind?: 'subroutine' | 'interrupt'; trigger?: string }): ReturnType<typeof normalizeProgramStructure<T>>;
export function createProgramCall<T extends object>(project: T, input: { id: string; fromBlockId: string; toBlockId: string }): ReturnType<typeof normalizeProgramStructure<T>>;
