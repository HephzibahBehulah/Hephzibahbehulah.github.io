export function createSchematic3DPackage(documentData){
 const sheet=(documentData?.sheets||[]).find(s=>s.id===documentData.activeSheetId)||(documentData?.sheets||[])[0];
 if(!sheet)throw new Error('The project has no active sheet to preview');
 const equipmentCoordinates=(sheet.parts||[]).map(p=>({tag:p.ref||p.id,name:p.type||'Component',xM:Number(p.x||0)/50,yM:Number(p.y||0)/50,zM:0,widthM:.55,depthM:.38,heightM:.9,rating:p.value||'',manufacturer:p.manufacturer||'',partNumber:p.partNumber||'',electricalValue:p.electricalValue??null,tolerance:p.tolerance??null}));
 const cableRoutes=(sheet.wires||[]).map((w,i)=>({tag:w.ref||'W'+(i+1),x1M:Number(w.x1||0)/50,y1M:Number(w.y1||0)/50,x2M:Number(w.x2||0)/50,y2M:Number(w.y2||0)/50,color:w.color||'#58d9c2',label:w.label||''}));
 return {kind:'schematic-3d-preview',status:'SCHEMATIC 3D PREVIEW — NOT A BUILDING BIM MODEL',project:{name:documentData.projectName||'VoltPro schematic',facility:{buildingZones:[]}},equipmentCoordinates,cableRoutes,assumptions:['Schematic coordinates are scaled to metres for visual preview only; this is not a surveyed site coordinate system.','Component bodies are generic blocks. Wire geometry is schematic routing and does not represent cable tray/conduit elevation or installation route.','Electrical connectivity and device dimensions remain in the 2D project model.'],forConstruction:false};
}
