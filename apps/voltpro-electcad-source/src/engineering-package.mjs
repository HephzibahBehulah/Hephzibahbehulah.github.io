import {equipmentProxyDimensions} from './engineering-tools.mjs';
// Deterministic preliminary engineering package generator.
// Results are concept-level estimates only. Missing project data is surfaced as an assumption.
const round=(n,d=2)=>Number(n.toFixed(d));
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const kWToA=(kw,v,pf=0.9,phases=3)=>kw*1000/(Math.sqrt(phases===3?3:1)*v*pf);
const csvEscape=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const svgEsc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export function createIndustrialFacilityPackage(input={}) {
  const facility={name:input.name||'12,000 m² Industrial Manufacturing Facility',areaM2:12000,productionM2:7000,warehouseM2:3000,administrationM2:2000,productionCeilingM:12,utilityKV:11,distributionV:415,controlV:24,conceptSiteBoundsM:{width:180,height:140},buildingZones:[{name:'Production hall',xM:5,yM:5,widthM:70,depthM:100,areaM2:7000,clearHeightM:12},{name:'Warehouse',xM:80,yM:5,widthM:50,depthM:60,areaM2:3000},{name:'Administration',xM:80,yM:70,widthM:40,depthM:50,areaM2:2000}]};
  const loads=[
    {name:'CNC machines',quantity:15,unitKW:75,utilization:0.75,critical:false},
    {name:'Industrial motors',quantity:8,unitKW:150,utilization:0.8,critical:false},
    {name:'HVAC units',quantity:4,unitKW:120,utilization:0.9,critical:false},
    {name:'Lighting',quantity:1,unitKW:250,utilization:1,critical:true},
    {name:'Office power',quantity:1,unitKW:180,utilization:0.7,critical:false},
    {name:'Fire protection',quantity:1,unitKW:80,utilization:1,critical:true}
  ].map(x=>({...x,connectedKW:x.quantity*x.unitKW,demandKW:x.quantity*x.unitKW*x.utilization}));
  const connectedKW=sum(loads.map(x=>x.connectedKW));
  const coincidentBeforeDiversityKW=sum(loads.map(x=>x.demandKW));
  const diversityFactor=0.85;
  const maximumDemandKW=coincidentBeforeDiversityKW*diversityFactor;
  const reserveFraction=0.25;
  const designDemandKW=maximumDemandKW*(1+reserveFraction);
  const pf=0.9;
  const designKVA=designDemandKW/pf;
  const transformerKVA=4000;
  const transformerRatedLV_A=transformerKVA*1000/(Math.sqrt(3)*facility.distributionV);
  const transformerRatedHV_A=transformerKVA*1000/(Math.sqrt(3)*facility.utilityKV*1000);
  const transformerUkPct=6;
  const idealTransformerFaultKA=transformerRatedLV_A/(transformerUkPct/100)/1000;
  const essentialLightingKW=62.5,essentialOfficeKW=27,fireKW=80,controlAndNetworkKW=20;
  const estimatedEssentialKW=essentialLightingKW+essentialOfficeKW+fireKW+controlAndNetworkKW;
  const essentialKVA=estimatedEssentialKW/0.9;
  const generatorKVA=1500,upsKVA=60;
  const cableSchedule=loads.map((l,i)=>{
    const kw=l.demandKW;
    const currentA=kWToA(kw,facility.distributionV,pf);
    const assumedRouteM=[95,125,80,220,90,110][i];
    return {id:'CBL-'+String(i+1).padStart(3,'0'),service:l.name,voltageV:facility.distributionV,phase:'3P (assumed)',demandKW:round(kw),designCurrentA:round(currentA),preliminaryCable:'To be selected after installation method, derating, grouping, ambient temperature and voltage-drop check',estimatedRouteM:assumedRouteM,quantity:l.quantity,termination:'To be defined',status:'PRELIMINARY — not for procurement'};
  });
  const equipment=[
    {tag:'TX-01',name:'11/0.415 kV transformer',xM:155,yM:20,zM:0,zone:'Outdoor transformer yard',rating:'4,000 kVA',clearance:'Manufacturer and local fire/separation rules required'},
    {tag:'RMU-01',name:'11 kV ring main unit',xM:135,yM:20,zM:0,zone:'MV intake room',rating:'11 kV; fault rating by utility study',clearance:'MV access and arc-flash boundary to be engineered'},
    {tag:'MSB-01',name:'415 V main switchboard',xM:130,yM:35,zM:0,zone:'Main electrical room',rating:'4,000 kVA transformer basis',clearance:'Manufacturer service clearance required'},
    {tag:'MCC-PROD-01',name:'Production MCC',xM:65,yM:40,zM:0,zone:'Production electrical room',rating:'Motor feeders to be individually engineered',clearance:'Working space and escape route required'},
    {tag:'DB-WH-01',name:'Warehouse distribution board',xM:110,yM:20,zM:0,zone:'Warehouse',rating:'Requires finalized load schedule and feeder fault study',clearance:'Maintain access and egress'},
    {tag:'DB-ADM-01',name:'Administration distribution board',xM:110,yM:90,zM:0,zone:'Administration electrical closet',rating:'Requires finalized load schedule and feeder fault study',clearance:'Maintain access and egress'},
    {tag:'GEN-01',name:'Diesel generator',xM:155,yM:50,zM:0,zone:'Outdoor generator yard',rating:'1,500 kVA specified by user',clearance:'Ventilation, exhaust, fuel, noise and fire design required'},
    {tag:'ATS-01',name:'Automatic transfer switch',xM:130,yM:50,zM:0,zone:'Essential electrical room',rating:'Rated after essential-load and fault study',clearance:'Interlocking and neutral/earthing scheme required'},
    {tag:'UPS-01',name:'Control/SCADA UPS',xM:130,yM:60,zM:0,zone:'Control room',rating:'60 kVA concept allowance',clearance:'Runtime, redundancy and battery autonomy not yet specified'}
  ];
  const boq=[
    ['11 kV RMU assembly',1,'set','Concept quantity; utility protection/interface to be confirmed'],
    ['11/0.415 kV transformer, 4 MVA',1,'unit','Preliminary size from demand assumptions; verify thermal/parallel/impedance design'],
    ['415 V main switchboard',1,'assembly','Busbar, form of separation, Icw/Ipk and protection study required'],
    ['Production MCC',1,'assembly','Feeder count and motor starting study required'],
    ['Distribution boards',2,'assemblies','Warehouse and administration concept only'],
    ['Diesel generator, 1,500 kVA',1,'unit','User-specified; not proven to support all loads'],
    ['Automatic transfer switch',1,'unit','Essential load only; rating to be calculated'],
    ['Control/SCADA UPS, 60 kVA',1,'unit','Concept allowance; autonomy and redundancy require verified sizing inputs'],
    ['MV cable route',1,'route','Route length and cable construction require site survey and installation details'],
    ['LV power cables',sum(loads.map(l=>l.quantity)),'circuits','Cross-sections not selected; route lengths are preliminary estimates only'],
    ['Cable tray/trunking',1,'system','Requires detailed route layout, tray sizing and fill calculation'],
    ['Earth grid conductor',1,'system','Conductor size, grid geometry and electrode count require soil resistivity and fault-clearing data'],
    ['Lightning protection system',1,'system','Risk assessment and air-terminal design required']
  ].map(([item,quantity,unit,note])=>({item,quantity,unit,note}));
  const protection=[
    {device:'Utility incomer relay',function:'50/51, 50N/51N as applicable',setting:'Not set — utility fault level, CT/VT data and coordination curves required'},
    {device:'Transformer differential',function:'87T',setting:'Not set — transformer vector group, CT ratios and inrush restraint required'},
    {device:'Transformer backup',function:'50/51; earth fault as applicable',setting:'Not set — transformer impedance, earthing arrangement and upstream protection required'},
    {device:'LV main ACB',function:'LSIG',setting:'Not set — verified load, cable ampacity, Icw/Icu and selectivity study required'},
    {device:'MCC motor feeders',function:'Overload, short-circuit, earth fault',setting:'Per motor nameplate, start method, cable and manufacturer curves'},
    {device:'Generator protection',function:'Voltage/frequency, overload, earth fault',setting:'Not set — alternator data and earthing/neutral scheme required'},
    {device:'Arc-flash study',function:'Incident energy / boundary',setting:'Cannot calculate without source model, clearing times and equipment data'}
  ];
  const groundGrid={conceptBoundsM:{x:0,y:0,width:180,height:140},conceptMeshSpacingM:5,conductors:'Concept 5 m grid only; conductor material/cross-section not selected',electrodes:'Indicative perimeter and corners; quantity and depth require soil resistivity and IEEE 80 study',earthResistanceOhm:null,reasonNoNumericResult:'Soil resistivity, fault current split, grid geometry, clearing time and touch/step criteria are not provided.'};
  const clashes=[
    {id:'CL-001',severity:'INFO',status:'NOT RUN',finding:'No geometric clash engine or complete 3D building/services model is available in this concept package.',action:'Import coordinated architectural/structural/MEP models and run a spatial clash check.'},
    {id:'CL-002',severity:'REVIEW',status:'OPEN',finding:'Generator, transformer yard and electrical room positions are indicative coordinates, not checked against the building plan.',action:'Verify fire separation, access, lifting routes, ventilation, noise and statutory clearances.'},
    {id:'CL-003',severity:'REVIEW',status:'OPEN',finding:'Cable tray route lengths are estimates, not routed lengths from a coordinated 3D model.',action:'Route in a surveyed model and recalculate length, fill, support spacing and voltage drop.'}
  ];
  const assumptions=[
    'Concept/preliminary package generated from the user prompt; not issued for construction.',
    'Load utilization factors: CNC 0.75, industrial motors 0.80, HVAC 0.90, lighting 1.00, office 0.70, fire protection 1.00. Confirm with actual operating profiles.',
    'Aggregate diversity factor 0.85 is an explicit concept assumption, not a code-mandated value.',
    'Power factor assumed 0.90 for demand conversion; harmonics, motor starts and power-factor correction are not modelled.',
    '4,000 kVA transformer is a preliminary standard-size selection above the calculated apparent demand; verify redundancy, ambient, harmonics, overload and future operating profile.',
    'The user-specified 1,500 kVA generator is not sized to support the full facility. Essential load allowance is a separate concept estimate and requires load sequencing/motor-start validation.',
    '60 kVA UPS is an allowance only; autonomy, load profile, redundancy and battery end-of-life sizing are missing.',
    'Ideal LV transformer-terminal fault estimate assumes an infinite upstream source and transformer impedance of 6%; it is not a final short-circuit study and must not be used to select equipment.',
    'Cable cross-sections, breaker settings, arc-flash results, earth resistance and standards conformity are intentionally not fabricated where required inputs are absent.',
    'All equipment coordinates are concept coordinates in metres relative to an assumed 180 m × 140 m site-local origin; building footprints are rectangular area-equivalent assumptions, not surveyed/georeferenced.',
    'IEC/IEEE/NFPA references in the prompt require review against current applicable editions and local authority requirements by qualified engineers.'
  ];
  return {
    schemaVersion:'voltpro-engineering-package/1.0',generatedAt:new Date().toISOString(),status:'PRELIMINARY CONCEPT — NOT FOR CONSTRUCTION',
    project:{name:facility.name,facility,standardsRequested:['IEC 60364','IEC 61439','IEEE 80','IEC 62305','NFPA 70','IEEE 1584'],revision:'P01'},
    calculations:{connectedLoadKW:round(connectedKW),utilizedLoadBeforeDiversityKW:round(coincidentBeforeDiversityKW),diversityFactor,maximumDemandKW:round(maximumDemandKW),futureReservePercent:25,designDemandWithReserveKW:round(designDemandKW),assumedPowerFactor:pf,designApparentPowerKVA:round(designKVA),selectedTransformerKVA:transformerKVA,transformerLoadingPercent:round(designKVA/transformerKVA*100),transformerRatedLVCurrentA:round(transformerRatedLV_A),transformerRatedHVCurrentA:round(transformerRatedHV_A),assumedTransformerImpedancePercent:transformerUkPct,idealTransformerTerminalFaultEstimateKA:round(idealTransformerFaultKA),generatorSpecifiedKVA:generatorKVA,estimatedEssentialLoadKW:round(estimatedEssentialKW),estimatedEssentialLoadKVA:round(essentialKVA),generatorEssentialLoadLoadingPercent:round(essentialKVA/generatorKVA*100),upsConceptKVA:upsKVA,notes:['Fault estimate is transformer-only idealized and excludes upstream impedance, cables and motor contribution.','Generator capacity is not proof of motor-start or transient performance.']},
    loadSchedule:loads,cableSchedule,protection,groundGrid,equipmentCoordinates:equipment,billOfQuantities:boq,clashReport:clashes,assumptions,
    deliverables:{singleLineDiagram:'Concept topology available in package data; detailed protection and ratings require study inputs.',threeLineDiagram:'Not generated: source/earthing/CT/VT and feeder details are insufficient.',panelLayouts:'Concept equipment coordinates included; dimensions and clearances not validated.',cableTrayPlans:'Not generated as routed geometry; estimated route lengths only.',roomElevations:'Not generated; architectural/structural model required.',sections:'Not generated; site geometry and elevations required.',transformerYard:'Concept equipment positions only; separation and fire requirements unverified.',bimModel:'IFC4 concept massing export is available from the editor; this package is not a fully classified or validated BIM model.',dwg:'Package data is not a DWG file; the editor offers experimental LibreDWG DXF-to-DWG conversion through the optional API.'}
  };
}
export function createSmartSubstationPackage() {
  return {
    schemaVersion:'voltpro-engineering-package/1.0',generatedAt:new Date().toISOString(),status:'PRELIMINARY CONCEPT — NOT FOR CONSTRUCTION',
    project:{name:'132/33/11 kV Smart Substation with Solar and BESS Integration',standardsRequested:['IEC 61850','IEC 60255','IEC 61936-1','IEEE 80','IEC 62305','IEC 60076'],facility:{name:'Concept smart substation site',conceptSiteBoundsM:{width:240,height:220},buildingZones:[{name:'132 kV switchyard',xM:10,yM:10,widthM:80,depthM:80,clearHeightM:12},{name:'33 kV switchyard',xM:100,yM:20,widthM:45,depthM:60,clearHeightM:8},{name:'11 kV and control building',xM:150,yM:20,widthM:70,depthM:60,clearHeightM:6},{name:'Solar inverter zone',xM:10,yM:130,widthM:90,depthM:60,clearHeightM:5},{name:'BESS compound',xM:110,yM:130,widthM:70,depthM:50,clearHeightM:5}]}},
    architecture:[
      {tag:'BAY-132-01',name:'132 kV grid incomer bay',voltageKV:132,protection:'Distance/line differential subject to utility scheme'},
      {tag:'TR-132-01',name:'132/33 kV power transformer',voltageKV:'132/33',protection:'87T, REF/earth fault and backup overcurrent subject to studies'},
      {tag:'BUS-33-01',name:'33 kV busbar and feeder bays',voltageKV:33,protection:'Busbar protection and feeder protection scheme to be defined'},
      {tag:'TR-33-01',name:'33/11 kV transformer',voltageKV:'33/11',protection:'Transformer differential and backup protection to be defined'},
      {tag:'BUS-11-01',name:'11 kV switchboard',voltageKV:11,protection:'Arc-resistant design and short-circuit duty subject to study'},
      {tag:'PV-01',name:'Solar farm collector/inverter block',voltageKV:'0.4/33',protection:'Anti-islanding, grid code, harmonic and protection studies required'},
      {tag:'BESS-01',name:'Battery energy storage system',voltageKV:'0.4/33',protection:'BMS, PCS, thermal runaway, fire, grid-code and islanding studies required'},
      {tag:'SCADA-01',name:'SCADA / IEC 61850 station bus',voltageKV:null,protection:'SCL engineering, GOOSE, time sync, cybersecurity and interoperability testing required'}
    ],
    equipmentCoordinates:[{tag:'BAY-132-01',name:'132 kV grid incomer bay',xM:25,yM:25,zM:0,widthM:12,depthM:20,heightM:8,rating:'132 kV; current and fault duty not specified',geometryBasis:'Concept envelope only'},{tag:'TR-132-01',name:'132/33 kV power transformer',xM:65,yM:35,zM:0,widthM:12,depthM:10,heightM:8,rating:'MVA rating not specified',geometryBasis:'Concept envelope only'},{tag:'BUS-33-01',name:'33 kV busbar and feeder bays',xM:120,yM:40,zM:0,widthM:25,depthM:5,heightM:3,rating:'33 kV; bus rating not specified',geometryBasis:'Concept envelope only'},{tag:'TR-33-01',name:'33/11 kV transformer',xM:112,yM:52,zM:0,widthM:8,depthM:7,heightM:5,rating:'MVA rating not specified',geometryBasis:'Concept envelope only'},{tag:'BUS-11-01',name:'11 kV switchboard',xM:165,yM:35,zM:0,widthM:14,depthM:3,heightM:2.6,rating:'11 kV; short-circuit duty not specified',geometryBasis:'Concept envelope only'},{tag:'PV-01',name:'Solar farm collector/inverter block',xM:25,yM:145,zM:0,widthM:20,depthM:12,heightM:4,rating:'MW rating not specified',geometryBasis:'Concept envelope only'},{tag:'BESS-01',name:'Battery energy storage system',xM:125,yM:145,zM:0,widthM:18,depthM:12,heightM:4,rating:'MW/MWh not specified',geometryBasis:'Concept envelope only'},{tag:'SCADA-01',name:'SCADA / IEC 61850 control equipment',xM:190,yM:40,zM:0,widthM:5,depthM:3,heightM:2.4,rating:'I/O list and architecture not specified',geometryBasis:'Concept envelope only'}],
    cableRoutes:[{tag:'R-132-01',label:'132 kV incomer to transformer bay',x1M:31,y1M:25,x2M:59,y2M:35},{tag:'R-33-01',label:'132/33 kV transformer to 33 kV bus',x1M:71,y1M:35,x2M:107.5,y2M:40},{tag:'R-33-02',label:'33 kV bus to 33/11 kV transformer',x1M:120,y1M:42.5,x2M:116,y2M:52},{tag:'R-11-01',label:'33/11 kV transformer to 11 kV switchboard',x1M:116,y1M:52,x2M:158,y2M:35},{tag:'R-PV-01',label:'Solar inverter concept connection',x1M:35,y1M:145,x2M:107.5,y2M:40},{tag:'R-BESS-01',label:'BESS concept connection',x1M:125,y1M:139,x2M:120,y2M:42.5}],
    calculations:{status:'NOT CALCULATED',reason:'Transformer MVA, short-circuit level, grounding, utility grid data, solar MW, BESS MW/MWh, fault ride-through and operating philosophy are not specified.'},
    deliverables:{SLD:'Concept architecture only',relayLogic:'Not generated without approved protection philosophy and I/O list',groundGrid:'Requires soil resistivity and fault clearing data',cableNetwork:'Requires site survey and route model',BIM:'Concept 3D site massing, generic equipment envelopes and conceptual route segments are generated. Manufacturer geometry, detailed services, validated clearances and coordinated BIM remain required.',BOQ:'Equipment classes listed; quantities and ratings require detailed design inputs'},
    assumptions:['No transformer ratings or protection settings are invented.','PV and BESS interconnection must be assessed against the applicable utility grid code.','This package is an engineering brief and deliverable register, not a construction design.']
  };
}
export function packageToCsv(pkg,section='loadSchedule') {
  const rows=pkg[section];
  if(!Array.isArray(rows)) return '';
  const headers=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  return [headers.map(csvEscape).join(','),...rows.map(r=>headers.map(h=>csvEscape(typeof r[h]==='object'?JSON.stringify(r[h]):r[h])).join(','))].join('\r\n');
}

