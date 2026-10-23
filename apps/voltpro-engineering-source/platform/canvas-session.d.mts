export class CanvasSession {
  constructor(options: {
    tool: string; read: () => unknown; restore: (data: any) => void | Promise<void>; clear: () => void | Promise<void>;
    save: () => void | Promise<void>; isEmpty: (data: any) => boolean; onCleanOpen?: () => void; onRestore?: () => void;
    legacyKeys?: string[]; preserveCurrent?: boolean;
  });
  markSaved(): void;
  markClean(): void;
  markChanged(): void;
  dispose(): void;
}
export function installCanvasSessionStyles(documentRef?: Document): void;
