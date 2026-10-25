import type {Project} from './model';
import {catalog,ports} from './model';
import {usePLC} from './store';

const isInputKind=(kind:string)=>['no','nc','selector','breaker','breaker3','overloadNC','overloadNO','overload3','auxNO','auxNC'].includes(kind);
const isOutputKind=(kind:string)=>['coil','lamp','motor','TON','TOF','TONR','CTU','CTD','R_TRIG','F_TRIG','RS','SR'].includes(kind);

export function PLCIOView({project}:{project:Project}){
  const selected=usePLC(s=>s.selected);
  const rows=project.nodes.map(node=>({node,terminals:ports(node.data.kind),direction:isInputKind(node.data.kind)?'Input':isOutputKind(node.data.kind)?'Output':'Power / field device'}));
  return <section className="plc-io-view" aria-label="PLC hardware and I/O view">
    <header><div><small>PLC HARDWARE VIEW</small><h2>{project.name}</h2><p>One project · same device tags, terminals, wires and scan results as the ladder and function block views.</p></div><span>IEC ADDRESS MAP · TEACHING MODEL</span></header>
    <div className="plc-io-notice">Channel numbers are editable logical assignments for this project. They do not claim a selected manufacturer, controller model or certified installation.</div>
    <div className="plc-io-rack"><div className="plc-io-rack-label"><b>CPU</b><span>VOLTPro virtual controller</span><small>{project.nodes.length} project devices</small></div><div className="plc-io-module"><b>Digital input map</b><div>{rows.filter(row=>row.direction==='Input').map(({node})=><button key={node.id} className={selected===node.id?'selected':''} onClick={()=>usePLC.setState({selected:node.id,right:true})}><small>I</small><strong>{node.data.pin}</strong><span>{node.data.tag}</span><em>{node.data.label}</em></button>)}</div></div><div className="plc-io-module"><b>Digital output map</b><div>{rows.filter(row=>row.direction==='Output').map(({node})=><button key={node.id} className={selected===node.id?'selected':''} onClick={()=>usePLC.setState({selected:node.id,right:true})}><small>Q</small><strong>{node.data.pin}</strong><span>{node.data.tag}</span><em>{node.data.label}</em></button>)}</div></div></div>
    <section className="plc-io-registers"><h3>Project device and terminal list</h3><p>Select any row to edit its tag, label, timer preset or logical channel in Properties. Physical terminal designations stay with the component.</p><div className="plc-io-table-wrap"><table><thead><tr><th>IEC tag</th><th>Device</th><th>Role</th><th>Terminals</th><th>Logical channel</th></tr></thead><tbody>{rows.map(({node,terminals,direction})=><tr key={node.id} className={selected===node.id?'selected':''} tabIndex={0} onClick={()=>usePLC.setState({selected:node.id,right:true})} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();usePLC.setState({selected:node.id,right:true})}}}><td>{node.data.tag}</td><td>{catalog.find(item=>item.kind===node.data.kind)?.label||node.data.kind}</td><td>{direction}</td><td>{terminals.join(' · ')}</td><td>{isInputKind(node.data.kind)?'I':'Q'}{node.data.pin}</td></tr>)}</tbody></table></div>
    </section>
  </section>;
}
