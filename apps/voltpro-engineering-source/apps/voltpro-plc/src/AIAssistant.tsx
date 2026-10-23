import {useState} from 'react';
import {validate,type Project} from './model';
import {usePLC} from './store';

const contract='VoltProPLC project contract: JSON object {version:1,name,mode:"ladder"|"fbd",nodes:[{id,type:"device",position:{x,y},data:{kind,tag,label,preset,pin}}],edges:[{id,source,target,sourceHandle,targetHandle}]}. Supported kinds: supply, neutral, earth, threephase, breaker, breaker3, no, nc, selector, auxNO, auxNC, overloadNC, overloadNO, overload3, contactor3, coil, lamp, motor, TON, TOF, TONR, CTU, CTD, R_TRIG, F_TRIG, RS, SR, AND, OR, NOT. Use unique IDs/tags, real supported kinds, valid terminal handles. A project must validate against the PLC model before import. Return the project as fenced JSON; never claim it has been imported.';

export function AIAssistant(){
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[proposal,setProposal]=useState<Project|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const ask=async()=>{
  const prompt=question.trim();if(!prompt||busy)return;
  setBusy(true);setError('');setAnswer('');setProposal(null);
  try{
   const token=await (window as any).VoltProAccount?.token?.();
   const response=await fetch('/api/engineering/chat',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify({tool:'plc',messages:[{role:'user',content:prompt}],siteContext:contract,stream:true}),signal:AbortSignal.timeout(60000)});
   if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'AI service unavailable. Try again.');}
   const reader=response.body?.getReader();if(!reader)throw new Error('AI streaming is unavailable. Try again.');
   const decoder=new TextDecoder();let buffer='',text='';const handle=(line:string)=>{if(!line.startsWith('data:'))return;let event:any;try{event=JSON.parse(line.slice(5).trim());}catch{return;}if(event.type==='reset'){text='';setAnswer('');}else if(event.type==='delta'){text+=String(event.text||'');setAnswer(text);}else if(event.type==='error')throw new Error(event.error||'AI service unavailable. Try again.');};
   while(true){const part=await reader.read();if(part.done)break;buffer+=decoder.decode(part.value,{stream:true});const lines=buffer.split(/\\r?\\n/);buffer=lines.pop()||'';for(const line of lines)handle(line);}
   if(buffer)handle(buffer);if(!text.trim())throw new Error('The AI returned no answer. Try a smaller request.');
   const code=text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
   if(code){try{const p=JSON.parse(code) as Project;if(validate(p).length===0)setProposal(p);}catch{}}
  }catch(e){setError(e instanceof Error?e.message:'AI service unavailable. Try again.');}
  finally{setBusy(false);}
 };
 const importProject=()=>{if(!proposal)return;const errors=validate(proposal);if(errors.length){setError(errors.join(' '));return;}usePLC.getState().setProject(proposal);setOpen(false);};
 return <div className="plc-ai"><button className="plc-ai-launch" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>⌘ PLC AI</button>{open&&<section className="plc-ai-panel" aria-label="PLC AI assistant"><header><strong>VoltPRo PLC AI</strong><button onClick={()=>setOpen(false)} aria-label="Close assistant">×</button></header><p>IEC 61131-3 help and reviewable PLC program proposals.</p><label htmlFor="plc-ai-prompt">Describe your control task</label><textarea id="plc-ai-prompt" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Example: create a start/stop seal-in circuit with overload protection" rows={3}/><button onClick={ask} disabled={busy||!question.trim()}>{busy?'Thinking…':'Ask PLC AI'}</button>{error&&<p role="alert">{error}</p>}{answer&&<pre className="plc-ai-answer">{answer}</pre>}{proposal&&<button onClick={importProject}>Validate and import project</button>}</section>}</div>;
}
