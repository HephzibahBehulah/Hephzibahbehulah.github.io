(()=>{'use strict';
/*
 HB Engineering Library — local-first calculator engine.
 Independent implementations of common engineering relationships.
 No runtime dependency on external calculator sites.
*/
const T=[
['Ohm\'s Law','Electrical','V = I × R',['V|Voltage (V)','I|Current (A)','R|Resistance (Ω)'],v=>pick(v,['V','I','R'],[['I','R',v=>v.I*v.R],['V','R',v=>v.V/v.R],['V','I',v=>v.V/v.I]],'Use any two values.')],
['Electrical Power','Electrical','P = V × I',['V|Voltage (V)','I|Current (A)'],v=>need(v,['V','I'])?fmt('P',v.V*v.I,'W'):'Enter voltage and current.'],
['Three-Phase Power','Electrical','P = √3 × V × I × PF',['V|Line voltage (V)','I|Line current (A)','PF|Power factor'],v=>need(v,['V','I','PF'])?fmt('P',Math.sqrt(3)*v.V*v.I*v.PF,'W'):'Enter all values.'],
['Single-Phase Power','Electrical','P = V × I × PF',['V|Voltage (V)','I|Current (A)','PF|Power factor'],v=>need(v,['V','I','PF'])?fmt('P',v.V*v.I*v.PF,'W'):'Enter all values.'],
['kW ↔ kVA','Electrical','kVA = kW / PF',['kW|Real power (kW)','PF|Power factor'],v=>need(v,['kW','PF'])&&v.PF>0?fmt('kVA',v.kW/v.PF,'kVA'):'Enter kW and PF.'],
['kVA ↔ Amps','Electrical','I = kVA × 1000 / V',['kVA|Apparent power (kVA)','V|Voltage (V)'],v=>need(v,['kVA','V'])&&v.V>0?fmt('I',v.kVA*1000/v.V,'A'):'Enter kVA and voltage.'],
['Power Factor','Electrical','PF = P / S',['P|Real power (W)','S|Apparent power (VA)'],v=>need(v,['P','S'])&&v.S>0?fmt('PF',v.P/v.S,''):'Enter P and S.'],
['Voltage Drop','Electrical','Vdrop = I × R',['I|Current (A)','R|Resistance (Ω)'],v=>need(v,['I','R'])?fmt('Vdrop',v.I*v.R,'V'):'Enter current and resistance.'],
['Voltage Drop %','Electrical','% = Vdrop / Vsystem × 100',['Vdrop|Voltage drop (V)','V|System voltage (V)'],v=>need(v,['Vdrop','V'])&&v.V>0?fmt('Drop',v.Vdrop/v.V*100,'%'):'Enter drop and system voltage.'],
['Voltage Divider','Electrical','Vout = Vin × R2/(R1+R2)',['Vin|Input voltage (V)','R1|R1 (Ω)','R2|R2 (Ω)'],v=>need(v,['Vin','R1','R2'])&&v.R1+v.R2!==0?fmt('Vout',v.Vin*v.R2/(v.R1+v.R2),'V'):'Enter Vin, R1 and R2.'],
['Series Resistance','Electrical','Req = R1 + R2 + …',['R1|R1 (Ω)','R2|R2 (Ω)','R3|R3 (Ω)'],v=>sum(v,['R1','R2','R3'])!==null?fmt('Req',sum(v,['R1','R2','R3']),'Ω'):'Enter at least two resistors.'],
['Parallel Resistance','Electrical','1/Req = 1/R1 + 1/R2 + …',['R1|R1 (Ω)','R2|R2 (Ω)','R3|R3 (Ω)'],v=>{const a=['R1','R2','R3'].map(k=>v[k]).filter(x=>x!=null&&x>0);return a.length>=2?fmt('Req',1/a.reduce((s,x)=>s+1/x,0),'Ω'):'Enter at least two positive resistors.'}],
['Energy Consumption','Electrical','E = P × t',['P|Power (kW)','t|Time (h)'],v=>need(v,['P','t'])?fmt('Energy',v.P*v.t,'kWh'):'Enter power and time.'],
['Energy Cost','Electrical','Cost = Energy × tariff',['E|Energy (kWh)','rate|Tariff (€/kWh)'],v=>need(v,['E','rate'])?fmt('Cost',v.E*v.rate,'€'):'Enter energy and tariff.'],
['Battery Runtime','Electrical','t ≈ Capacity / Load',['C|Capacity (Ah)','I|Load (A)'],v=>need(v,['C','I'])&&v.I>0?fmt('Runtime',v.C/v.I,'h'):'Enter capacity and positive load.'],
['Battery Energy','Electrical','Wh = V × Ah',['V|Battery voltage (V)','Ah|Capacity (Ah)'],v=>need(v,['V','Ah'])?fmt('Energy',v.V*v.Ah,'Wh'):'Enter voltage and capacity.'],
['Motor Torque','Electrical','τ = P / ω',['P|Mechanical power (W)','rpm|Speed (RPM)'],v=>need(v,['P','rpm'])&&v.rpm>0?fmt('Torque',v.P/(2*Math.PI*v.rpm/60),'N·m'):'Enter power and positive RPM.'],
['Motor Current','Electrical','I ≈ P/(V × PF × η)',['P|Power (W)','V|Voltage (V)','PF|Power factor','eta|Efficiency'],v=>need(v,['P','V','PF','eta'])&&v.V>0&&v.PF>0&&v.eta>0?fmt('Current',v.P/(v.V*v.PF*v.eta),'A'):'Enter valid motor values.'],
['Transformer Sizing','Electrical','S ≈ P / PF',['P|Load power (kW)','PF|Power factor'],v=>need(v,['P','PF'])&&v.PF>0?fmt('Transformer',v.P/v.PF,'kVA'):'Enter load and PF.'],
['Generator Sizing','Electrical','S = P / PF × margin',['P|Load power (kW)','PF|Power factor','margin|Margin factor'],v=>need(v,['P','PF','margin'])&&v.PF>0?fmt('Generator',v.P/v.PF*v.margin,'kVA'):'Enter load, PF and margin.'],
['Cable Power Loss','Electrical','Ploss = I²R',['I|Current (A)','R|Resistance (Ω)'],v=>need(v,['I','R'])?fmt('Loss',v.I*v.I*v.R,'W'):'Enter current and resistance.'],
['RC Time Constant','Electrical','τ = R × C',['R|Resistance (Ω)','C|Capacitance (F)'],v=>need(v,['R','C'])?fmt('τ',v.R*v.C,'s'):'Enter R and C.'],
['Capacitor Energy','Electrical','E = ½CV²',['C|Capacitance (F)','V|Voltage (V)'],v=>need(v,['C','V'])?fmt('Energy',.5*v.C*v.V*v.V,'J'):'Enter capacitance and voltage.'],
['Inductor Energy','Electrical','E = ½LI²',['L|Inductance (H)','I|Current (A)'],v=>need(v,['L','I'])?fmt('Energy',.5*v.L*v.I*v.I,'J'):'Enter inductance and current.'],
['Resistor Power','Electrical','P = I²R',['I|Current (A)','R|Resistance (Ω)'],v=>need(v,['I','R'])?fmt('Power',v.I*v.I*v.R,'W'):'Enter current and resistance.'],
['Air Changes per Hour','HVAC','ACH = Q × 60 / V',['Q|Airflow (m³/min)','V|Room volume (m³)'],v=>need(v,['Q','V'])&&v.V>0?fmt('ACH',v.Q*60/v.V,'1/h'):'Enter airflow and volume.'],
['Airflow from ACH','HVAC','Q = ACH × V / 60',['ACH|Air changes per hour','V|Room volume (m³)'],v=>need(v,['ACH','V'])?fmt('Airflow',v.ACH*v.V/60,'m³/min'):'Enter ACH and volume.'],
['Duct Velocity','HVAC','v = Q / A',['Q|Airflow (m³/s)','A|Duct area (m²)'],v=>need(v,['Q','A'])&&v.A>0?fmt('Velocity',v.Q/v.A,'m/s'):'Enter airflow and area.'],
['Duct Area','HVAC','A = Q / v',['Q|Airflow (m³/s)','v|Velocity (m/s)'],v=>need(v,['Q','v'])&&v.v>0?fmt('Area',v.Q/v.v,'m²'):'Enter airflow and velocity.'],
['Round Duct Diameter','HVAC','D = √(4A/π)',['A|Duct area (m²)'],v=>need(v,['A'])&&v.A>0?fmt('Diameter',Math.sqrt(4*v.A/Math.PI),'m'):'Enter positive area.'],
['Heat Transfer','HVAC','Q = ṁ × cp × ΔT',['m|Mass flow (kg/s)','cp|Specific heat (J/kg·K)','dT|Temperature difference (K)'],v=>need(v,['m','cp','dT'])?fmt('Heat',v.m*v.cp*v.dT,'W'):'Enter all values.'],
['Sensible Heat','HVAC','Q = ρ × cp × Qv × ΔT',['rho|Air density (kg/m³)','cp|Specific heat (J/kg·K)','Qv|Airflow (m³/s)','dT|ΔT (K)'],v=>need(v,['rho','cp','Qv','dT'])?fmt('Sensible heat',v.rho*v.cp*v.Qv*v.dT,'W'):'Enter all values.'],
['Cooling Load','HVAC','Q = ṁ × cp × ΔT',['m|Mass flow (kg/s)','cp|Specific heat (J/kg·K)','dT|Temperature difference (K)'],v=>need(v,['m','cp','dT'])?fmt('Cooling load',v.m*v.cp*v.dT,'W'):'Enter all values.'],
['Fan Power','HVAC','P = Q × ΔP / η',['Q|Airflow (m³/s)','dP|Pressure rise (Pa)','eta|Efficiency'],v=>need(v,['Q','dP','eta'])&&v.eta>0?fmt('Fan power',v.Q*v.dP/v.eta,'W'):'Enter airflow, pressure and efficiency.'],
['Fan Efficiency','HVAC','η = Q × ΔP / P',['Q|Airflow (m³/s)','dP|Pressure rise (Pa)','P|Input power (W)'],v=>need(v,['Q','dP','P'])&&v.P>0?fmt('Efficiency',v.Q*v.dP/v.P*100,'%'):'Enter valid values.'],
['COP','HVAC','COP = Cooling / Input power',['cool|Cooling output (kW)','power|Input power (kW)'],v=>need(v,['cool','power'])&&v.power>0?fmt('COP',v.cool/v.power,''):'Enter cooling and input power.'],
['EER','HVAC','EER = Cooling capacity (Btu/h) / W',['btu|Cooling capacity (Btu/h)','W|Input power (W)'],v=>need(v,['btu','W'])&&v.W>0?fmt('EER',v.btu/v.W,'Btu/Wh'):'Enter capacity and power.'],
['Duct Pressure Velocity','HVAC','Pv = ½ρv²',['rho|Air density (kg/m³)','v|Velocity (m/s)'],v=>need(v,['rho','v'])?fmt('Velocity pressure',.5*v.rho*v.v*v.v,'Pa'):'Enter density and velocity.'],
['Relative Humidity from Vapor Pressure','HVAC','RH = Pv/Psat × 100',['Pv|Vapor pressure','Psat|Saturation vapor pressure'],v=>need(v,['Pv','Psat'])&&v.Psat>0?fmt('RH',v.Pv/v.Psat*100,'%'):'Enter vapor pressures.'],
['Psychrometric Moisture Ratio','HVAC','W ≈ 0.622 Pv/(P−Pv)',['Pv|Vapor pressure (kPa)','P|Atmospheric pressure (kPa)'],v=>need(v,['Pv','P'])&&v.P>v.Pv?fmt('Humidity ratio',.622*v.Pv/(v.P-v.Pv),'kg/kg'):'Ensure P is greater than Pv.'],
['Pipe Flow Velocity','Plumbing','v = Q / A',['Q|Flow (m³/s)','A|Pipe area (m²)'],v=>need(v,['Q','A'])&&v.A>0?fmt('Velocity',v.Q/v.A,'m/s'):'Enter flow and area.'],
['Pipe Area from Diameter','Plumbing','A = πD²/4',['D|Internal diameter (m)'],v=>need(v,['D'])&&v.D>0?fmt('Area',Math.PI*v.D*v.D/4,'m²'):'Enter positive diameter.'],
['Reynolds Number','Plumbing','Re = ρvD/μ',['rho|Density (kg/m³)','v|Velocity (m/s)','D|Diameter (m)','mu|Dynamic viscosity (Pa·s)'],v=>need(v,['rho','v','D','mu'])&&v.mu>0?fmt('Re',v.rho*v.v*v.D/v.mu,''):'Enter all valid values.'],
['Darcy-Weisbach Head Loss','Plumbing','hf = f(L/D)(v²/2g)',['f|Friction factor','L|Length (m)','D|Diameter (m)','v|Velocity (m/s)'],v=>need(v,['f','L','D','v'])&&v.D>0?fmt('Head loss',v.f*v.L/v.D*v.v*v.v/(2*9.80665),'m'):'Enter valid values.'],
['Pressure from Head','Plumbing','P = ρgH',['rho|Density (kg/m³)','H|Head (m)'],v=>need(v,['rho','H'])?fmt('Pressure',v.rho*9.80665*v.H,'Pa'):'Enter density and head.'],
['Head from Pressure','Plumbing','H = P/(ρg)',['P|Pressure (Pa)','rho|Density (kg/m³)'],v=>need(v,['P','rho'])&&v.rho>0?fmt('Head',v.P/(v.rho*9.80665),'m'):'Enter pressure and density.'],
['Pump Hydraulic Power','Plumbing','P = ρgQH',['rho|Density (kg/m³)','Q|Flow (m³/s)','H|Head (m)'],v=>need(v,['rho','Q','H'])?fmt('Hydraulic power',v.rho*9.80665*v.Q*v.H,'W'):'Enter density, flow and head.'],
['Pump Shaft Power','Plumbing','Pshaft = Phyd / η',['Phyd|Hydraulic power (W)','eta|Pump efficiency'],v=>need(v,['Phyd','eta'])&&v.eta>0?fmt('Shaft power',v.Phyd/v.eta,'W'):'Enter power and efficiency.'],
['Pump Flow from Power','Plumbing','Q = P/(ρgH)',['P|Hydraulic power (W)','rho|Density (kg/m³)','H|Head (m)'],v=>need(v,['P','rho','H'])&&v.rho>0&&v.H>0?fmt('Flow',v.P/(v.rho*9.80665*v.H),'m³/s'):'Enter valid power, density and head.'],
['Tank Volume','Plumbing','V = L × W × H',['L|Length (m)','W|Width (m)','H|Height (m)'],v=>need(v,['L','W','H'])?fmt('Volume',v.L*v.W*v.H,'m³'):'Enter all dimensions.'],
['Cylinder Volume','Plumbing','V = πD²H/4',['D|Diameter (m)','H|Height (m)'],v=>need(v,['D','H'])?fmt('Volume',Math.PI*v.D*v.D*v.H/4,'m³'):'Enter diameter and height.'],
['Flow Rate from Volume','Plumbing','Q = V/t',['V|Volume (m³)','t|Time (s)'],v=>need(v,['V','t'])&&v.t>0?fmt('Flow',v.V/v.t,'m³/s'):'Enter volume and positive time.'],
['Concrete Volume','Construction','V = L × W × D',['L|Length (m)','W|Width (m)','D|Depth (m)'],v=>need(v,['L','W','D'])?fmt('Concrete',v.L*v.W*v.D,'m³'):'Enter all dimensions.'],
['Concrete with Waste','Construction','Vorder = V × (1 + waste)',['V|Calculated volume (m³)','waste|Waste fraction (e.g. 0.10)'],v=>need(v,['V','waste'])?fmt('Order volume',v.V*(1+v.waste),'m³'):'Enter volume and waste fraction.'],
['Square Footage','Construction','A = L × W',['L|Length','W|Width'],v=>need(v,['L','W'])?fmt('Area',v.L*v.W,'m²'):'Enter length and width.'],
['Rectangle Material Area','Construction','A = L × W',['L|Length','W|Width'],v=>need(v,['L','W'])?fmt('Area',v.L*v.W,'m²'):'Enter length and width.'],
['Triangle Area','Construction','A = ½bh',['b|Base','h|Height'],v=>need(v,['b','h'])?fmt('Area',.5*v.b*v.h,'m²'):'Enter base and height.'],
['Circle Area','Construction','A = πr²',['r|Radius (m)'],v=>need(v,['r'])?fmt('Area',Math.PI*v.r*v.r,'m²'):'Enter radius.'],
['Cylinder Surface Area','Construction','A = 2πr(r+h)',['r|Radius (m)','h|Height (m)'],v=>need(v,['r','h'])?fmt('Surface area',2*Math.PI*v.r*(v.r+v.h),'m²'):'Enter radius and height.'],
['Roof Pitch','Construction','pitch = rise/run × 100',['rise|Rise','run|Run'],v=>need(v,['rise','run'])&&v.run>0?fmt('Pitch',v.rise/v.run*100,'%'):'Enter rise and run.'],
['Rafter Length','Construction','L = √(rise² + run²)',['rise|Rise (m)','run|Run (m)'],v=>need(v,['rise','run'])?fmt('Rafter',Math.hypot(v.rise,v.run),'m'):'Enter rise and run.'],
['Pythagorean Theorem','General','c = √(a²+b²)',['a|Side a','b|Side b'],v=>need(v,['a','b'])?fmt('c',Math.hypot(v.a,v.b),''):'Enter both sides.'],
['Percentage Change','General','(new−old)/old × 100',['new|New value','old|Old value'],v=>need(v,['new','old'])&&v.old!==0?fmt('Change',(v.new-v.old)/v.old*100,'%'):'Old value cannot be zero.'],
['Percentage Difference','General','|a−b| / ((a+b)/2) × 100',['a|Value A','b|Value B'],v=>need(v,['a','b'])&&v.a+v.b!==0?fmt('Difference',Math.abs(v.a-v.b)/((v.a+v.b)/2)*100,'%'):'Enter values with non-zero average.'],
['Absolute Error','General','|measured−true|',['measured|Measured value','true|Reference value'],v=>need(v,['measured','true'])?fmt('Absolute error',Math.abs(v.measured-v.true),''):'Enter both values.'],
['Relative Error','General','|error|/|true| × 100',['measured|Measured value','true|Reference value'],v=>need(v,['measured','true'])&&v.true!==0?fmt('Relative error',Math.abs(v.measured-v.true)/Math.abs(v.true)*100,'%'):'Reference value cannot be zero.'],
['Temperature °C → °F','Units','F = C × 9/5 + 32',['C|Temperature (°C)'],v=>need(v,['C'])?fmt('Temperature',v.C*9/5+32,'°F'):'Enter temperature.'],
['Temperature °F → °C','Units','C = (F−32) × 5/9',['F|Temperature (°F)'],v=>need(v,['F'])?fmt('Temperature',(v.F-32)*5/9,'°C'):'Enter temperature.'],
['Pressure kPa → bar','Units','bar = kPa / 100',['kPa|Pressure (kPa)'],v=>need(v,['kPa'])?fmt('Pressure',v.kPa/100,'bar'):'Enter pressure.'],
['Pressure bar → kPa','Units','kPa = bar × 100',['bar|Pressure (bar)'],v=>need(v,['bar'])?fmt('Pressure',v.bar*100,'kPa'):'Enter pressure.'],
['Flow L/s → m³/s','Units','m³/s = L/s / 1000',['Lps|Flow (L/s)'],v=>need(v,['Lps'])?fmt('Flow',v.Lps/1000,'m³/s'):'Enter flow.'],
['Flow m³/h → L/min','Units','L/min = m³/h × 1000 / 60',['m3h|Flow (m³/h)'],v=>need(v,['m3h'])?fmt('Flow',v.m3h*1000/60,'L/min'):'Enter flow.'],
['Power kW → W','Units','W = kW × 1000',['kW|Power (kW)'],v=>need(v,['kW'])?fmt('Power',v.kW*1000,'W'):'Enter power.'],
['Power W → kW','Units','kW = W / 1000',['W|Power (W)'],v=>need(v,['W'])?fmt('Power',v.W/1000,'kW'):'Enter power.'],
['Length mm → m','Units','m = mm / 1000',['mm|Length (mm)'],v=>need(v,['mm'])?fmt('Length',v.mm/1000,'m'):'Enter length.'],
['Length m → mm','Units','mm = m × 1000',['m|Length (m)'],v=>need(v,['m'])?fmt('Length',v.m*1000,'mm'):'Enter length.'],
['Density','Fluid Mechanics','ρ = m / V',['m|Mass (kg)','V|Volume (m³)'],v=>need(v,['m','V'])&&v.V>0?fmt('Density',v.m/v.V,'kg/m³'):'Enter mass and volume.'],
['Mass Flow Rate','Fluid Mechanics','ṁ = ρQ',['rho|Density (kg/m³)','Q|Volumetric flow (m³/s)'],v=>need(v,['rho','Q'])?fmt('Mass flow',v.rho*v.Q,'kg/s'):'Enter density and flow.'],
['Dynamic Pressure','Fluid Mechanics','q = ½ρv²',['rho|Density (kg/m³)','v|Velocity (m/s)'],v=>need(v,['rho','v'])?fmt('Dynamic pressure',.5*v.rho*v.v*v.v,'Pa'):'Enter density and velocity.'],
['Bernoulli Head','Fluid Mechanics','H = v²/(2g) + P/(ρg) + z',['v|Velocity (m/s)','P|Pressure (Pa)','rho|Density (kg/m³)','z|Elevation (m)'],v=>need(v,['v','P','rho','z'])&&v.rho>0?fmt('Total head',v.v*v.v/(2*9.80665)+v.P/(v.rho*9.80665)+v.z,'m'):'Enter all values.'],
['Stress','Mechanical','σ = F / A',['F|Force (N)','A|Area (m²)'],v=>need(v,['F','A'])&&v.A>0?fmt('Stress',v.F/v.A,'Pa'):'Enter force and positive area.'],
['Strain','Mechanical','ε = ΔL / L',['dL|Change in length','L|Original length'],v=>need(v,['dL','L'])&&v.L>0?fmt('Strain',v.dL/v.L,''):'Enter change and original length.'],
['Young\'s Modulus','Mechanical','E = σ / ε',['stress|Stress (Pa)','strain|Strain'],v=>need(v,['stress','strain'])&&v.strain!==0?fmt('Young modulus',v.stress/v.strain,'Pa'):'Enter stress and non-zero strain.'],
['Thermal Expansion','Mechanical','ΔL = αLΔT',['alpha|Expansion coefficient (1/K)','L|Original length (m)','dT|Temperature change (K)'],v=>need(v,['alpha','L','dT'])?fmt('Expansion',v.alpha*v.L*v.dT,'m'):'Enter all values.'],
['Mechanical Power','Mechanical','P = Fv',['F|Force (N)','v|Velocity (m/s)'],v=>need(v,['F','v'])?fmt('Power',v.F*v.v,'W'):'Enter force and velocity.'],
['Mechanical Efficiency','Mechanical','η = output/input × 100',['out|Output power','input|Input power'],v=>need(v,['out','input'])&&v.input>0?fmt('Efficiency',v.out/v.input*100,'%'):'Enter powers.'],
['Gear Ratio','Mechanical','ratio = driven / driver',['driven|Driven teeth','driver|Driver teeth'],v=>need(v,['driven','driver'])&&v.driver>0?fmt('Ratio',v.driven/v.driver,''):'Enter tooth counts.'],
['Spring Force','Mechanical','F = kx',['k|Spring constant (N/m)','x|Deflection (m)'],v=>need(v,['k','x'])?fmt('Force',v.k*v.x,'N'):'Enter spring constant and deflection.'],
['Kinetic Energy','Mechanical','E = ½mv²',['m|Mass (kg)','v|Velocity (m/s)'],v=>need(v,['m','v'])?fmt('Energy',.5*v.m*v.v*v.v,'J'):'Enter mass and velocity.'],
['Potential Energy','Mechanical','E = mgh',['m|Mass (kg)','h|Height (m)'],v=>need(v,['m','h'])?fmt('Energy',v.m*9.80665*v.h,'J'):'Enter mass and height.'],
['Heat Loss Through Wall','Building','Q = U A ΔT',['U|U-value (W/m²K)','A|Area (m²)','dT|Temperature difference (K)'],v=>need(v,['U','A','dT'])?fmt('Heat loss',v.U*v.A*v.dT,'W'):'Enter U-value, area and ΔT.'],
['Thermal Resistance','Building','R = 1/U',['U|U-value (W/m²K)'],v=>need(v,['U'])&&v.U>0?fmt('R-value',1/v.U,'m²K/W'):'Enter positive U-value.'],
['Air Density','HVAC','ρ = P/(RT)',['P|Absolute pressure (Pa)','T|Temperature (K)'],v=>need(v,['P','T'])&&v.T>0?fmt('Density',v.P/(287.05*v.T),'kg/m³'):'Enter absolute pressure and Kelvin temperature.']
];
function need(v,ks){return ks.every(k=>v[k]!=null&&Number.isFinite(v[k]))}
function fmt(label,n,u){if(!Number.isFinite(n))return 'Calculation outside valid numeric range.';const a=Math.abs(n);const s=(a!==0&&(a<1e-4||a>=1e6))?n.toExponential(6):n.toFixed(5).replace(/\.?(0+)$/,'');return label+' = '+s+(u?' '+u:'')}
function sum(v,ks){const a=ks.map(k=>v[k]).filter(x=>x!=null&&Number.isFinite(x));return a.length>=2?a.reduce((x,y)=>x+y,0):null}
function pick(v,primary,opts,msg){for(const [a,b,fn] of opts){if(v[a]!=null&&v[b]!=null&&((a!=='R'&&b!=='R')||true))return fmt(primary[0],fn(),'');}return msg}
const $=id=>document.getElementById(id),num=x=>x===''?null:Number(x);
const cats=[...new Set(T.map(t=>t[1]))]; const sel=$('engCategory'); if(sel){cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c.toUpperCase();sel.appendChild(o)})}
function render(){const q=($('engSearch')?.value||'').toLowerCase(),cat=$('engCategory')?.value||'all';const list=T.filter(t=>(cat==='all'||t[1]===cat)&&(!q||(t[0]+' '+t[1]+' '+t[2]).toLowerCase().includes(q)));if($('localCount'))$('localCount').textContent=list.length+' local tools';if($('engGrid'))$('engGrid').innerHTML=list.map((t,i)=>'<article class="eng-tool"><span class="type">LOCAL · '+esc(t[1])+'</span><h3>'+esc(t[0])+'</h3><p>'+esc(t[2])+'</p><button class="os-btn" data-tool="'+i+'">OPEN TOOL →</button></article>').join('')||'<div class="intel-empty">No local tools match.</div>';document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>openTool(list[+b.dataset.tool]))}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function openTool(t){$('engModal').classList.add('open');$('engModal').setAttribute('aria-hidden','false');$('engBody').innerHTML='<div class="os-kicker">LOCAL TOOL / '+esc(t[1])+'</div><h2>'+esc(t[0])+'</h2><div class="eng-formula">'+esc(t[2])+'</div><div class="eng-form">'+t[3].map(x=>{const p=x.split('|');return '<div class="eng-field"><label>'+esc(p[1])+'</label><input type="number" step="any" data-key="'+esc(p[0])+'"></div>'}).join('')+'</div><div class="hb-mini-actions" style="margin-top:14px"><button id="doCalc" class="os-btn primary">CALCULATE</button><button id="doClear" class="os-btn">CLEAR</button></div><div id="engResult" class="eng-result">Results are calculated locally in your browser.</div><p class="tool-source-note">Independent HB implementation using the displayed engineering relationship. For code-critical work, verify the applicable standard, manufacturer data and project conditions.</p>';$('doCalc').onclick=()=>{const v={};document.querySelectorAll('#engBody input').forEach(i=>v[i.dataset.key]=num(i.value));try{$('engResult').textContent=t[4](v)}catch(e){$('engResult').textContent='Check the inputs and try again.'}};$('doClear').onclick=()=>{document.querySelectorAll('#engBody input').forEach(i=>i.value='');$('engResult').textContent='Results are calculated locally in your browser.'}}
function close(){$('engModal').classList.remove('open');$('engModal').setAttribute('aria-hidden','true')}
$('engSearch')?.addEventListener('input',render);$('engCategory')?.addEventListener('change',render);$('engClose')?.addEventListener('click',close);$('engModal')?.addEventListener('click',e=>{if(e.target===$('engModal'))close()});render();
$('hbLabTheme')?.addEventListener('click',()=>document.body.classList.toggle('light-mode'));
})();