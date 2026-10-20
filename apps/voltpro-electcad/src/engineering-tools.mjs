// Engineering utilities used by the VoltPro editor. Numerical methods are deterministic,
// inputs/assumptions are carried into every result, and outputs are never represented as certified.
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
const round=(n,d=3)=>Number(n.toFixed(d));
export function equipmentProxyDimensions(e={}){
 const tag=String(e.tag||'').toUpperCase(),name=String(e.name||'').toLowerCase();
 let d=[1.2,1,1.8];
 if(tag.startsWith('BAY-132'))d=[12,20,8];
 else if(tag.startsWith('TR-132'))d=[12,10,8];
 else if(tag.startsWith('BUS-33'))d=[25,5,3];
 else if(tag.startsWith('TR-33'))d=[8,7,5];
 else if(tag.startsWith('BUS-11'))d=[14,3,2.6];
 else if(tag.startsWith('PV-'))d=[20,12,4];
 else if(tag.startsWith('BESS-'))d=[18,12,4];
 else if(tag.startsWith('SCADA-'))d=[5,3,2.4];
 else if(tag.startsWith('TX-')||name.includes('transformer'))d=[4.5,3,3.5];
 else if(tag.startsWith('GEN-')||name.includes('generator'))d=[5,2.5,2.5];
 else if(tag.startsWith('RMU'))d=[2.2,1.2,2];
 else if(/^(MSB|MCC|DB)/.test(tag)||name.includes('switchboard')||name.includes('distribution board'))d=[2.4,.9,2.2];
 else if(/^(ATS|UPS)/.test(tag))d=[1.2,.8,2];
 const valid=(v,fallback)=>finite(v)&&v>0?v:fallback;
 return {widthM:valid(e.widthM,d[0]),depthM:valid(e.depthM,d[1]),heightM:valid(e.heightM,d[2])};
}
export const IEC_CABLE_SECTIONS_MM2=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300,400,500,630];
// Illustrative base ampacity for copper PVC multicore cable, 3 loaded conductors, reference conditions.
// This is an engineering screening table, not a substitute for the applicable IEC 60364-5-52 table.
const BASE_AMPACITY_A={1.5:14,2.5:20,4:26,6:34,10:46,16:61,25:80,35:99,50:119,70:151,95:182,120:210,150:240,185:273,240:321,300:367,400:438,500:502,630:578};
export function calculateCableSizing(input={}){
 const {loadKW,voltageV,phase=3,powerFactor=0.9,efficiency=1,lengthM=30,material='copper',ambientC=30,groupedCircuits=1,installationFactor=1,permissibleDropPercent=3,protectiveDeviceA=0,shortCircuitKA=0,clearingTimeS=1,insulation='PVC',conductorTempC=70,reactanceOhmPerKm=0.08}=input;
 let sectionValues={...BASE_AMPACITY_A};const ampacityTable=input.ampacityTable;if(ampacityTable!==undefined){if(!Array.isArray(ampacityTable)||ampacityTable.length<1||ampacityTable.length>IEC_CABLE_SECTIONS_MM2.length)throw new Error('Manufacturer ampacity table must be a non-empty array of at most '+IEC_CABLE_SECTIONS_MM2.length+' section/ampacity rows');const supplied={};for(const row of ampacityTable){if(!row||!IEC_CABLE_SECTIONS_MM2.includes(row.sectionMM2)||!finite(row.ampacityA)||row.ampacityA<=0||row.ampacityA>10000||supplied[row.sectionMM2]!==undefined)throw new Error('Manufacturer ampacity table has an unsupported section, duplicate size, or invalid ampacity');supplied[row.sectionMM2]=row.ampacityA;}sectionValues=supplied;}const sectionList=Object.keys(sectionValues).map(Number).sort((a,b)=>a-b);
 const errors=[];
 for(const [key,value] of Object.entries({loadKW,voltageV,phase,powerFactor,efficiency,lengthM,ambientC,groupedCircuits,installationFactor,permissibleDropPercent,protectiveDeviceA,shortCircuitKA,clearingTimeS,conductorTempC,reactanceOhmPerKm}))if(!finite(value))errors.push(key+' must be a finite number');
 if(loadKW<=0||voltageV<=0||phase!==1&&phase!==3||powerFactor<=0||powerFactor>1||efficiency<=0||efficiency>1||lengthM<0||lengthM>1000000||groupedCircuits<1||groupedCircuits>100||!Number.isInteger(groupedCircuits)||installationFactor<=0||installationFactor>2||permissibleDropPercent<=0||permissibleDropPercent>100||ambientC< -20||ambientC>100||!['copper','aluminium'].includes(material)||!['PVC','XLPE'].includes(insulation)||protectiveDeviceA<0||shortCircuitKA<0||shortCircuitKA>1000||clearingTimeS<=0||clearingTimeS>1000||conductorTempC<20||conductorTempC>150||reactanceOhmPerKm<0||reactanceOhmPerKm>10)errors.push('Electrical and installation inputs are outside permitted ranges');
 if(errors.length)throw new Error(errors.join('; '));
 const currentA=loadKW*1000/(phase===3?Math.sqrt(3)*voltageV:voltageV)/powerFactor/efficiency;
 const ambientFactor=ambientC<=30?1:ambientC<=35?.94:ambientC<=40?.87:ambientC<=45?.79:ambientC<=50?.71:ambientC<=55?.61:.5;
 const groupingFactor=groupedCircuits<=1?1:groupedCircuits===2?.8:groupedCircuits===3?.7:groupedCircuits<=5?.6:groupedCircuits<=8?.54:.5;
 const materialFactor=ampacityTable!==undefined?1:material==='aluminium'?.78:1;
 const correctedCurrentA=currentA/(ambientFactor*groupingFactor*installationFactor*materialFactor);
 const sections=sectionList.filter(s=>sectionValues[s]>=correctedCurrentA);
 const selected=sections[0]||null;
 const rho20=material==='aluminium'?.02826:.01724;const tempCoeff=material==='aluminium'?.00403:.00393;const rho=rho20*(1+tempCoeff*(conductorTempC-20));const resistanceOhmPerKmAtOperatingTemp=rho*1000;const sinPhi=Math.sqrt(Math.max(0,1-powerFactor*powerFactor));const drop=(s)=>{const rOhmPerM=rho/s,xOhmPerM=reactanceOhmPerKm/1000;const perM=currentA*lengthM*(rOhmPerM*powerFactor+xOhmPerM*sinPhi);return phase===3?Math.sqrt(3)*perM:2*perM};
 const voltageDropPercent=selected?drop(selected)/voltageV*100:null;
 let voltageDropSection=sectionList.find(s=>drop(s)/voltageV*100<=permissibleDropPercent)||null;
 const selectedAfterDrop=selected&&voltageDropSection?Math.max(selected,voltageDropSection):null;
 const adiabaticSection=shortCircuitKA>0&&clearingTimeS>0?shortCircuitKA*1000*Math.sqrt(clearingTimeS)/(insulation==='XLPE'?143:115):null;
 const finalSection=selectedAfterDrop&&adiabaticSection?sectionList.find(s=>s>=Math.max(selectedAfterDrop,adiabaticSection))||null:selectedAfterDrop;
 const ratedAmpacity=finalSection?BASE_AMPACITY_A[finalSection]*ambientFactor*groupingFactor*installationFactor*materialFactor:null;
 const deviceCheck=protectiveDeviceA>0&&ratedAmpacity!==null?{protectiveDeviceA,designCurrentA:round(currentA),correctedCableAmpacityA:round(ratedAmpacity),passes:currentA<=protectiveDeviceA&&protectiveDeviceA<=ratedAmpacity}:null;
  const sectionAssessment=sectionList.map(section=>{const correctedAmpacityA=sectionValues[section]*ambientFactor*groupingFactor*installationFactor*materialFactor;const dropPercent=drop(section)/voltageV*100;const ampacityPass=correctedAmpacityA>=currentA;const voltageDropPass=dropPercent<=permissibleDropPercent;const shortCircuitPass=adiabaticSection===null||section>=adiabaticSection;const protectiveDevicePass=protectiveDeviceA===0||(currentA<=protectiveDeviceA&&protectiveDeviceA<=correctedAmpacityA);return {sectionMM2:section,baseAmpacityA:sectionValues[section],correctedAmpacityA:round(correctedAmpacityA),voltageDropPercent:round(dropPercent),ampacityPass,voltageDropPass,shortCircuitPass,protectiveDevicePass,passes:ampacityPass&&voltageDropPass&&shortCircuitPass&&protectiveDevicePass}});
  const selectedSectionAssessment=sectionAssessment.find(x=>x.sectionMM2===finalSection)||null;
 return {status:finalSection&&selectedSectionAssessment?.passes?'SCREENING RESULT — ENGINEER VERIFICATION REQUIRED':'NO SECTION IN SCREENING TABLE SATISFIES ALL INPUTS',sectionAssessment,selectedSectionAssessment,inputs:{...input,phase,material,insulation},currentA:round(currentA),correctionFactors:{ambient:ambientFactor,grouping:groupingFactor,installation:installationFactor,material:materialFactor,combined:round(ambientFactor*groupingFactor*installationFactor*materialFactor)},requiredBaseAmpacityA:round(correctedCurrentA),ampacityCandidateMM2:selected,voltageDrop:{selectedCandidatePercent:selected?round(voltageDropPercent):null,finalSelectedSectionPercent:finalSection?round(drop(finalSection)/voltageV*100):null,limitPercent:permissibleDropPercent,minimumSectionMM2:voltageDropSection,resistanceOhmPerKmAtOperatingTemp:finalSection?round(resistanceOhmPerKmAtOperatingTemp/finalSection,4):null,resistanceCoefficientOhmMm2PerKm:round(resistanceOhmPerKmAtOperatingTemp,4),reactanceOhmPerKm,conductorTempC,powerFactorUsed:powerFactor,calculatedUsingRAndXScreeningModel:true},shortCircuit:{faultKA:shortCircuitKA,clearingTimeS,adiabaticMinimumMM2:adiabaticSection===null?null:round(adiabaticSection),kFactor:insulation==='XLPE'?143:115},selectedSectionMM2:finalSection,correctedSelectedAmpacityA:ratedAmpacity===null?null:round(ratedAmpacity),protectiveDeviceCheck:deviceCheck,assumptions:[ampacityTable!==undefined?'User-supplied ampacity table was used as the base rating for the specified conductor material and insulation; ambient, grouping and installation correction factors are still applied. Verify its source, cable construction, installation method, conductor count, terminal temperature and applicable standard table before relying on it.':'The embedded base ampacity table is illustrative copper/PVC reference data; XLPE and aluminium selections do not use a complete separate standards ampacity table. Do not treat these values as a validated IEC 60364-5-52 sizing result.' ,'Select the exact applicable IEC 60364-5-52 table for installation method, conductor count, insulation and conductor material.','Voltage drop uses user-entered/screening reactance and temperature-adjusted conductor resistance; verify actual cable R/X data, installation temperature and manufacturer data.','The adiabatic check assumes the supplied fault current and clearing time are correct; verify the conductor/device let-through data.','Confirm PE conductor, neutral harmonics, parallel conductors, grouping, fire performance, terminal temperature, installation method, and local rules.'],forConstruction:false};
}
export function iecInverseTime(currentA,pickupA,timeMultiplier=1,curve='standard-inverse'){
 if(![currentA,pickupA,timeMultiplier].every(finite)||currentA<=pickupA||pickupA<=0||timeMultiplier<=0)throw new Error('Relay current must exceed positive pickup and time multiplier must be positive');
 const ratio=currentA/pickupA;
 const constants={'standard-inverse':[0.14,0.02],'very-inverse':[13.5,1],'extremely-inverse':[80,2],'long-time-inverse':[120,1]};
 if(!constants[curve])throw new Error('Unsupported IEC inverse-time curve: '+curve);
 const [k,alpha]=constants[curve];
 return round(timeMultiplier*k/(Math.pow(ratio,alpha)-1),4);
}
const validateManufacturerCurve=points=>{
 if(!Array.isArray(points)||points.length<2||points.length>100)throw new Error('Manufacturer curve must contain 2–100 current/time points');
 const clean=points.map(p=>({currentA:p?.currentA,timeS:p?.timeS}));
 for(let i=0;i<clean.length;i++){const p=clean[i];if(!finite(p.currentA)||!finite(p.timeS)||p.currentA<=0||p.timeS<=0||(i>0&&(p.currentA<=clean[i-1].currentA||p.timeS>clean[i-1].timeS)))throw new Error('Manufacturer curve points require positive, ascending current and positive, non-increasing operating time');}
 return clean;
};
const interpolateManufacturerCurve=(points,currentA)=>{
 if(currentA<points[0].currentA||currentA>points[points.length-1].currentA)throw new Error('Fault-current sweep is outside the supplied manufacturer curve range; extrapolation is disabled');
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(currentA<=b.currentA){if(currentA===a.currentA)return a.timeS;if(currentA===b.currentA)return b.timeS;const f=(Math.log(currentA)-Math.log(a.currentA))/(Math.log(b.currentA)-Math.log(a.currentA));return round(Math.exp(Math.log(a.timeS)+f*(Math.log(b.timeS)-Math.log(a.timeS))),4);}}
 return points[points.length-1].timeS;
};
export function assessProtectionPair({downstreamPickupA,upstreamPickupA,downstreamTMS=0.1,upstreamTMS=0.2,faultCurrentA,curve='standard-inverse',requiredMarginS=0.3}={}){
 const down=iecInverseTime(faultCurrentA,downstreamPickupA,downstreamTMS,curve);
 const up=iecInverseTime(faultCurrentA,upstreamPickupA,upstreamTMS,curve);
 const margin=round(up-down,4);
 return {status:margin>=requiredMarginS?'PASS FOR THE ENTERED IDEALIZED CURVE POINT ONLY':'FAIL / REVIEW AT THE ENTERED CURVE POINT',curve,faultCurrentA,downstream:{pickupA:downstreamPickupA,TMS:downstreamTMS,operatingTimeS:down},upstream:{pickupA:upstreamPickupA,TMS:upstreamTMS,operatingTimeS:up},selectivityMarginS:margin,requiredMarginS,pointPasses:margin>=requiredMarginS,assumptions:['This compares one idealized current point using IEC inverse curve equations; it is not a validated coordination study.','No CT error/saturation, relay tolerance, breaker opening time, damage curves, transformer inrush, motor starting, earth-fault network or manufacturer-specific curves are included.','A complete study requires all source operating modes, minimum/maximum fault levels and all device curves.']};
}
const esc=s=>String(s??'').replace(/[^\x20-\x7E]/g,'?').replace(/'/g,"''").replace(/[()\\]/g,'');
export function exportDrawingDxf(documentData){
 const sheet=documentData.sheets.find(s=>s.id===documentData.activeSheetId)||documentData.sheets[0];
 const pairs=[];const add=(...v)=>pairs.push(...v.map(String));
 const line=(x1,y1,x2,y2,layer='ELECTRICAL')=>add(0,'LINE',8,layer,10,x1,20,-y1,30,0,11,x2,21,-y2,31,0);
 const circle=(x,y,r,layer='SYMBOLS')=>add(0,'CIRCLE',8,layer,10,x,20,-y,30,0,40,r);
 const text=(x,y,h,value,layer='LABELS')=>add(0,'TEXT',8,layer,10,x,20,-y,30,0,40,h,1,esc(value).slice(0,240));
 const rect=(x1,y1,x2,y2,layer='SYMBOLS')=>{line(x1,y1,x2,y1,layer);line(x2,y1,x2,y2,layer);line(x2,y2,x1,y2,layer);line(x1,y2,x1,y1,layer)};
 add(0,'SECTION',2,'HEADER',9,'$ACADVER',1,'AC1009',0,'ENDSEC',0,'SECTION',2,'TABLES');
 add(0,'TABLE',2,'LTYPE',70,1,0,'LTYPE',2,'CONTINUOUS',70,0,3,'Solid line',72,65,73,0,40,0,0,'ENDTAB');
 add(0,'TABLE',2,'LAYER',70,5);
 for(const [name,color] of [['0',7],['ELECTRICAL',7],['WIRES',4],['DEVICE_TAGS',3],['LABELS',8]])add(0,'LAYER',2,name,70,0,62,color,6,'CONTINUOUS');
 add(0,'ENDTAB',0,'ENDSEC',0,'SECTION',2,'BLOCKS',0,'ENDSEC',0,'SECTION',2,'ENTITIES');
 for(const w of sheet.wires){line(w.x1,w.y1,w.x2,w.y1,'WIRES');line(w.x2,w.y1,w.x2,w.y2,'WIRES');if(w.ref)text(w.x1,w.y1-8,8,w.ref,'DEVICE_TAGS');if(w.label)text(w.x1,w.y1-16,8,w.label,'LABELS');}
 for(const p of sheet.parts){
  const x=p.x,y=p.y,t=p.type;const left=x-38,right=x+38;
  if(['resistor','variable-resistor','potentiometer','potentiometer-trimmer','thermistor'].includes(t)){line(left,y,x-15,y);rect(x-15,y-9,x+15,y+9);line(x+15,y,right,y);if(t!=='resistor')line(x-8,y+15,x+9,y-15);}
  else if(['capacitor','polarized-capacitor','capacitor-variable'].includes(t)){line(left,y,x-5,y);line(x-5,y-13,x-5,y+13);line(x+5,y-13,x+5,y+13);line(x+5,y,right,y);}
  else if(t.includes('ground')){line(x,y-10,x,y+7);line(x-13,y+7,x+13,y+7);line(x-8,y+12,x+8,y+12);line(x-3,y+17,x+3,y+17);}
  else if(['power','battery','voltage-source-ac','current-source','generator','alternator'].includes(t)){line(left,y,x-14,y);circle(x,y,14);line(x-6,y,x+6,y);line(x,y-6,x,y+6);line(x+14,y,right,y);}
  else if(['motor','three-phase-motor','fan'].includes(t)){line(left,y,x-16,y);circle(x,y,16);line(x+16,y,right,y);text(x-4,y+4,9,t==='three-phase-motor'?'3~':'M','SYMBOLS');}
  else if(['switch','push-button-no','push-button-nc','selector-switch','limit-switch','emergency-stop','relay-contact-no','relay-contact-nc','circuit-breaker','circuit-breaker-3p','fuse','isolator','switch-disconnector','contactor-main','contactor-3p','thermal-overload','thermal-relay'].includes(t)){line(left,y,x-14,y);line(x+14,y,right,y);circle(x-14,y,2);circle(x+14,y,2);line(x-12,y-2,x+9,y-12);}
  else if(['lamp','led','diode','zener-diode','photodiode'].includes(t)){line(left,y,x-14,y);circle(x,y,14);line(x-8,y-8,x+8,y+8);line(x+8,y-8,x-8,y+8);line(x+14,y,right,y);}
  else if(['inductor','inductor-core','ferrite-bead'].includes(t)){line(left,y,x-15,y);for(let i=0;i<3;i++)circle(x-10+i*10,y,5);line(x+15,y,right,y);}
  else if(['transformer','transformer-current','transformer-voltage','ferrite-core-transformer'].includes(t)){line(left,y,x-10,y);circle(x-3,y,10);circle(x+12,y,10);line(x+22,y,right,y);}
  else {line(left,y,x-13,y);rect(x-13,y-12,x+13,y+12);line(x+13,y,right,y);}
  text(x+44,y-5,9,p.ref,'DEVICE_TAGS');text(x+44,y+8,8,p.type+' '+p.value,'LABELS');
 }
 add(0,'ENDSEC',0,'EOF');return pairs.join('\r\n')+'\r\n';
}
const guid=(n)=>{let x=(n+1)*2654435761>>>0;let out='';for(let i=0;i<22;i++){x=(Math.imul(x^i,1664525)+1013904223)>>>0;out+='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'[x%64]}return out};
const ifcClassForType=type=>{const t=String(type||'').toLowerCase();if(t==='building-zone')return 'IFCSPACE';if(t.includes('transformer'))return 'IFCTRANSFORMER';if(t.includes('motor'))return 'IFCMOTOR';if(['distribution-board','switchboard','mcc','panel'].some(x=>t.includes(x)))return 'IFCDISTRIBUTIONBOARD';if(['circuit-breaker','fuse','isolator','switch-disconnector','protective-device','earth-leakage-breaker','residual-current-device'].some(x=>t.includes(x)))return 'IFCPROTECTIVEDEVICE';return 'IFCBUILDINGELEMENTPROXY'};
export function exportIfc4(documentData){
 const sheet=documentData.sheets.find(s=>s.id===documentData.activeSheetId)||documentData.sheets[0];
 const entities=[];const add=s=>{entities.push(s);return entities.length};
 const ref=n=>'#'+n;
 const point=(x,y,z)=>add('IFCCARTESIANPOINT(('+x+','+y+','+z+'))');
 const dir=(x,y,z)=>add('IFCDIRECTION(('+x+','+y+','+z+'))');
 const origin=point(0,0,0),zdir=dir(0,0,1),xdir=dir(1,0,0);
 const axis=add('IFCAXIS2PLACEMENT3D('+ref(origin)+','+ref(zdir)+','+ref(xdir)+')');
 const world=add('IFCLOCALPLACEMENT($,'+ref(axis)+')');
 const context=add("IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-5,"+ref(axis)+',$)');
 const subcontext=add("IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,"+ref(context)+",$,.MODEL_VIEW.,$)");
 const project=add("IFCPROJECT('"+guid(1)+"',$,'"+esc(documentData.projectName)+"',$,$,$,$,("+ref(context)+"),"+ref(add("IFCUNITASSIGNMENT((#"+add("IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)")+ ",#"+add("IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)")+",#"+add("IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)")+",#"+add("IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)")+"))"))+")");
 const site=add("IFCSITE('"+guid(2)+"',$,'Site',$,$,"+ref(world)+",$,$,.ELEMENT.,$,$,$,$,$)");
 const building=add("IFCBUILDING('"+guid(3)+"',$,'VoltPro Building',$,$,"+ref(world)+",$,$,.ELEMENT.,$,$,$)");
 const storey=add("IFCBUILDINGSTOREY('"+guid(4)+"',$,'Electrical design layer',$,$,"+ref(world)+",$,$,.ELEMENT.,0.)");
 add('IFCRELAGGREGATES(\''+guid(5)+'\',$,$,$,'+ref(project)+',('+ref(site)+'))');
 add('IFCRELAGGREGATES(\''+guid(6)+'\',$,$,$,'+ref(site)+',('+ref(building)+'))');
 add('IFCRELAGGREGATES(\''+guid(7)+'\',$,$,$,'+ref(building)+',('+ref(storey)+'))');
 sheet.parts.forEach((p,i)=>{
  const localPoint=point(p.x,p.y,0),localAxis=add('IFCAXIS2PLACEMENT3D('+ref(localPoint)+','+ref(zdir)+','+ref(xdir)+')'),placement=add('IFCLOCALPLACEMENT('+ref(world)+','+ref(localAxis)+')');
  const width=p.widthMM||(String(p.type).includes('motor')?800:500),depth=p.depthMM||(String(p.type).includes('motor')?800:400),height=p.heightMM||(String(p.type).includes('panel')?1800:40);
  const profilePoint=point(0,0,0),profileAxis=add('IFCAXIS2PLACEMENT2D('+ref(profilePoint)+',$)'),profile=add('IFCRECTANGLEPROFILEDEF(.AREA.,$,'+ref(profileAxis)+','+width+','+depth+')');
  const solidPoint=point(0,0,0),solidAxis=add('IFCAXIS2PLACEMENT3D('+ref(solidPoint)+','+ref(zdir)+','+ref(xdir)+')'),solid=add('IFCEXTRUDEDAREASOLID('+ref(profile)+','+ref(solidAxis)+','+ref(zdir)+','+height+')');
  const shapeRep=add('IFCSHAPEREPRESENTATION('+ref(subcontext)+',\'Body\',\'SweptSolid\',('+ref(solid)+'))'),shape=add('IFCPRODUCTDEFINITIONSHAPE($,$,('+ref(shapeRep)+'))');
  const ifcClass=ifcClassForType(p.type);const label=esc(p.ref+' '+p.type+' '+p.value);const element=ifcClass==='IFCSPACE'?add("IFCSPACE('"+guid(100+i)+"',$,'"+label+"',$,$,"+ref(placement)+','+ref(shape)+",$,.ELEMENT.,.INTERNAL.,$)"):add(ifcClass+"('"+guid(100+i)+"',$,'"+label+"',$,$,"+ref(placement)+','+ref(shape)+",$,.NOTDEFINED.)");
  if(ifcClass==='IFCSPACE')add("IFCRELAGGREGATES('"+guid(1000+i)+"',$,$,$,"+ref(storey)+",("+ref(element)+"))");else add("IFCRELCONTAINEDINSPATIALSTRUCTURE('"+guid(1000+i)+"',$,$,$,("+ref(element)+"),"+ref(storey)+")");
  const properties=[
   add("IFCPROPERTYSINGLEVALUE('VoltProTag',$,IFCIDENTIFIER('"+esc(p.ref)+"'),$)"),
   add("IFCPROPERTYSINGLEVALUE('ComponentType',$,IFCLABEL('"+esc(p.type)+"'),$)"),
   add("IFCPROPERTYSINGLEVALUE('Description',$,IFCTEXT('"+esc(p.value)+"'),$)"),
   add("IFCPROPERTYSINGLEVALUE('EnvelopeWidthMM',$,IFCLENGTHMEASURE("+width+"),$)"),
   add("IFCPROPERTYSINGLEVALUE('EnvelopeDepthMM',$,IFCLENGTHMEASURE("+depth+"),$)"),
   add("IFCPROPERTYSINGLEVALUE('EnvelopeHeightMM',$,IFCLENGTHMEASURE("+height+"),$)"),
   add("IFCPROPERTYSINGLEVALUE('CoordinateXMM',$,IFCLENGTHMEASURE("+p.x+"),$)"),
   add("IFCPROPERTYSINGLEVALUE('CoordinateYMM',$,IFCLENGTHMEASURE("+p.y+"),$)")
  ];
  const propertySet=add("IFCPROPERTYSET('"+guid(4000+i)+"',$,'Pset_VoltProConcept',$,("+properties.map(ref).join(',')+"))");
  add("IFCRELDEFINESBYPROPERTIES('"+guid(5000+i)+"',$,$,$,("+ref(element)+"),"+ref(propertySet)+")");
 });
 sheet.wires.forEach((w,i)=>{const a=point(w.x1,w.y1,0),b=point(w.x2,w.y2,0);const d=add('IFCPOLYLINE(('+ref(a)+','+ref(b)+'))');const curve=add("IFCSHAPEREPRESENTATION("+ref(context)+",'Axis','Curve3D',("+ref(d)+"))");const shape=add('IFCPRODUCTDEFINITIONSHAPE($,$,('+ref(curve)+'))');const element=add("IFCCABLESEGMENT('"+guid(2000+i)+"',$,'"+esc((w.ref||'Wire '+(i+1))+' electrical route')+"',$,'WIRE',"+ref(world)+','+ref(shape)+",'"+esc(w.ref||('W'+(i+1)))+"',.CABLESEGMENT.)");add("IFCRELCONTAINEDINSPATIALSTRUCTURE('"+guid(3000+i)+"',$,$,$,("+ref(element)+"),"+ref(storey)+")");const routeProps=[add("IFCPROPERTYSINGLEVALUE('VoltProTag',$,IFCIDENTIFIER('"+esc(w.ref||('W'+(i+1)))+"'),$)"),add("IFCPROPERTYSINGLEVALUE('RouteLabel',$,IFCTEXT('"+esc(w.label||'Electrical route')+"'),$)")];const routeSet=add("IFCPROPERTYSET('"+guid(6000+i)+"',$,'Pset_VoltProCableRoute',$,("+routeProps.map(ref).join(',')+"))");add("IFCRELDEFINESBYPROPERTIES('"+guid(7000+i)+"',$,$,$,("+ref(element)+"),"+ref(routeSet)+")");});
 return "ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('VoltPro generated IFC4 coordination model'),'2;1');\nFILE_NAME('voltpro.ifc','2026-10-20T00:00:00',('VoltPro'),('VoltPro'),'VoltPro ElexCAD','VoltPro','');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n"+entities.map((e,i)=>'#'+(i+1)+'='+e+';').join('\n')+"\nENDSEC;\nEND-ISO-10303-21;\n";
}

// Convert a concept engineering package to a coordinate-based IFC4 massing/MEP proxy model.
// Facility zones use the package's metre-based site coordinate system; IFC project units are millimetres.
export function exportEngineeringPackageIfc4(pkg){
 const zones=(pkg?.project?.facility?.buildingZones||[]).map((z,i)=>({id:'zone-'+i,type:'building-zone',ref:'BLDG-'+String(i+1).padStart(2,'0'),value:z.name,x:(Number(z.xM||0)+Number(z.widthM||1)/2)*1000,y:(Number(z.yM||0)+Number(z.depthM||1)/2)*1000,widthMM:Number(z.widthM||1)*1000,depthMM:Number(z.depthM||1)*1000,heightMM:Number(z.clearHeightM||3)*1000}));
 const equipment=(pkg?.equipmentCoordinates||[]).map((e,i)=>({id:'equipment-'+i,type:/transformer/i.test((e.tag||'')+' '+(e.name||''))?'transformer':/^(MSB|MCC|DB)/i.test(e.tag||'')||/switchboard|distribution board/i.test(e.name||'')?'distribution-board':/^RMU/i.test(e.tag||'')?'protective-device':'equipment-proxy',ref:e.tag||'EQ-'+(i+1),value:[e.name,e.rating,e.manufacturer,e.partNumber?'MPN '+e.partNumber:''].filter(Boolean).join(' | '),x:Number(e.xM||0)*1000,y:Number(e.yM||0)*1000,widthMM:equipmentProxyDimensions(e).widthM*1000,depthMM:equipmentProxyDimensions(e).depthM*1000,heightMM:equipmentProxyDimensions(e).heightM*1000}));
 const parts=[...zones,...equipment];
 const wires=(pkg?.cableRoutes||[]).map((w,i)=>({id:'route-'+i,ref:w.tag||'W'+(i+1),label:w.label||'',x1:Number(w.x1M||0)*1000,y1:Number(w.y1M||0)*1000,x2:Number(w.x2M||0)*1000,y2:Number(w.y2M||0)*1000}));
 const pseudo={schemaVersion:2,projectName:pkg?.project?.name||'VoltPro Engineering Concept',activeSheetId:'ifc-concept',sheets:[{id:'ifc-concept',name:'Concept BIM',parts,wires}]};
 return exportIfc4(pseudo);
}

const xmlEsc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&apos;');
export function renderEngineeringIsometricSvg(pkg){
 const zones=pkg?.project?.facility?.buildingZones||[];const equipment=pkg?.equipmentCoordinates||[];if(!zones.length&&!equipment.length)return null;
 const scale=3,proj=(x,y,z=0)=>({x:(x-y)*0.8660254*scale,y:(x+y)*0.5*scale-z*scale});
 const all=[];for(const z of zones){for(const [x,y,h] of [[z.xM,z.yM,0],[z.xM+z.widthM,z.yM,0],[z.xM,z.yM+z.depthM,0],[z.xM+z.widthM,z.yM+z.depthM,0],[z.xM,z.yM,z.clearHeightM||3],[z.xM+z.widthM,z.yM,z.clearHeightM||3],[z.xM,z.yM+z.depthM,z.clearHeightM||3],[z.xM+z.widthM,z.yM+z.depthM,z.clearHeightM||3]])all.push(proj(x,y,h));}for(const e of equipment){const dims=equipmentProxyDimensions(e),w=dims.widthM,d=dims.depthM,h=dims.heightM,x=Number(e.xM||0)-w/2,y=Number(e.yM||0)-d/2,z=Number(e.zM||0);for(const [px,py,pz] of [[x,y,z],[x+w,y,z],[x,y+d,z],[x+w,y+d,z],[x,y,z+h],[x+w,y,z+h],[x,y+d,z+h],[x+w,y+d,z+h]])all.push(proj(px,py,pz));}
 const minX=Math.min(...all.map(p=>p.x)),maxX=Math.max(...all.map(p=>p.x)),minY=Math.min(...all.map(p=>p.y)),maxY=Math.max(...all.map(p=>p.y)),pad=90,offsetX=pad-minX,offsetY=pad-minY,width=Math.ceil(maxX-minX+pad*2),height=Math.ceil(maxY-minY+pad*2);
 const pt=(x,y,z=0)=>{const p=proj(x,y,z);return (p.x+offsetX).toFixed(1)+','+(p.y+offsetY).toFixed(1)};
 const poly=(pts,fill,stroke='#47616d')=>'<polygon points="'+pts.join(' ')+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.2"/>';
 let shapes='';for(const z of zones){const x=z.xM,y=z.yM,w=z.widthM,d=z.depthM,h=z.clearHeightM||3;const a=pt(x,y),b=pt(x+w,y),c=pt(x+w,y+d),dd=pt(x,y+d),at=pt(x,y,h),bt=pt(x+w,y,h),ct=pt(x+w,y+d,h),dt=pt(x,y+d,h);shapes+=poly([a,b,bt,at],'#367e83aa');shapes+=poly([b,c,ct,bt],'#285b68cc');shapes+=poly([at,bt,ct,dt],'#4da5a0cc');const label=pt(x+w/2,y+d/2,h+1);shapes+='<text x="'+label.split(',')[0]+'" y="'+label.split(',')[1]+'" fill="#e5f8f6" font-size="11" text-anchor="middle">'+xmlEsc(z.name)+'</text>';}
 for(const e of equipment){const dims=equipmentProxyDimensions(e),w=dims.widthM,d=dims.depthM,h=dims.heightM,z=Number(e.zM||0),x=Number(e.xM||0)-w/2,y=Number(e.yM||0)-d/2;const a=pt(x,y,z),b=pt(x+w,y,z),c=pt(x+w,y+d,z),dd=pt(x,y+d,z),at=pt(x,y,z+h),bt=pt(x+w,y,z+h),ct=pt(x+w,y+d,z+h),dt=pt(x,y+d,z+h);shapes+=poly([a,b,bt,at],'#cf9b53');shapes+=poly([b,c,ct,bt],'#9e7138');shapes+=poly([at,bt,ct,dt],'#e3b66c');const label=pt(x+w/2,y+d/2,z+h+1);shapes+='<text x="'+label.split(',')[0]+'" y="'+label.split(',')[1]+'" fill="#f4e2c8" font-size="9" text-anchor="middle">'+xmlEsc(e.tag||e.name)+'</text>';}
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><rect width="100%" height="100%" fill="#0d171e"/><text x="24" y="30" fill="#7ce5d3" font-size="15">'+xmlEsc(pkg.project?.name||'VoltPro 3D concept massing')+'</text><text x="24" y="49" fill="#a7bac4" font-size="10">ISOMETRIC CONCEPT · NOT A COORDINATED BIM MODEL</text>'+shapes+'</svg>';
}

export function assessProtectionEnvelope(input={}){
 const {downstreamPickupA,upstreamPickupA,downstreamTMS=0.1,upstreamTMS=0.2,minimumFaultCurrentA,maximumFaultCurrentA,curve='standard-inverse',downstreamCurve=curve,upstreamCurve=curve,requiredMarginS=0.3,points=41,downstreamBreakerTimeS=0.05,upstreamBreakerTimeS=0.08,downstreamCurvePoints,upstreamCurvePoints}=input;
 const numeric={downstreamPickupA,upstreamPickupA,downstreamTMS,upstreamTMS,minimumFaultCurrentA,maximumFaultCurrentA,requiredMarginS,points,downstreamBreakerTimeS,upstreamBreakerTimeS};
 for(const [k,v] of Object.entries(numeric))if(!finite(v))throw new Error(k+' must be numeric');
 const hasManufacturerCurves=downstreamCurvePoints!==undefined||upstreamCurvePoints!==undefined;
 if(downstreamPickupA<=0||upstreamPickupA<=0||downstreamTMS<=0||upstreamTMS<=0||(!hasManufacturerCurves&&minimumFaultCurrentA<=Math.max(downstreamPickupA,upstreamPickupA))||maximumFaultCurrentA<minimumFaultCurrentA||maximumFaultCurrentA>1e9||requiredMarginS<0||requiredMarginS>60||!Number.isInteger(points)||points<2||points>501||downstreamBreakerTimeS<0||upstreamBreakerTimeS<0||downstreamBreakerTimeS>60||upstreamBreakerTimeS>60||!['standard-inverse','very-inverse','extremely-inverse','long-time-inverse'].includes(downstreamCurve)||!['standard-inverse','very-inverse','extremely-inverse','long-time-inverse'].includes(upstreamCurve))throw new Error('Invalid protection envelope: check fault range, supported upstream/downstream curves, integer sweep count (2–501), and non-negative settings');
 const customDown=downstreamCurvePoints!==undefined,customUp=upstreamCurvePoints!==undefined;if(customDown!==customUp)throw new Error('Provide both downstream and upstream manufacturer curve point arrays');const downPoints=customDown?validateManufacturerCurve(downstreamCurvePoints):null,upPoints=customUp?validateManufacturerCurve(upstreamCurvePoints):null;if(downPoints&&(minimumFaultCurrentA<downPoints[0].currentA||maximumFaultCurrentA>downPoints[downPoints.length-1].currentA||minimumFaultCurrentA<upPoints[0].currentA||maximumFaultCurrentA>upPoints[upPoints.length-1].currentA))throw new Error('Fault-current sweep must stay within both supplied manufacturer curve ranges');
 const rows=[];
 for(let i=0;i<Math.floor(points);i++){
  const current=minimumFaultCurrentA+(maximumFaultCurrentA-minimumFaultCurrentA)*i/(Math.floor(points)-1);
  const downRelay=downPoints?interpolateManufacturerCurve(downPoints,current):iecInverseTime(current,downstreamPickupA,downstreamTMS,downstreamCurve);
  const upRelay=upPoints?interpolateManufacturerCurve(upPoints,current):iecInverseTime(current,upstreamPickupA,upstreamTMS,upstreamCurve);
  const downTotal=downRelay+downstreamBreakerTimeS,upTotal=upRelay+upstreamBreakerTimeS;
  const margin=round(upTotal-downTotal,4);
  rows.push({faultCurrentA:round(current,2),downstreamRelayTimeS:downRelay,downstreamTotalClearingS:round(downTotal,4),upstreamRelayTimeS:upRelay,upstreamTotalClearingS:round(upTotal,4),selectivityMarginS:margin,passes:margin>=requiredMarginS});
 }
 const failures=rows.filter(r=>!r.passes);
 return {status:failures.length?'FAIL / REVIEW — AT LEAST ONE SWEEP POINT MISSES THE REQUIRED MARGIN':customDown?'SCREENING PASS — USER-SUPPLIED TCC POINTS ONLY':'SCREENING PASS — ENTERED IDEALIZED CURVES ONLY',curve:customDown?'manufacturer-tcc-log-log':downstreamCurve===upstreamCurve?downstreamCurve:'mixed',curves:{downstream:customDown?'manufacturer-tcc-log-log':downstreamCurve,upstream:customUp?'manufacturer-tcc-log-log':upstreamCurve},settings:{...input,points:rows.length},summary:{evaluatedPoints:rows.length,passingPoints:rows.length-failures.length,failingPoints:failures.length,minimumMarginS:Math.min(...rows.map(r=>r.selectivityMarginS)),minimumMarginCurrentA:rows.reduce((a,b)=>a.selectivityMarginS<b.selectivityMarginS?a:b).faultCurrentA},rows,assumptions:[customDown?'User-supplied manufacturer time-current points were interpolated in log-log space only within the supplied range; verify source, relay tolerances and curve interpretation.':'Sweep covers only the specified fault-current interval and idealized IEC curve equations.','Breaker clearing times are fixed user inputs; real breaker curves vary with current and tolerance.','No manufacturer data, CT/VT errors, relay tolerances, damage curves, inrush, motor start, earth-fault modes, or network short-circuit calculation is included.','A screening pass is not validated protection coordination and must not be used to set or approve live protection.'],forConstruction:false};
}

export function exportEngineeringPackageGltf(pkg){
 const zones=pkg?.project?.facility?.buildingZones||[];
 const equipment=pkg?.equipmentCoordinates||[];
 if(!zones.length&&!equipment.length&&!(pkg?.cableRoutes||[]).length)throw new Error('Engineering package has no building zones, equipment coordinates or cable routes');
 const objects=[
  ...zones.map((z,i)=>({name:z.name||'Building zone '+(i+1),kind:'BuildingZone',x:Number(z.xM||0)+Number(z.widthM||1)/2,y:Number(z.yM||0)+Number(z.depthM||1)/2,z:0,w:Number(z.widthM||1),d:Number(z.depthM||1),h:Number(z.clearHeightM||3),material:0})),
  ...equipment.map((e,i)=>{const dims=equipmentProxyDimensions(e);return{name:(e.tag||'EQ-'+(i+1))+' '+(e.name||'Equipment'),kind:'ElectricalEquipmentProxy',x:Number(e.xM||0),y:Number(e.yM||0),z:Number(e.zM||0),w:dims.widthM,d:dims.depthM,h:dims.heightM,material:1,tag:e.tag||''}}),
  ...(pkg?.cableRoutes||[]).flatMap((w,i)=>{const x1=Number(w.x1M||0),y1=Number(w.y1M||0),x2=Number(w.x2M||0),y2=Number(w.y2M||0),h=.08;const out=[{name:(w.tag||'Wire '+(i+1))+' horizontal route',kind:'CableRouteProxy',x:(x1+x2)/2,y:y1,z:h,w:Math.max(Math.abs(x2-x1),.04),d:.04,h:.04,material:2,tag:w.tag||''}];if(Math.abs(y2-y1)>.01)out.push({name:(w.tag||'Wire '+(i+1))+' vertical route',kind:'CableRouteProxy',x:x2,y:(y1+y2)/2,z:h,w:.04,d:Math.abs(y2-y1),h:.04,material:2,tag:w.tag||''});return out})
 ];
 if(objects.some(o=>![o.x,o.y,o.z,o.w,o.d,o.h].every(Number.isFinite)||o.w<=0||o.d<=0||o.h<=0))throw new Error('Invalid dimensions or coordinates in engineering package');
 const faces=[
  {n:[0,0,1],v:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},
  {n:[0,0,-1],v:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},
  {n:[1,0,0],v:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},
  {n:[-1,0,0],v:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]},
  {n:[0,1,0],v:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},
  {n:[0,-1,0],v:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]}
 ];
 const pos=[],norm=[],idx=[];
 for(const f of faces){const base=pos.length/3;for(const v of f.v){pos.push(v[0],v[1],v[2]);norm.push(...f.n)}idx.push(base,base+1,base+2,base,base+2,base+3);}
 const align4=n=>(n+3)&~3;
 const posBytes=new Uint8Array(new Float32Array(pos).buffer),normBytes=new Uint8Array(new Float32Array(norm).buffer),idxBytes=new Uint8Array(new Uint16Array(idx).buffer);
 const posOffset=0,normOffset=align4(posBytes.length),idxOffset=align4(normOffset+normBytes.length),total=idxOffset+idxBytes.length;
 const binary=new Uint8Array(total);binary.set(posBytes,posOffset);binary.set(normBytes,normOffset);binary.set(idxBytes,idxOffset);
 let binaryString='';for(let i=0;i<binary.length;i+=0x8000)binaryString+=String.fromCharCode(...binary.subarray(i,Math.min(i+0x8000,binary.length)));
 const b64=typeof btoa==='function'?btoa(binaryString):Buffer.from(binary).toString('base64');
 const min=[-0.5,-0.5,-0.5],max=[0.5,0.5,0.5];
 return JSON.stringify({asset:{version:'2.0',generator:'VoltPro ElexCAD concept BIM exporter',extras:{disclaimer:'Concept massing only; not a coordinated or certified BIM model.'}},scene:0,scenes:[{name:pkg?.project?.name||'VoltPro concept facility',nodes:objects.map((_,i)=>i)}],nodes:objects.map((o,i)=>({name:o.name,mesh:o.material,translation:[o.x,o.z+o.h/2,o.y],scale:[o.w,o.h,o.d],extras:{kind:o.kind,tag:o.tag||'',dimensionsM:{width:o.w,depth:o.d,height:o.h},zoneCoordinatesM:{x:o.x,y:o.y,z:o.z},rating:equipment.find(e=>e.tag&&e.tag===o.tag)?.rating||'',manufacturer:equipment.find(e=>e.tag&&e.tag===o.tag)?.manufacturer||'',partNumber:equipment.find(e=>e.tag&&e.tag===o.tag)?.partNumber||'',electricalValue:equipment.find(e=>e.tag&&e.tag===o.tag)?.electricalValue??null,tolerance:equipment.find(e=>e.tag&&e.tag===o.tag)?.tolerance??null}})),meshes:[{name:'Building-zone cuboid',primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:0}]},{name:'Electrical-equipment cuboid',primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:1}]},{name:'Cable route segment',primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:2}]}],materials:[{name:'Concept geometry',pbrMetallicRoughness:{baseColorFactor:[0.20,0.58,0.57,1],metallicFactor:0.05,roughnessFactor:0.8},doubleSided:true},{name:'Electrical equipment proxy',pbrMetallicRoughness:{baseColorFactor:[0.83,0.57,0.27,1],metallicFactor:0.1,roughnessFactor:0.65},doubleSided:true},{name:'Schematic wire route',pbrMetallicRoughness:{baseColorFactor:[0.35,0.85,0.78,1],metallicFactor:0.05,roughnessFactor:0.5},doubleSided:true}],buffers:[{byteLength:binary.length,uri:'data:application/octet-stream;base64,'+b64}],bufferViews:[{buffer:0,byteOffset:posOffset,byteLength:posBytes.length,target:34962},{buffer:0,byteOffset:normOffset,byteLength:normBytes.length,target:34962},{buffer:0,byteOffset:idxOffset,byteLength:idxBytes.length,target:34963}],accessors:[{bufferView:0,componentType:5126,count:24,type:'VEC3',min,max},{bufferView:1,componentType:5126,count:24,type:'VEC3'},{bufferView:2,componentType:5123,count:36,type:'SCALAR'}],extras:{coordinateSystem:'X=site east, Y=height, Z=site north; units metres',objectCount:objects.length,source:'engineering package concept coordinates',limitations:['No cable tray routing or connected network geometry','No manufacturer dimensions unless explicitly supplied','No structural/architectural details or clash detection','Generic proxy geometry; professional BIM coordination required']}},null,2);
}