export function renderSingleLineSvg(pkg) {
  const isSubstation=String(pkg.project?.name||'').includes('Smart Substation');
  const nodes=isSubstation?[
    ['GRID','132 kV GRID'],['BAY-132','132 kV INCOMER'],['TR-132','132/33 kV TX'],['BUS-33','33 kV BUS'],['TR-33','33/11 kV TX'],['BUS-11','11 kV BUS'],['PV','SOLAR / PCS'],['BESS','BESS / PCS'],['SCADA','SCADA / IEC 61850']
  ]:[
    ['GRID','UTILITY 11 kV'],['RMU','RMU-01'],['TX','TX-01 · 4 MVA'],['MSB','415 V MAIN SWITCHBOARD'],['MCC','PRODUCTION MCC'],['WH','WAREHOUSE DB'],['ADM','ADMIN DB'],['GEN','GEN-01 · 1,500 kVA'],['ATS','ATS-01'],['UPS','UPS-01 · 60 kVA'],['ESS','ESSENTIAL DB']
  ];
  const edges=isSubstation?[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[5,7],[5,8]]:[[0,1],[1,2],[2,3],[3,4],[3,5],[3,6],[7,8],[8,10],[8,9]];
  const width=1120,height=isSubstation?520:610,cols=3,boxW=240,boxH=68,gapX=120,gapY=70,startX=40,startY=55;
  const positions=nodes.map((n,i)=>({x:startX+(i%cols)*(boxW+gapX),y:startY+Math.floor(i/cols)*(boxH+gapY)}));
  const edgeSvg=edges.map(([a,b])=>{const p=positions[a],q=positions[b];const x1=p.x+boxW/2,y1=p.y+boxH,x2=q.x+boxW/2,y2=q.y;const mid=(y1+y2)/2;return `<path d="M ${x1} ${y1} V ${mid} H ${x2} V ${y2}" fill="none" stroke="#16b8a6" stroke-width="2"/>`}).join('');
  const nodeSvg=nodes.map((n,i)=>{const p=positions[i];return `<g><rect x="${p.x}" y="${p.y}" width="${boxW}" height="${boxH}" rx="7" fill="#12232e" stroke="#16b8a6" stroke-width="1.5"/><text x="${p.x+12}" y="${p.y+25}" fill="#f1f7fa" font-family="Arial,sans-serif" font-size="13" font-weight="700">${n[1].replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text><text x="${p.x+12}" y="${p.y+48}" fill="#8da8b8" font-family="Arial,sans-serif" font-size="10">${n[0]}</text></g>`}).join('');
  const title=String(pkg.project?.name||'VoltPro concept SLD').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#09151d"/><text x="40" y="28" fill="#e8f3f7" font-family="Arial,sans-serif" font-size="16" font-weight="700">${title} — CONCEPT SINGLE-LINE DIAGRAM</text>${edgeSvg}${nodeSvg}<text x="40" y="${height-16}" fill="#f1b85a" font-family="Arial,sans-serif" font-size="11" font-weight="700">PRELIMINARY CONCEPT — NOT FOR CONSTRUCTION · Connections are functional architecture, not protection design.</text></svg>`;
}

