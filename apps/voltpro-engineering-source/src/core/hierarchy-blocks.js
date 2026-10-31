/* VoltPro reusable schematic blocks with typed interface terminals. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VoltProHierarchyBlocks = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const domains = new Set(["dc","ac","ac1","ac3","three-phase","three_phase","control","signal","logic","digital","analog","data","ground","pneumatic","hydraulic","mechanical","thermal","optical","unknown"]);
  const endpoint = wire => ({ a: String(wire.a ?? wire.from ?? ""), b: String(wire.b ?? wire.to ?? "") });
  const split = value => { const i = String(value).lastIndexOf(":"); return i < 1 ? null : { deviceId:String(value).slice(0,i), terminalId:String(value).slice(i+1) }; };
  const key = (deviceId, terminalId) => String(deviceId)+":"+String(terminalId);
  const validName = value => typeof value === "string" && value.trim().length > 0 && value.trim().length <= 80;
  const instanceType = definitionId => "hierarchy-" + String(definitionId);
  const isInstance = type => String(type||"").startsWith("hierarchy-");
  function validateDefinition(definition) {
    const errors=[];
    if(!definition||typeof definition!=="object")return {valid:false,errors:["Definition must be an object."]};
    if(!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(String(definition.id||"")))errors.push("Block ID is invalid.");
    if(!validName(definition.name))errors.push("Block name must contain 1–80 characters.");
    if(!Array.isArray(definition.components)||!definition.components.length)errors.push("A block must contain at least one component.");
    if(!Array.isArray(definition.wires)||!Array.isArray(definition.ports)||!definition.ports.length)errors.push("A block needs wires and at least one typed interface port.");
    const devices=new Map((definition.components||[]).map(component=>[String(component.id),component]));
    if(devices.size!==(definition.components||[]).length)errors.push("Component IDs must be unique within a block.");
    const terminalKeys=new Set();
    for(const device of devices.values()){
      const terminals=device.terminals||[];
      if(!terminals.length)errors.push("Every block component needs explicit terminals.");
      for(const terminal of terminals){const id=String(terminal.id||"");if(!id||terminalKeys.has(key(device.id,id)))errors.push("Terminal IDs must be unique within each component.");terminalKeys.add(key(device.id,id));}
    }
    const wireIds=new Set();
    for(const wire of definition.wires||[]){const {a,b}=endpoint(wire);if(!wire.id||wireIds.has(String(wire.id)))errors.push("Block wire IDs must be present and unique.");wireIds.add(String(wire.id));for(const value of [a,b]){const part=split(value);if(!part||!devices.has(part.deviceId)||!terminalKeys.has(value))errors.push("Block wire endpoint does not resolve: "+value);}}
    const portIds=new Set(),members=new Set();
    for(const port of definition.ports||[]){
      if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(String(port.id||""))||portIds.has(String(port.id)))errors.push("Port IDs must be stable and unique.");portIds.add(String(port.id));
      if(!validName(port.label)||!port.type||!domains.has(port.domain)||!['input','output','bidirectional','passive'].includes(port.direction||"passive"))errors.push("Each port needs a label, type, supported domain and direction.");
      const member=split(port.memberTerminal||"");if(!member||!terminalKeys.has(String(port.memberTerminal)))errors.push("Port does not map to an internal terminal: "+String(port.memberTerminal));
      if(members.has(String(port.memberTerminal)))errors.push("Each internal terminal may expose only one block port.");members.add(String(port.memberTerminal));
      const target=member&&devices.get(member.deviceId)?.terminals?.find(item=>String(item.id)===member.terminalId);
      if(target&&(target.type||"electrical")!==port.type||target&&((target.domain||"dc")!==port.domain))errors.push("Port type and domain must match its internal terminal: "+String(port.id));
    }
    return {valid:errors.length===0,errors:[...new Set(errors)]};
  }
  function createFromSelection(project, selectedIds, name, id) {
    if(!validName(name))throw Error("Enter a name of up to 80 characters for the block.");
    const selected=new Set((selectedIds||[]).map(String)), components=(project.components||[]), wires=(project.wires||[]).map(w=>({...clone(w),...endpoint(w)}));
    if(!selected.size||![...selected].every(value=>components.some(component=>String(component.id)===value)))throw Error("Select one or more components to create a block.");
    const selectedComponents=components.filter(component=>selected.has(String(component.id)));
    if(selectedComponents.some(component=>isInstance(component.type)))throw Error("Select source components rather than an existing hierarchical block.");
    const internal=[], boundary=[], ports=[], portByTerminal=new Map();
    for(const wire of wires){const {a,b}=endpoint(wire),left=split(a),right=split(b),aInside=left&&selected.has(left.deviceId),bInside=right&&selected.has(right.deviceId);if(aInside&&bInside)internal.push(wire);else if(aInside||bInside)boundary.push({wire,inside:aInside?a:b,external:aInside?b:a});}
    if(!boundary.length)throw Error("Connect the selected components to the rest of the schematic so the block has at least one interface port.");
    const definitionFor=component=>component?.terminals?.length?component:project.definitionFor?.(component?.type);
    const terminalFor=(deviceId,terminalId)=>{const component=selectedComponents.find(item=>String(item.id)===deviceId);const def=definitionFor(component),terminals=def?.terminals||[];let terminal=/^\d+$/.test(terminalId)?terminals[Number(terminalId)]:null;if(!terminal)terminal=terminals.find(item=>String(item.id)===terminalId);if(!terminal)throw Error("Cannot identify typed terminal "+deviceId+":"+terminalId);return terminal;};
    const canonicalTerminal=value=>{const ref=split(value);if(!ref)throw Error("Invalid selected terminal: "+value);return key(ref.deviceId,String(terminalFor(ref.deviceId,ref.terminalId).id));};
    for(const item of boundary){if(portByTerminal.has(item.inside))continue;const ref=split(item.inside),terminal=terminalFor(ref.deviceId,ref.terminalId),port={id:"P"+(ports.length+1),label:String(terminal.label||terminal.id||portByTerminal.size+1).slice(0,80),type:String(terminal.type||"electrical"),domain:String(terminal.domain||"dc"),direction:["input","output","bidirectional","passive"].includes(terminal.direction)?terminal.direction:"passive",memberTerminal:canonicalTerminal(item.inside)};if(!domains.has(port.domain))throw Error("Terminal "+item.inside+" has an unsupported domain.");ports.push(port);portByTerminal.set(item.inside,port.id);}
    const center=selectedComponents.reduce((sum,component)=>({x:sum.x+Number(component.x||0)/selectedComponents.length,y:sum.y+Number(component.y||0)/selectedComponents.length}),{x:0,y:0});
    const blockId=String(id||"Block_"+Date.now());
    const definition={id:blockId,name:name.trim(),components:selectedComponents.map(component=>({...clone(component),terminals:clone(definitionFor(component)?.terminals||[]),x:Number(component.x||0)-center.x,y:Number(component.y||0)-center.y})),wires:internal.map(wire=>{const copy=clone(wire),ends=endpoint(copy);copy.a=canonicalTerminal(ends.a);copy.b=canonicalTerminal(ends.b);return copy}),ports:ports.map((port,index)=>({...port,position:{x:port.direction==="output"?60:-60,y:(index-(ports.length-1)/2)*24}}))};
    const check=validateDefinition(definition);if(!check.valid)throw Error(check.errors.join(" "));
    const instanceId="HB_"+blockId.replace(/[^A-Za-z0-9_.-]/g,"_")+"_"+Date.now().toString(36);
    const externalWires=wires.filter(wire=>!internal.includes(wire)).map(wire=>{const copy={...clone(wire),...endpoint(wire)},ends=endpoint(copy);if(portByTerminal.has(ends.a))copy.a=instanceId+":"+portByTerminal.get(ends.a);if(portByTerminal.has(ends.b))copy.b=instanceId+":"+portByTerminal.get(ends.b);return copy;});
    const instance={id:instanceId,type:instanceType(blockId),x:center.x,y:center.y,rotation:0,props:{subcircuitId:blockId,name:definition.name},terminals:definition.ports.map(port=>({id:port.id,label:port.label,type:port.type,domain:port.domain,direction:port.direction,position:clone(port.position)}))};
    return {components:[...components.filter(component=>!selected.has(String(component.id))),instance],wires:externalWires,subcircuits:[...(project.subcircuits||[]).map(clone),definition],instance,definition};
  }
  function flatten(project) {
    const definitions=new Map((project.subcircuits||[]).map(definition=>[String(definition.id),definition]));
    const outputComponents=[],outputWires=[],exposed=new Map(),flattenedIds=new Set();
    const qualify=(prefix,id)=>prefix+"__"+String(id).replace(/[^A-Za-z0-9_.-]/g,"_");
    function expand(definitionId,prefix,stack){
      if(stack.includes(definitionId))throw Error("Recursive hierarchical block reference: "+[...stack,definitionId].join(" → "));
      const definition=definitions.get(definitionId);if(!definition)throw Error("Missing hierarchical block definition: "+definitionId);
      const checked=validateDefinition(definition);if(!checked.valid)throw Error("Invalid hierarchical block "+definition.name+": "+checked.errors.join(" "));
      const childPorts=new Map(),localComponents=[],localWires=[];
      for(const component of definition.components){
        const mappedId=qualify(prefix,component.id);
        if(isInstance(component.type)){
          const childId=String(component.props?.subcircuitId||""),child=expand(childId,mappedId,[...stack,definitionId]);
          localComponents.push(...child.components);localWires.push(...child.wires);
          for(const port of child.ports)childPorts.set(key(component.id,port.id),port.memberTerminal);
        }else {localComponents.push({...clone(component),id:mappedId});flattenedIds.add(mappedId);}
      }
      const mapTerminal=value=>{const part=split(value);if(!part)throw Error("Invalid hierarchical terminal: "+value);return childPorts.get(value)||key(qualify(prefix,part.deviceId),part.terminalId);};
      for(const wire of definition.wires){const {a,b}=endpoint(wire);localWires.push({...clone(wire),id:qualify(prefix,wire.id),a:mapTerminal(a),b:mapTerminal(b)});}
      const ports=definition.ports.map(port=>({...clone(port),memberTerminal:mapTerminal(port.memberTerminal)}));
      return {components:localComponents,wires:localWires,ports};
    }
    for(const component of project.components||[]){
      if(!isInstance(component.type)){outputComponents.push(clone(component));continue;}
      const id=String(component.props?.subcircuitId||""),expanded=expand(id,String(component.id),[]);
      outputComponents.push(...expanded.components);outputWires.push(...expanded.wires);
      for(const port of expanded.ports)exposed.set(key(component.id,port.id),port.memberTerminal);
    }
    const mapEndpoint=value=>exposed.get(value)||value;
    for(const wire of project.wires||[]){const {a,b}=endpoint(wire);outputWires.push({...clone(wire),a:mapEndpoint(a),b:mapEndpoint(b)});}
    const numericFlatEndpoint=value=>{const part=split(value);if(!part||!flattenedIds.has(part.deviceId))return value;const component=outputComponents.find(item=>String(item.id)===part.deviceId),index=(component?.terminals||[]).findIndex(terminal=>String(terminal.id)===part.terminalId);if(index<0)throw Error("Flattened wire references unknown terminal "+value);return key(part.deviceId,String(index));};
    for(const wire of outputWires){wire.a=numericFlatEndpoint(wire.a);wire.b=numericFlatEndpoint(wire.b);}
    return {components:outputComponents,wires:outputWires};
  }
  return {validateDefinition,createFromSelection,flatten,instanceType,isInstance};
});
