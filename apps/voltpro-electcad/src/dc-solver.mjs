const EPS = 1e-10;
const pointKey = p => `${Math.round(p.x*10000)/10000},${Math.round(p.y*10000)/10000}`;
const pinPositions = part => {
  const type=part.type;
  if(['text-note','wire-crossing','cable','shield','ferrule','no-connect'].includes(type))return [];
  let offsets;
  if(String(type).includes('ground'))offsets=[{x:0,y:-10}];
  else if(['terminal','terminal-block','connector','test-point','net-port','off-page-connector','junction','bus-tap','net-label','wire-label'].includes(type))offsets=[{x:0,y:0}];
  else if(['npn-transistor','pnp-transistor','nmos','pmos','igbt','scr','triac','n-channel-jfet','p-channel-jfet','darlington-transistor'].includes(type))offsets=[{x:-38,y:0},{x:38,y:-22},{x:38,y:22}];
  else if(['op-amp','comparator','logic-gate-and','logic-gate-or','logic-gate-not','logic-gate-xor'].includes(type))offsets=[{x:-38,y:-12},{x:-38,y:12},{x:38,y:0}];
  else offsets=[{x:-38,y:0},{x:38,y:0}];
  const r=(part.rotation||0)*Math.PI/180;
  return offsets.map(p=>{const mx=part.mirrorX?-p.x:p.x;return {x:part.x+Math.round(Math.cos(r)*mx-Math.sin(r)*p.y),y:part.y+Math.round(Math.sin(r)*mx+Math.cos(r)*p.y)}});
};
const parseSI = value => {
  const s=String(value||'').replace(/,/g,'.').replace(/Ω/g,'ohm').trim();
  const m=s.match(/[-+]?(?:\d+\.?\d*|\.\d+)\s*(meg|[kmunp]?)(?:ohm|f|h|v|a|ω)?/i);
  if(!m) return NaN;
  const n=parseFloat(m[0]); const suffix=(m[1]||'').toLowerCase();
  const factor={meg:1e6,k:1e3,m:1e-3,u:1e-6,n:1e-9,p:1e-12,'':1}[suffix]??1;
  return n*factor;
};
function solveLinear(A,b) {
  const n=b.length, M=A.map((row,i)=>[...row,b[i]]);
  for(let col=0;col<n;col++){
    let pivot=col; for(let row=col+1;row<n;row++)if(Math.abs(M[row][col])>Math.abs(M[pivot][col]))pivot=row;
    if(Math.abs(M[pivot][col])<EPS)throw new Error('Circuit matrix is singular. Check for floating nodes, missing ground, or ideal-source loops.');
    [M[col],M[pivot]]=[M[pivot],M[col]];
    const d=M[col][col]; for(let j=col;j<=n;j++)M[col][j]/=d;
    for(let row=0;row<n;row++){if(row===col)continue;const k=M[row][col];if(Math.abs(k)<EPS)continue;for(let j=col;j<=n;j++)M[row][j]-=k*M[col][j];}
  }
  return M.map(row=>row[n]);
}
export function runDcOperatingPoint(sheet) {
  const parts=sheet.parts||[], wires=sheet.wires||[];
  if(parts.length>5000||wires.length>10000)throw new Error('DC analysis limit exceeded (5000 components, 10000 wire segments).');
  const parent=new Map();
  const find=k=>{if(!parent.has(k))parent.set(k,k);let p=parent.get(k);if(p!==k){p=find(p);parent.set(k,p);}return p;};
  const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent.set(a,b);};
  const wireSegments=[];
  const wirePoints=[];
  for(const w of wires){const a={x:w.x1,y:w.y1},bend={x:w.x2,y:w.y1},b={x:w.x2,y:w.y2};wirePoints.push(a,bend,b);wireSegments.push([a,bend],[bend,b]);join(pointKey(a),pointKey(bend));join(pointKey(bend),pointKey(b));}
  const pins=parts.map(part=>({part,points:pinPositions(part)}));
  for(const {part,points} of pins)points.forEach((p,i)=>find('pin:'+part.id+':'+i));
  const allPoints=[...wirePoints,...pins.flatMap(({part,points})=>points.map((p,i)=>({...p,id:'pin:'+part.id+':'+i})))];
  const onSegment=(p,a,b)=>Math.abs((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))<1e-5&&p.x>=Math.min(a.x,b.x)-1e-5&&p.x<=Math.max(a.x,b.x)+1e-5&&p.y>=Math.min(a.y,b.y)-1e-5&&p.y<=Math.max(a.y,b.y)+1e-5;
  for(const [a,b] of wireSegments){for(const p of allPoints)if(onSegment(p,a,b))join(pointKey(a),p.id||pointKey(p));}
  for(const {part,points} of pins)points.forEach((p,i)=>join('pin:'+part.id+':'+i,pointKey(p)));
  const grounds=parts.filter(p=>String(p.type).includes('ground'));
  if(!grounds.length)throw new Error('DC operating point requires an explicit ground/reference symbol.');
  const groundPinKey='pin:'+grounds[0].id+':0';
  const electrical=[];
  const warnings=[];
  for(const p of parts){
    const model=p.simulationModel||({power:'voltage',battery:'voltage','voltage-source-ac':'unsupported','current-source':'unsupported',resistor:'resistor','variable-resistor':'resistor',potentiometer:'resistor','potentiometer-trimmer':'resistor',thermistor:'resistor',capacitor:'unsupported','polarized-capacitor':'unsupported',inductor:'unsupported',diode:'unsupported','zener-diode':'unsupported',led:'unsupported','npn-transistor':'unsupported','pnp-transistor':'unsupported',switch:'switch','push-button-no':'switch','push-button-nc':'switch','relay-contact-no':'switch','relay-contact-nc':'switch','circuit-breaker':'switch',fuse:'switch'})[p.type]||'unsupported';
    if(model==='ground')continue;
    if(model==='voltage'||p.type==='power'||p.type==='battery'){
      const pins2=pinPositions(p);if(pins2.length<2)continue;
      const volts=parseFloat(String(p.value).replace(',','.'));
      if(!Number.isFinite(volts)){warnings.push(`${p.ref}: source voltage not recognized; using 24 V DC`);}
      electrical.push({kind:'voltage',p,a:find('pin:'+p.id+':0'),b:find('pin:'+p.id+':1'),value:Number.isFinite(volts)?volts:24});
    } else if(model==='resistor'){
      const val=parseSI(p.value);
      if(!Number.isFinite(val)||val<=0)throw new Error(`${p.ref}: resistance must be a positive SI value such as 1 kΩ or 470 ohm.`);
      electrical.push({kind:'resistor',p,a:find('pin:'+p.id+':0'),b:find('pin:'+p.id+':1'),value:val});
    } else if(model==='switch'){
      const closed=/closed|on|1\b/i.test(String(p.value))||['push-button-nc','relay-contact-nc'].includes(p.type);
      if(closed){electrical.push({kind:'wire',p,a:find('pin:'+p.id+':0'),b:find('pin:'+p.id+':1')});}
      else warnings.push(`${p.ref}: open switch/contact excluded from DC conduction`);
    } else if(!['terminal','terminal-block','connector','test-point','no-connect','net-port','off-page-connector','junction','wire-crossing','wire-label','net-label','text-note','cable','shield','ferrule','busbar'].includes(p.type))warnings.push(`${p.ref}: ${p.type} has no validated DC model and is excluded`);
  }
  for(const e of electrical)if(e.kind==='wire')join(e.a,e.b);
  const namedNets=new Map();for(const part of parts.filter(p=>p.type==='net-label'||p.type==='wire-label')){const label=String(part.value||'').trim().toLocaleLowerCase();if(!label)continue;const pin='pin:'+part.id+':0';if(namedNets.has(label))join(pin,namedNets.get(label));else namedNets.set(label,pin);}
  const groundNode=find(groundPinKey);
  const allRoots=new Set();for(const key of parent.keys())allRoots.add(find(key));
  const nodes=[...allRoots].filter(root=>root!==groundNode).sort();
  const index=new Map(nodes.map((node,i)=>[node,i]));
  const sources=electrical.filter(e=>e.kind==='voltage');
  const n=nodes.length, size=n+sources.length;
  if(size===0)throw new Error('No supported electrical circuit found to analyze.');
  const A=Array.from({length:size},()=>Array(size).fill(0)), z=Array(size).fill(0);
  const addConductance=(a,b,g)=>{const i=index.get(a),j=index.get(b);if(i!==undefined)A[i][i]+=g;if(j!==undefined)A[j][j]+=g;if(i!==undefined&&j!==undefined){A[i][j]-=g;A[j][i]-=g;}};
  for(const e of electrical){if(e.kind==='resistor')addConductance(e.a,e.b,1/e.value);}
  sources.forEach((e,k)=>{const row=n+k,ia=index.get(e.a),ib=index.get(e.b);if(ia!==undefined){A[ia][row]+=1;A[row][ia]+=1;}if(ib!==undefined){A[ib][row]-=1;A[row][ib]-=1;}z[row]=e.value;});
  const x=solveLinear(A,z);
  const voltage=node=>node===groundNode?0:(x[index.get(node)]??0);
  const componentResults=electrical.filter(e=>e.kind!=='wire').map(e=>{
    const va=voltage(e.a),vb=voltage(e.b),current=e.kind==='resistor'?(va-vb)/e.value:x[n+sources.indexOf(e)];
    return {ref:e.p.ref,type:e.p.type,voltageDrop:va-vb,current,power:(va-vb)*current,unit:'V/A/W'};
  });
  const nodeResults=nodes.map(node=>({node,voltage:x[index.get(node)]||0}));
  return {analysis:'DC operating point',ground:grounds[0].ref,nodeCount:n,componentResults,nodeResults,warnings,metadata:{solver:'VoltPro DC nodal/MNA solver',method:'modified nodal analysis',limitations:'Only ideal DC voltage sources, resistors, explicitly closed/open simple contacts, and ground are modeled. No SPICE models, semiconductor nonlinearities, AC, transient, thermal, or safety analysis.'}};
}