export function renderSiteLayoutSvg(pkg) {
  const facility=pkg.project?.facility;
  if(!facility?.buildingZones||!pkg.equipmentCoordinates) return '';
  const scale=5.2,ox=70,oy=90,siteW=facility.conceptSiteBoundsM.width,siteH=facility.conceptSiteBoundsM.height;
  const W=ox*2+siteW*scale,H=oy*2+siteH*scale;
  const grid=[];
  for(let x=0;x<=siteW;x+=10)grid.push(`<line x1="${ox+x*scale}" y1="${oy}" x2="${ox+x*scale}" y2="${oy+siteH*scale}" stroke="#203744" stroke-width="0.7"/>`);
  for(let y=0;y<=siteH;y+=10)grid.push(`<line x1="${ox}" y1="${oy+y*scale}" x2="${ox+siteW*scale}" y2="${oy+y*scale}" stroke="#203744" stroke-width="0.7"/>`);
  const colors=['#163b4a','#26394a','#3b3349'];
  const zones=facility.buildingZones.map((z,i)=>`<g><rect x="${ox+z.xM*scale}" y="${oy+z.yM*scale}" width="${z.widthM*scale}" height="${z.depthM*scale}" fill="${colors[i%colors.length]}" fill-opacity=".88" stroke="#7ba2b3" stroke-width="1.5"/><text x="${ox+(z.xM+z.widthM/2)*scale}" y="${oy+(z.yM+z.depthM/2)*scale}" text-anchor="middle" fill="#f0f7fa" font-family="Arial,sans-serif" font-size="13" font-weight="700">${svgEsc(z.name)}</text><text x="${ox+(z.xM+z.widthM/2)*scale}" y="${oy+(z.yM+z.depthM/2)*scale+17}" text-anchor="middle" fill="#b6ced8" font-family="Arial,sans-serif" font-size="10">${Number.isFinite(z.areaM2)?z.areaM2.toLocaleString()+" m²":"Concept zone"}</text></g>`).join('');
  const equip=pkg.equipmentCoordinates.map(e=>{const dims=equipmentProxyDimensions(e),w=dims.widthM*scale,d=dims.depthM*scale,x=ox+(Number(e.xM||0)-dims.widthM/2)*scale,y=oy+(Number(e.yM||0)-dims.depthM/2)*scale;return `<g><rect x="${x}" y="${y}" width="${w}" height="${d}" rx="2" fill="#f2b85d" fill-opacity=".78" stroke="#ffe0a6" stroke-width="1"/><text x="${x+w+3}" y="${y-3}" fill="#ffe0a6" font-family="Arial,sans-serif" font-size="10" font-weight="700">${svgEsc(e.tag||e.name)}</text><title>${svgEsc(e.name)} · center (${e.xM}, ${e.yM}, ${e.zM||0}) m · ${dims.widthM} × ${dims.depthM} m concept footprint</title></g>`}).join('');
  const title=String(facility.name||'Facility').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#09151d"/><text x="${ox}" y="32" fill="#e8f3f7" font-family="Arial,sans-serif" font-size="17" font-weight="700">${title} — CONCEPT SITE LAYOUT</text><text x="${ox}" y="52" fill="#8da8b8" font-family="Arial,sans-serif" font-size="11">Local coordinates in metres · schematic footprints and equipment locations only</text><rect x="${ox}" y="${oy}" width="${siteW*scale}" height="${siteH*scale}" fill="#0d1b24" stroke="#7894a2" stroke-width="2"/>${grid.join('')}${zones}${equip}<text x="${ox}" y="${oy+siteH*scale+25}" fill="#f1b85a" font-family="Arial,sans-serif" font-size="11" font-weight="700">PRELIMINARY CONCEPT — NOT FOR CONSTRUCTION · Clearances, fire separation, access, egress and clashes are not verified.</text></svg>`;
}
