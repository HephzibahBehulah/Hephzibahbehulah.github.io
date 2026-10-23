export const VIRTUAL_CATALOG_SIZE:number;
export const PAGE_PRESETS:number[];
export type ProjectTemplate={id:string;name:string;family:string;scope:string};
export function listProjectTemplates(query?:string):ProjectTemplate[];
export function getVirtualCatalogEntry(index:number):{catalogId:string;index:number;variantOrdinal:number;templateId:string;name:string;region:string;scale:string;voltage:string;profile:string;scope:string};
export function catalogSummary():{virtualProjectCount:number;materializedProjectFiles:number;templateFamilies:number;regions:number;scales:number;voltageProfiles:number;designProfiles:number;mode:string;note:string};
export function generateProjectStudioPackage(input?:{prompt?:string;templateId?:string;projectName?:string;pageCount?:number;region?:string;profile?:string}):any;
export function projectPackageToCsv(pkg:any,section?:string):string;

export function generateCatalogProject(index:number,pageCount?:number):any;
export function projectPackageToDocument(pkg:any):import('./editor-model').Document;