export function analyzeEngineeringPackageClashes(pkg){
 const zones=pkg?.project?.facility?.buildingZones||[];
 const equipment=pkg?.equipmentCoordinates||[];
 const overlaps=[];
 const box=(x,y,w,d)=>({left:x-w/2,right:x+w/2,bottom:y-d/2,top:y+d/2});
 const intersect=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1e-6&&Math.min(a.top,b.top)-Math.max(a.bottom,b.bottom)>1e-6;
 for(let i=0;i<zones.length;i++)for(let j=i+1;j<zones.length;j++){
  const a=zones[i],b=zones[j],ba={left:Number(a.xM||0),right:Number(a.xM||0)+Number(a.widthM||1),bottom:Number(a.yM||0),top:Number(a.yM||0)+Number(a.depthM||1)},bb={left:Number(b.xM||0),right:Number(b.xM||0)+Number(b.widthM||1),bottom:Number(b.yM||0),top:Number(b.yM||0)+Number(b.depthM||1)};
  if(intersect(ba,bb)){const ox=round(Math.min(ba.right,bb.right)-Math.max(ba.left,bb.left),3),oy=round(Math.min(ba.top,bb.top)-Math.max(ba.bottom,bb.bottom),3),oz=round(Math.min(Number(a.clearHeightM||3),Number(b.clearHeightM||3)),3);overlaps.push({kind:'BUILDING_ZONE_3D_OVERLAP',severity:'error',first:a.name||'Zone '+(i+1),second:b.name||'Zone '+(j+1),overlapX_M:ox,overlapY_M:oy,overlapZ_M:oz});}
 }
 for(let i=0;i<equipment.length;i++)for(let j=i+1;j<equipment.length;j++){
  const a=equipment[i],b=equipment[j],da=equipmentProxyDimensions(a),db=equipmentProxyDimensions(b),ba=box(Number(a.xM||0),Number(a.yM||0),da.widthM,da.depthM),bb=box(Number(b.xM||0),Number(b.yM||0),db.widthM,db.depthM);
  if(intersect(ba,bb)){const ox=round(Math.min(ba.right,bb.right)-Math.max(ba.left,bb.left),3),oy=round(Math.min(ba.top,bb.top)-Math.max(ba.bottom,bb.bottom),3),za=Number(a.zM||0),zb=Number(b.zM||0),ha=da.heightM,hb=db.heightM,oz=round(Math.min(za+ha,zb+hb)-Math.max(za,zb),3);overlaps.push({kind:oz>0?'EQUIPMENT_3D_OVERLAP':'EQUIPMENT_PLAN_OVERLAP_ONLY',severity:oz>0?'warning':'info',first:a.tag||a.name||'Equipment '+(i+1),second:b.tag||b.name||'Equipment '+(j+1),overlapX_M:ox,overlapY_M:oy,overlapZ_M:Math.max(0,oz)});}
 }
 for(let i=0;i<equipment.length;i++){
  const e=equipment[i],dims=equipmentProxyDimensions(e),b=box(Number(e.xM||0),Number(e.yM||0),dims.widthM,dims.depthM),base=Number(e.zM||0),height=dims.heightM;
  const containing=zones.filter(z=>b.left>=Number(z.xM||0)-1e-6&&b.right<=Number(z.xM||0)+Number(z.widthM||1)+1e-6&&b.bottom>=Number(z.yM||0)-1e-6&&b.top<=Number(z.yM||0)+Number(z.depthM||1)+1e-6);
  if(containing.length){const limit=Math.min(...containing.map(z=>Number(z.clearHeightM||3)));if(base+height>limit+1e-6)overlaps.push({kind:'EQUIPMENT_EXCEEDS_ZONE_CLEAR_HEIGHT',severity:'error',first:e.tag||e.name||'Equipment '+(i+1),second:containing.map(z=>z.name||'Building zone').join('; '),overlapX_M:round(dims.widthM,3),overlapY_M:round(dims.depthM,3),overlapZ_M:round(base+height-limit,3)});}
 }
 const errors=overlaps.filter(x=>x.severity==='error').length,warnings=overlaps.filter(x=>x.severity==='warning').length,info=overlaps.filter(x=>x.severity==='info').length;
 return {status:errors?'FAILED — 3D SPATIAL OR CLEAR-HEIGHT CONFLICTS FOUND':warnings?'REVIEW — 3D EQUIPMENT COLLISIONS FOUND':info?'INFO — PLAN OVERLAPS HAVE NO VERTICAL INTERSECTION':'PASS — NO 3D OVERLAPS DETECTED',checks:{buildingZones:zones.length,equipment:equipment.length,zonePairs:zones.length*(zones.length-1)/2,equipmentPairs:equipment.length*(equipment.length-1)/2,heightChecks:equipment.length,errors,warnings,info},overlapCount:overlaps.length,overlaps,assumptions:['3D checks use axis-aligned cuboids and assume all building zones start at elevation 0 m. They are not a substitute for a coordinated architectural/structural/MEP model.','Equipment dimensions use widthM/depthM/heightM when supplied and otherwise use generic 1.2 m × 1.0 m × 1.8 m proxies. Confirm manufacturer geometry and service/access clearances.','Cable trays, conduits, fire separation, structural clashes, access envelopes and maintainability clearances are not assessed.','Coordinates are metre-based; equipment xM/yM are footprint centres and zM is the equipment base elevation.'],forConstruction:false};
}
