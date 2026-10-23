(()=>{"use strict";
function markdown(project,results={}){
 const lines=["# VoltPRo Engineering Report","","## Project",project.metadata?.name||"Untitled Circuit","","## Components","| ID | Type | Parameters |","|---|---|---|"];
 for(const c of project.components||[])lines.push("| "+c.id+" | "+c.type+" | "+JSON.stringify(c.props||{}).replaceAll("|","\\|")+" |");
 const panel=project.panel;
 lines.push("","","## Panel layout");
 if(!panel)lines.push("No panel layout saved.");
 else{
  lines.push("Enclosure: "+(panel.enclosure?.label||"Main distribution board"),"IP rating: "+(panel.enclosure?.ipRating||"unspecified"),"Dimensions: "+(panel.width||600)+" × "+(panel.height||400)+" mm","","### DIN rails","| Rail | Length (modules) |","|---|---:|");
  for(const r of panel.rails||[])lines.push("| "+(r.label||r.id)+" | "+(r.length||18)+" |");
  lines.push("","","### Device placements","| Label | Type | Schematic component | Rail | Position (mm) | Width (mm) |","|---|---|---|---|---:|---:|");
  for(const x of panel.items||[])lines.push("| "+String(x.label||x.id).replaceAll("|","\\|")+" | "+String(x.type||"accessory")+" | "+String(x.componentId||"panel-only")+" | "+String(x.railId||"")+" | "+Number(x.position||0)+" | "+Number(x.width||18)+" |");
  lines.push("","","### Accessories","- Cable ducts: "+(panel.ducts||[]).length,"- Terminal strips: "+(panel.terminalStrips||[]).length);
  const validation=window.VoltProPanel?.validate?.(panel);
  if(validation)lines.push("- Layout validation: "+(validation.valid?"passed":"errors found"),...validation.errors.map(x=>"- Error: "+x),...validation.warnings.map(x=>"- Warning: "+x));
 }
 lines.push("","","## Wiring","Wires: "+(project.wires||[]).length,"","## Analysis");
 const fence=String.fromCharCode(96).repeat(3);
 for(const [k,v] of Object.entries(results))lines.push("### "+k,fence+"json",JSON.stringify(v,null,2),fence);
 lines.push("","> Educational output. Verify real installations against current standards and manufacturer documentation.");
 return lines.join("\n");
}
function json(project,results={}){return JSON.stringify({format:"voltpro-engineering-report",version:1,project,results,generatedAt:new Date().toISOString()},null,2)}
window.VoltProDocs={markdown,json};
})();