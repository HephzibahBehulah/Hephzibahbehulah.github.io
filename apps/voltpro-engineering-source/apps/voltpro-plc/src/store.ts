import {create} from 'zustand';
import {validate,type Project,type Result} from './model';
import {appendAudit,loadAudit,makeAuditEntry,saveAudit,type AuditEntry} from './audit-history.mjs';

const key='voltpro-plc-project-v1';
function initial():Project{return {version:1,name:'Untitled control project',mode:'ladder',nodes:[],edges:[],settings:{gridSpacing:20,snapToGrid:true,showGrid:true},titleBlock:{drafter:'—',date:new Date().toISOString().slice(0,10),scale:'1:1',sheetNumber:'1 / 1'}};}
function readAudit():AuditEntry[]{try{return loadAudit(localStorage);}catch{return [];}}
function writeAudit(audit:AuditEntry[],set:(state:Partial<State>)=>void){try{if(!saveAudit(localStorage,audit))set({error:'Project edit history could not be saved on this device.'});}catch{set({error:'Project edit history could not be saved on this device.'});}}

interface State {sheet:string;view:'ladder'|'fbd'|'plc';setView:(view:'ladder'|'fbd'|'plc')=>void;trace:{scan:number;text:string}[];project:Project;past:Project[];future:Project[];audit:AuditEntry[];running:boolean;inputs:Record<string,boolean>;result:Result|null;error:string;selected:string|null;grid:boolean;snapToGrid:boolean;gridSpacing:number;interactive:boolean;left:boolean;right:boolean;setProject:(p:Project,history?:boolean)=>void;undo:()=>void;redo:()=>void;toggleInput:(id:string)=>void;save:()=>boolean}
const initialProject=initial();

export const usePLC=create<State>((set,get)=>({project:initialProject,audit:readAudit(),sheet:initialProject.sheets?.[0]?.id||'main',view:initialProject.mode,setView:view=>set({view}),trace:[],past:[],future:[],running:false,inputs:{},result:null,error:'',selected:null,grid:true,snapToGrid:true,gridSpacing:20,interactive:true,left:false,right:true,
setProject:(project,history=true)=>{const errors=validate(project);if(errors.length){set({error:errors.join(' ')});return;}const before=get().project,entry=makeAuditEntry(before,project);const settings=project.settings||{gridSpacing:20,snapToGrid:true,showGrid:true};set(s=>({project:{...project,settings},sheet:project.sheets?.some(p=>p.id===s.sheet)?s.sheet:project.sheets?.[0]?.id||'main',grid:settings.showGrid,snapToGrid:settings.snapToGrid,gridSpacing:settings.gridSpacing,past:history?[...s.past.slice(-49),structuredClone(s.project)]:s.past,future:history?[]:s.future,audit:entry?appendAudit(s.audit,entry):s.audit,result:null,error:'',running:false}));if(entry)writeAudit(get().audit,set);},
undo:()=>{const s=get(),p=s.past.at(-1);if(p){const entry=makeAuditEntry(s.project,p);set({project:p,sheet:p.sheets?.some(x=>x.id===s.sheet)?s.sheet:p.sheets?.[0]?.id||'main',past:s.past.slice(0,-1),future:[s.project,...s.future],audit:entry?appendAudit(s.audit,entry):s.audit,result:null,running:false});if(entry)writeAudit(get().audit,set);}},
redo:()=>{const s=get(),p=s.future[0];if(p){const entry=makeAuditEntry(s.project,p);set({project:p,sheet:p.sheets?.some(x=>x.id===s.sheet)?s.sheet:p.sheets?.[0]?.id||'main',past:[...s.past,s.project],future:s.future.slice(1),audit:entry?appendAudit(s.audit,entry):s.audit,result:null,running:false});if(entry)writeAudit(get().audit,set);}},
toggleInput:id=>set(s=>{const tag=s.project.nodes.find(n=>n.id===id)?.data.tag;const inputs={...s.inputs};for(const n of s.project.nodes)if(n.id===id||n.data.tag===tag)inputs[n.id]=!s.inputs[id];return {inputs};}),
save:()=>{try{localStorage.setItem(key,JSON.stringify(get().project));set({error:'Saved on this device.'});return true;}catch{set({error:'Device storage is full. Export a project file to keep your work.'});return false;}}
}));

