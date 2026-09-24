/* HB MEGA TOOLS
   Browser-local engineering, networking, programming and data calculators.
   No repository navigation is required to use a tool.
*/
(() => {
'use strict';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const DEFINITIONS = {
"Ohm’s Law": ["V = I × R",["Voltage V (V)","Current I (A)","Resistance R (Ω)"],v=>{
 const [V,I,R]=v;
 if(V==null&&I!=null&&R!=null)return "V = "+(I*R).toFixed(6)+" V";
 if(I==null&&V!=null&&R!=null&&R!==0)return "I = "+(V/R).toFixed(6)+" A";
 if(R==null&&V!=null&&I!=null&&I!==0)return "R = "+(V/I).toFixed(6)+" Ω";
 return "Enter any two of V, I and R.";
}],
"Power": ["P = V × I = I²R = V²/R",["Voltage V (V)","Current I (A)","Resistance R (Ω)","Power P (W)"],v=>{
 const [V,I,R,P]=v;
 if(P==null&&V!=null&&I!=null)return "P = "+(V*I).toFixed(6)+" W";
 if(V==null&&P!=null&&I!=null&&I!==0)return "V = "+(P/I).toFixed(6)+" V";
 if(I==null&&P!=null&&V!=null&&V!==0)return "I = "+(P/V).toFixed(6)+" A";
 if(R==null&&V!=null&&P!=null&&P!==0)return "R = "+(V*V/P).toFixed(6)+" Ω";
 if(P==null&&I!=null&&R!=null)return "P = "+(I*I*R).toFixed(6)+" W";
 if(V==null&&I!=null&&R!=null)return "V = "+(I*R).toFixed(6)+" V";
 if(I==null&&V!=null&&R!=null&&R!==0)return "I = "+(V/R).toFixed(6)+" A";
 return "Enter enough values to solve the power law.";
}],
"Power Law": ["P = V × I",["Voltage V (V)","Current I (A)","Power P (W)"],v=>{
 if(v[2]==null&&v[0]!=null&&v[1]!=null)return "P = "+(v[0]*v[1]).toFixed(6)+" W";
 if(v[0]==null&&v[2]!=null&&v[1]!==0&&v[1]!=null)return "V = "+(v[2]/v[1]).toFixed(6)+" V";
 if(v[1]==null&&v[2]!=null&&v[0]!==0&&v[0]!=null)return "I = "+(v[2]/v[0]).toFixed(6)+" A";
 return "Enter any two values.";
}],
"Voltage Divider": ["Vout = Vin × R2 / (R1 + R2)",["Vin (V)","R1 (Ω)","R2 (Ω)"],v=>v.every(x=>x!=null)&&v[1]+v[2]!==0?"Vout = "+(v[0]*v[2]/(v[1]+v[2])).toFixed(6)+" V":"Enter Vin, R1 and R2."],
"Current Divider": ["I1 = It × R2 / (R1 + R2)",["Total current It (A)","R1 (Ω)","R2 (Ω)"],v=>v.every(x=>x!=null)&&v[1]+v[2]!==0?"I1 = "+(v[0]*v[2]/(v[1]+v[2])).toFixed(6)+" A":"Enter It, R1 and R2."],
"Series Resistance": ["Rt = R1 + R2 + …",["R1 (Ω)","R2 (Ω)"],v=>v[0]!=null&&v[1]!=null?"Rt = "+(v[0]+v[1]).toFixed(6)+" Ω":"Enter both resistors."],
"Parallel Resistance": ["1/Rt = 1/R1 + 1/R2",["R1 (Ω)","R2 (Ω)"],v=>v[0]>0&&v[1]>0?"Rt = "+(1/(1/v[0]+1/v[1])).toFixed(6)+" Ω":"Enter positive resistor values."],
"RC Time Constant": ["τ = R × C",["Resistance R (Ω)","Capacitance C (F)"],v=>product(v," s")],
"RL Time Constant": ["τ = L / R",["Inductance L (H)","Resistance R (Ω)"],v=>v[0]!=null&&v[1]>0?"τ = "+(v[0]/v[1]).toFixed(6)+" s":"Enter L and R."],
"Capacitor Energy": ["E = ½CV²",["Capacitance C (F)","Voltage V (V)"],v=>v[0]>=0&&v[1]!=null?"E = "+(0.5*v[0]*v[1]**2).toFixed(6)+" J":"Enter C and V."],
"Inductor Energy": ["E = ½LI²",["Inductance L (H)","Current I (A)"],v=>v[0]>=0&&v[1]!=null?"E = "+(0.5*v[0]*v[1]**2).toFixed(6)+" J":"Enter L and I."],
"Resonant Frequency": ["f = 1/(2π√LC)",["Inductance L (H)","Capacitance C (F)"],v=>v[0]>0&&v[1]>0?"f = "+(1/(2*Math.PI*Math.sqrt(v[0]*v[1]))).toFixed(6)+" Hz":"Enter positive L and C."],
"LC Resonance": ["f = 1/(2π√LC)",["Inductance L (H)","Capacitance C (F)"],v=>v[0]>0&&v[1]>0?"f = "+(1/(2*Math.PI*Math.sqrt(v[0]*v[1]))).toFixed(6)+" Hz":"Enter positive L and C."],
"Frequency Period": ["f = 1/T",["Frequency f (Hz)","Period T (s)"],v=>v[0]>0?"T = "+(1/v[0]).toFixed(8)+" s":v[1]>0?"f = "+(1/v[1]).toFixed(8)+" Hz":"Enter f or T."],
"Frequency / Period": ["f = 1/T",["Frequency f (Hz)","Period T (s)"],v=>v[0]>0?"T = "+(1/v[0]).toFixed(8)+" s":v[1]>0?"f = "+(1/v[1]).toFixed(8)+" Hz":"Enter f or T."],
"Wavelength": ["λ = c/f",["Frequency f (Hz)"],v=>v[0]>0?"λ = "+(299792458/v[0]).toFixed(6)+" m":"Enter frequency."],
"Power Factor": ["PF = P / S",["Real power P (W)","Apparent power S (VA)"],v=>v[0]!=null&&v[1]>0?"PF = "+(v[0]/v[1]).toFixed(5):"Enter P and S."],
"Apparent Power": ["S = V × I",["Voltage (V)","Current (A)"],v=>product(v," VA")],
"Reactive Power": ["Q = √(S² − P²)",["Apparent power S (VA)","Real power P (W)"],v=>v[0]>=v[1]&&v[0]!=null&&v[1]>=0?"Q = "+Math.sqrt(v[0]**2-v[1]**2).toFixed(4)+" var":"Enter S ≥ P."],
"Three-Phase Power": ["P = √3 × V × I × PF",["Line voltage V (V)","Line current I (A)","Power factor"],v=>v.every(x=>x!=null)?"P = "+(Math.sqrt(3)*v[0]*v[1]*v[2]).toFixed(4)+" W":"Enter all values."],
"Three-Phase Current": ["I = P/(√3 × V × PF)",["Power P (W)","Line voltage V (V)","Power factor"],v=>v[0]!=null&&v[1]>0&&v[2]>0?"I = "+(v[0]/(Math.sqrt(3)*v[1]*v[2])).toFixed(4)+" A":"Enter all values."],
"Transformer Ratio": ["V1/V2 = N1/N2",["V1 primary","V2 secondary","N1 primary turns"],v=>v.every(x=>x!=null)&&v[0]!==0?"N2 = "+(v[2]*v[1]/v[0]).toFixed(4)+" turns":"Enter all values."],
"Transformer Current": ["I2 ≈ I1 × V1/V2",["I1 primary (A)","V1 primary (V)","V2 secondary (V)"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"I2 ≈ "+(v[0]*v[1]/v[2]).toFixed(4)+" A":"Enter all values."],
"LED Resistor": ["R = (Vs − Vf) / I",["Supply Vs (V)","LED Vf (V)","Current I (A)"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"R = "+((v[0]-v[1])/v[2]).toFixed(2)+" Ω":"Enter Vs, Vf and I."],
"Impedance": ["Z = √(R² + X²)",["Resistance R (Ω)","Reactance X (Ω)"],v=>v[0]!=null&&v[1]!=null?"Z = "+Math.hypot(v[0],v[1]).toFixed(6)+" Ω":"Enter R and X."],
"Gain dB": ["dB = 20 log10(Vout/Vin)",["Output","Input"],v=>v[0]>0&&v[1]>0?"Gain = "+(20*Math.log10(v[0]/v[1])).toFixed(4)+" dB":"Enter positive values."],
"Efficiency": ["η = output/input × 100",["Output","Input"],v=>v[0]!=null&&v[1]>0?"η = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter output and input."],
"Overall Efficiency": ["η = output/input × 100",["Output","Input"],v=>v[0]!=null&&v[1]>0?"η = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter output and input."],
"Electrical Efficiency": ["η = Pout/Pin × 100",["Output power (W)","Input power (W)"],v=>v[0]!=null&&v[1]>0?"η = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter both powers."],
"Mechanical Efficiency": ["η = Pout/Pin × 100",["Output power (W)","Input power (W)"],v=>v[0]!=null&&v[1]>0?"η = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter both powers."],
"Current Gain": ["Ai = Iout/Iin",["Iout (A)","Iin (A)"],v=>ratio(v)],
"Voltage Gain": ["Av = Vout/Vin",["Vout (V)","Vin (V)"],v=>ratio(v)],
"Power Gain": ["Ap = Pout/Pin",["Pout (W)","Pin (W)"],v=>ratio(v)],
"Motor Torque": ["τ = P/ω; ω = 2πn/60",["Power P (W)","Speed n (RPM)"],v=>v[0]!=null&&v[1]>0?"τ = "+(v[0]/(2*Math.PI*v[1]/60)).toFixed(4)+" N·m":"Enter power and RPM."],
"Motor Input Power": ["Pin = Pout/η",["Output power (W)","Efficiency (0–1)"],v=>v[0]!=null&&v[1]>0?"Pin = "+(v[0]/v[1]).toFixed(4)+" W":"Enter output and efficiency."],
"Motor Output Power": ["Pout = Pin × η",["Input power (W)","Efficiency (0–1)"],v=>v[0]!=null&&v[1]>=0?"Pout = "+(v[0]*v[1]).toFixed(4)+" W":"Enter input and efficiency."],
"Voltage Drop": ["Vdrop = I × R",["Current I (A)","Resistance R (Ω)"],v=>product(v," V")],
"Cable Voltage Drop": ["Vdrop = I × R",["Current I (A)","Resistance R (Ω)"],v=>product(v," V")],
"Voltage Drop Percent": ["%drop = Vdrop/Vs × 100",["Voltage drop","Supply voltage"],v=>v[0]!=null&&v[1]>0?"Drop = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter both values."],
"Energy Consumption": ["E = P × t",["Power (kW)","Time (h)"],v=>product(v," kWh")],
"Energy Cost": ["Cost = energy × tariff",["Energy (kWh)","Tariff (€/kWh)"],v=>product(v," €")],
"Battery Runtime": ["Runtime ≈ capacity/load",["Capacity (Ah)","Load (A)"],v=>v[0]>=0&&v[1]>0?"Runtime ≈ "+(v[0]/v[1]).toFixed(4)+" h":"Enter capacity and load."],
"Battery Charge Time": ["t ≈ capacity/current",["Capacity (Ah)","Charge current (A)"],v=>v[0]>=0&&v[1]>0?"Time ≈ "+(v[0]/v[1]).toFixed(4)+" h":"Enter capacity and current."],
"Battery C-Rate": ["C-rate = current/capacity",["Current (A)","Capacity (Ah)"],v=>v[1]>0&&v[0]!=null?"C-rate = "+(v[0]/v[1]).toFixed(4)+" C":"Enter current and capacity."],
"Demand Factor": ["DF = maximum demand/connected load",["Maximum demand","Connected load"],v=>ratio(v)],
"Pressure Head": ["h = p/(ρg)",["Pressure p (Pa)","Density ρ (kg/m³)"],v=>v[0]!=null&&v[1]>0?"h = "+(v[0]/(v[1]*9.80665)).toFixed(4)+" m":"Enter pressure and density."],
"Fluid Velocity": ["v = Q/A",["Flow Q (m³/s)","Area A (m²)"],v=>v[0]!=null&&v[1]>0?"v = "+(v[0]/v[1]).toFixed(6)+" m/s":"Enter flow and area."],
"Flow Rate": ["Q = v × A",["Velocity v (m/s)","Area A (m²)"],v=>product(v," m³/s")],
"Reynolds Number": ["Re = ρvD/μ",["Density ρ","Velocity v","Diameter D","Dynamic viscosity μ"],v=>v.every(x=>x!=null)&&v[3]>0?"Re = "+(v[0]*v[1]*v[2]/v[3]).toFixed(2):"Enter all four values."],
"Stress": ["σ = F/A",["Force F (N)","Area A (m²)"],v=>v[0]!=null&&v[1]>0?"σ = "+(v[0]/v[1]).toFixed(4)+" Pa":"Enter force and area."],
"Strain": ["ε = ΔL/L",["Change ΔL","Original length L"],v=>v[0]!=null&&v[1]>0?"ε = "+(v[0]/v[1]).toFixed(8):"Enter both lengths."],
"Young Modulus": ["E = stress/strain",["Stress (Pa)","Strain"],v=>v[0]!=null&&v[1]>0?"E = "+(v[0]/v[1]).toFixed(4)+" Pa":"Enter stress and strain."],
"Absolute Error": ["|measured − true|",["Measured","True"],v=>v[0]!=null&&v[1]!=null?"Absolute error = "+Math.abs(v[0]-v[1]).toFixed(6):"Enter both values."],
"Relative Error": ["|measured − true|/|true| × 100",["Measured","True"],v=>v[0]!=null&&v[1]!==0?"Relative error = "+(Math.abs(v[0]-v[1])/Math.abs(v[1])*100).toFixed(4)+" %":"Enter values; true value cannot be zero."],
"Tolerance Band": ["lower = nominal − tolerance; upper = nominal + tolerance",["Nominal","Tolerance"],v=>v[0]!=null&&v[1]>=0?"Range: "+(v[0]-v[1]).toFixed(6)+" to "+(v[0]+v[1]).toFixed(6):"Enter nominal and tolerance."],
"Percent Change": ["(new − old)/old × 100",["New value","Old value"],v=>v[0]!=null&&v[1]!==0?"Change = "+((v[0]-v[1])/v[1]*100).toFixed(4)+" %":"Enter values; old value cannot be zero."],
"Growth Rate": ["(new − old)/old × 100",["New value","Old value"],v=>v[0]!=null&&v[1]!==0?"Growth = "+((v[0]-v[1])/v[1]*100).toFixed(4)+" %":"Enter values; old value cannot be zero."],
"CAGR": ["(Ending/Beginning)^(1/n) − 1",["Beginning","Ending","Years"],v=>v[0]>0&&v[1]>=0&&v[2]>0?"CAGR = "+((Math.pow(v[1]/v[0],1/v[2])-1)*100).toFixed(4)+" %/year":"Enter beginning, ending and years."],
"ROI": ["(gain − cost)/cost × 100",["Gain / return","Cost / investment"],v=>v[0]!=null&&v[1]>0?"ROI = "+((v[0]-v[1])/v[1]*100).toFixed(4)+" %":"Enter return and cost."],
"Mean": ["mean = Σx/n",["Values (comma separated)"],()=>stat("mean")],
"Median": ["middle value after sorting",["Values (comma separated)"],()=>stat("median")],
"Mode": ["most frequent value",["Values (comma separated)"],()=>stat("mode")],
"Range": ["range = max − min",["Values (comma separated)"],()=>stat("range")],
"Variance": ["σ² = Σ(x−μ)²/n",["Values (comma separated)"],()=>stat("variance")],
"Standard Deviation": ["σ = √variance",["Values (comma separated)"],()=>stat("std")],
"Coefficient of Variation": ["CV = σ/μ × 100",["Values (comma separated)"],()=>stat("cv")],
"Z Score": ["z = (x−μ)/σ",["x","Mean μ","Std dev σ"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"z = "+((v[0]-v[1])/v[2]).toFixed(6):"Enter x, mean and standard deviation."],
"Precision": ["TP/(TP+FP)",["TP","FP"],v=>v[0]>=0&&v[1]>=0&&v[0]+v[1]>0?"Precision = "+(v[0]/(v[0]+v[1])*100).toFixed(3)+" %":"Enter TP and FP."],
"Recall": ["TP/(TP+FN)",["TP","FN"],v=>v[0]>=0&&v[1]>=0&&v[0]+v[1]>0?"Recall = "+(v[0]/(v[0]+v[1])*100).toFixed(3)+" %":"Enter TP and FN."],
"F1 Score": ["2PR/(P+R)",["Precision (0–1)","Recall (0–1)"],v=>v[0]>=0&&v[1]>=0&&v[0]+v[1]>0?"F1 = "+(2*v[0]*v[1]/(v[0]+v[1])).toFixed(6):"Enter precision and recall."],
"Accuracy": ["(TP+TN)/(TP+TN+FP+FN)",["TP","TN","FP","FN"],v=>v.every(x=>x!=null)&&v.reduce((a,b)=>a+b,0)>0?"Accuracy = "+((v[0]+v[1])/v.reduce((a,b)=>a+b,0)*100).toFixed(3)+" %":"Enter all four values."],
"IPv4 CIDR": ["network + broadcast + usable hosts from prefix",["IPv4 address","Prefix 0–32"],v=>cidr(document.getElementById("megaInput0")?.value.trim(),parseInt(document.getElementById("megaInput1")?.value))],
"CIDR IPv4": ["network + broadcast + usable hosts from prefix",["IPv4 address","Prefix 0–32"],v=>cidr(document.getElementById("megaInput0")?.value.trim(),parseInt(document.getElementById("megaInput1")?.value))],
"IPv4 Usable Hosts": ["2^(32−prefix) − 2",["Prefix 0–32"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=32?(v[0]>=31?2**(32-v[0]):2**(32-v[0])-2).toLocaleString()+" usable hosts":"Enter a prefix from 0 to 32."],
"Subnet Hosts": ["2^hostBits − 2",["Host bits"],v=>Number.isInteger(v[0])&&v[0]>=0?Math.max(0,2**v[0]-2).toLocaleString()+" usable hosts":"Enter host bits."],
"Private IP Check": ["RFC1918: 10/8 · 172.16/12 · 192.168/16",["IPv4 address"],()=>{const x=$("megaInput0")?.value.trim(),o=x?.split(".").map(Number);const ok=o?.length===4&&o.every(n=>Number.isInteger(n)&&n>=0&&n<=255);return ok?(((o[0]===10)||(o[0]===172&&o[1]>=16&&o[1]<=31)||(o[0]===192&&o[1]===168))?"PRIVATE":"NOT PRIVATE"):"Enter a valid IPv4 address."}],
"Port Number Range": ["TCP/UDP ports: 0–65535",["Port"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=65535?(v[0]<1024?"0–1023 well-known":v[0]<49152?"1024–49151 registered":"49152–65535 dynamic"):"Enter a port from 0 to 65535."],
"Decimal to Binary": ["base-10 → base-2",["Decimal value"],v=>v[0]!=null?Math.trunc(v[0]).toString(2):"Enter a value."],
"Binary to Decimal": ["Σ(bit × 2^position)",["Binary value"],()=>{const x=$("megaInput0")?.value.trim();return /^[01]+$/.test(x)?parseInt(x,2).toString(10):"Enter only 0 and 1."}],
"Decimal to Hex": ["base-10 → base-16",["Decimal value"],v=>v[0]!=null?Math.trunc(v[0]).toString(16).toUpperCase():"Enter a value."],
"Hex to Decimal": ["Σ(hex digit × 16^position)",["Hex value"],()=>{const x=$("megaInput0")?.value.trim().replace(/^0x/i,"");return /^[0-9a-f]+$/i.test(x)?parseInt(x,16).toString(10):"Enter valid hexadecimal."}],
"Bytes → KB / MB": ["KB = bytes/1024; MB = bytes/1,048,576",["Bytes"],v=>v[0]>=0?v[0]+" bytes = "+(v[0]/1024).toFixed(3)+" KB = "+(v[0]/1048576).toFixed(3)+" MB":"Enter bytes."],
"Celsius → Fahrenheit": ["F = C × 9/5 + 32",["Celsius °C"],v=>v[0]!=null?(v[0]*9/5+32).toFixed(2)+" °F":"Enter °C."],
"Celsius Fahrenheit": ["F = C × 9/5 + 32",["Celsius °C"],v=>v[0]!=null?(v[0]*9/5+32).toFixed(2)+" °F":"Enter °C."],
"Fahrenheit Celsius": ["C = (F − 32) × 5/9",["Fahrenheit °F"],v=>v[0]!=null?((v[0]-32)*5/9).toFixed(2)+" °C":"Enter °F."],
"Kelvin Celsius": ["C = K − 273.15",["Kelvin K"],v=>v[0]!=null?(v[0]-273.15).toFixed(2)+" °C":"Enter Kelvin."],
"kW HP": ["hp = kW × 1.34102",["Power kW"],v=>v[0]!=null?(v[0]*1.34102209).toFixed(4)+" hp":"Enter kW."],
"HP kW": ["kW = hp × 0.7457",["Power hp"],v=>v[0]!=null?(v[0]*0.745699872).toFixed(4)+" kW":"Enter hp."],
"Bar PSI": ["psi = bar × 14.5038",["Pressure bar"],v=>v[0]!=null?(v[0]*14.5037738).toFixed(4)+" psi":"Enter bar."],
"PSI Bar": ["bar = psi/14.5038",["Pressure psi"],v=>v[0]!=null?(v[0]/14.5037738).toFixed(4)+" bar":"Enter psi."],
"RPM to Hz": ["Hz = RPM/60",["RPM"],v=>v[0]!=null?(v[0]/60).toFixed(6)+" Hz":"Enter RPM."],
"Hz to RPM": ["RPM = Hz × 60",["Hz"],v=>v[0]!=null?(v[0]*60).toFixed(4)+" RPM":"Enter Hz."],
"m/s to km/h": ["km/h = m/s × 3.6",["m/s"],v=>v[0]!=null?(v[0]*3.6).toFixed(4)+" km/h":"Enter m/s."],
"km/h to m/s": ["m/s = km/h/3.6",["km/h"],v=>v[0]!=null?(v[0]/3.6).toFixed(4)+" m/s":"Enter km/h."],
"Nm lb-ft": ["lb-ft = Nm × 0.737562",["Torque Nm"],v=>v[0]!=null?(v[0]*0.737562149).toFixed(4)+" lb-ft":"Enter Nm."],
"lb-ft Nm": ["Nm = lb-ft × 1.355818",["Torque lb-ft"],v=>v[0]!=null?(v[0]*1.35581795).toFixed(4)+" Nm":"Enter lb-ft."],
"N lbf": ["lbf = N × 0.224809",["Force N"],v=>v[0]!=null?(v[0]*0.224808943).toFixed(4)+" lbf":"Enter N."],
"lbf N": ["N = lbf × 4.44822",["Force lbf"],v=>v[0]!=null?(v[0]*4.44822162).toFixed(4)+" N":"Enter lbf."],
"J Wh": ["Wh = J/3600",["Energy J"],v=>v[0]!=null?(v[0]/3600).toFixed(6)+" Wh":"Enter J."],
"Wh J": ["J = Wh × 3600",["Energy Wh"],v=>v[0]!=null?(v[0]*3600).toFixed(4)+" J":"Enter Wh."],
"Aspect Ratio": ["ratio = width : height",["Width","Height"],v=>v[0]>0&&v[1]>0?ratioText(v[0],v[1]):"Enter positive dimensions."],
"Pythagorean Theorem": ["c = √(a² + b²)",["Side a","Side b"],v=>v[0]>=0&&v[1]>=0?"c = "+Math.hypot(v[0],v[1]).toFixed(6):"Enter both sides."],
"Circle Area": ["A = πr²",["Radius r"],v=>v[0]>=0?"A = "+(Math.PI*v[0]**2).toFixed(6):"Enter radius."],
"Triangle Area": ["A = ½bh",["Base b","Height h"],v=>v[0]>=0&&v[1]>=0?"A = "+(v[0]*v[1]/2).toFixed(6):"Enter base and height."],
"Cylinder Volume": ["V = πr²h",["Radius r","Height h"],v=>v[0]>=0&&v[1]>=0?"V = "+(Math.PI*v[0]**2*v[1]).toFixed(6):"Enter radius and height."],
"Sphere Volume": ["V = 4/3πr³",["Radius r"],v=>v[0]>=0?"V = "+(4*Math.PI*v[0]**3/3).toFixed(6):"Enter radius."]
};

function product(v,u){return v[0]!=null&&v[1]!=null?(v[0]*v[1]).toFixed(6)+u:"Enter both values."}
function ratio(v){return v[0]!=null&&v[1]!=null&&v[1]!==0?(v[0]/v[1]).toFixed(6):"Enter valid values."}
function ratioText(a,b){const g=(x,y)=>y?g(y,x%y):x,d=g(Math.round(a),Math.round(b));return (Math.round(a)/d)+" : "+(Math.round(b)/d)}
function stat(kind){const a=($("megaInput0")?.value||"").split(",").map(Number).filter(Number.isFinite);if(!a.length)return"Enter comma-separated numbers.";const m=a.reduce((x,y)=>x+y,0)/a.length,s=[...a].sort((x,y)=>x-y);if(kind==="mean")return"Mean = "+m.toFixed(6);if(kind==="median")return"Median = "+(s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2).toFixed(6);if(kind==="mode"){const c={};a.forEach(x=>c[x]=(c[x]||0)+1);const z=Math.max(...Object.values(c));return z===1?"No repeated mode":"Mode = "+Object.keys(c).filter(x=>c[x]===z).join(", ")}if(kind==="range")return"Range = "+(Math.max(...a)-Math.min(...a)).toFixed(6);const variance=a.reduce((x,y)=>x+(y-m)**2,0)/a.length;if(kind==="variance")return"Variance = "+variance.toFixed(6);if(kind==="std")return"Std dev = "+Math.sqrt(variance).toFixed(6);if(kind==="cv")return m?"CV = "+(Math.sqrt(variance)/Math.abs(m)*100).toFixed(4)+" %":"Mean is zero."}
function cidr(ip,p){if(!/^\d+\.\d+\.\d+\.\d+$/.test(ip)||!Number.isInteger(p)||p<0||p>32)return"Enter a valid IPv4 and prefix 0–32.";const o=ip.split(".").map(Number);if(o.some(x=>x>255))return"Invalid IPv4 address.";const n=o.reduce((x,v)=>(x*256+v)>>>0,0),mask=p===0?0:(0xffffffff<<(32-p))>>>0,net=n&mask,broad=(net|(~mask))>>>0,fmt=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join(".");return"Network "+fmt(net)+" · Broadcast "+fmt(broad)+" · "+(p>=31?2**(32-p):Math.max(0,2**(32-p)-2)).toLocaleString()+" usable hosts"}

function definitionFor(t){if(DEFINITIONS[t.name])return DEFINITIONS[t.name];const n=t.name.toLowerCase();if(/mean|median|mode|variance|standard deviation/.test(n))return["Statistics",["Values (comma separated)"],()=>stat(n.includes("mean")?"mean":n.includes("median")?"median":n.includes("mode")?"mode":n.includes("variance")?"variance":"std")];if(/converter| to /.test(n))return["Conversion helper",["Value"],v=>v[0]!=null?"Input value = "+v[0]:"Enter a value."];if(/calculator|helper|lookup|checker|check|planner|estimator|reference|notes|formatter|builder|table|map/.test(n))return["Interactive reference / helper",["Value A","Value B"],v=>v[0]!=null&&v[1]!=null?"A × B = "+(v[0]*v[1]).toFixed(6)+" · A ÷ B = "+(v[1]!==0?(v[0]/v[1]).toFixed(6):"undefined"):"Enter values."];return["No single universal equation",["Value A","Value B"],v=>v[0]!=null&&v[1]!=null?"A × B = "+(v[0]*v[1]).toFixed(6)+" · A ÷ B = "+(v[1]!==0?(v[0]/v[1]).toFixed(6):"undefined"):"Enter values."]}

window.HBMegaToolOpen=function(id){const t=window.__HBMegaTools?.find(x=>String(x.id)===String(id));if(!t)return;const modal=$("resourceToolModal"),body=$("resourceToolBody");if(!modal||!body)return;const d=definitionFor(t);$("resourceToolTitle").textContent=t.name;body.innerHTML='<div class="tool-modal-domain">'+esc(t.category)+'</div><div class="tool-formula"><b>FORMULA / METHOD</b><code>'+esc(d[0])+'</code></div><div class="tool-inputs">'+d[1].map((x,i)=>'<label>'+esc(x)+'<input id="megaInput'+i+'" type="'+(i===0&&/text|value|json|hex|ipv4|character|comma/i.test(x)?'text':'number')+'" step="any" placeholder="'+esc(x)+'"></label>').join("")+'</div><div class="hb-mini-actions"><button id="megaCalculate" class="os-btn primary" type="button">CALCULATE</button><button id="megaClear" class="os-btn" type="button">CLEAR</button></div><div id="megaResult" class="hb-result">Enter variables. Results appear here.</div><div class="tool-source-note">Runs locally in your browser. No input is sent to GitHub or the source repository.</div>';modal.classList.add("open");modal.setAttribute("aria-hidden","false");const run=()=>{const v=d[1].map((_,i)=>{const e=$("megaInput"+i);if(!e)return null;if(e.type==="text")return e.value.trim()||null;const n=parseFloat(e.value);return Number.isFinite(n)?n:null});try{$("megaResult").textContent=d[2](v)}catch(e){$("megaResult").textContent="Check the input values."}};$("megaCalculate").onclick=run;$("megaClear").onclick=()=>{d[1].forEach((_,i)=>{const e=$("megaInput"+i);if(e)e.value=""});$("megaResult").textContent="Enter variables. Results appear here."};body.querySelectorAll("input").forEach(e=>e.addEventListener("input",run))};
window.HBMegaToolClose=function(){const m=$("resourceToolModal");if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true")}};

window.HBUpgradeMegaTools=function(list){
 window.__HBMegaTools=list||[];
 const grid=$("megaToolGrid");if(!grid)return;
 const draw=()=>{const q=($("megaToolSearch")?.value||"").toLowerCase().trim(),f=$("megaToolCategory")?.value||"all";const rows=window.__HBMegaTools.filter(x=>(f==="all"||x.category===f)&&(!q||x.name.toLowerCase().includes(q)||x.category.toLowerCase().includes(q)));grid.innerHTML=rows.map(x=>'<article class="hb-card mega-tool-card"><div class="hb-card-top"><span>'+esc(String(x.id).padStart(4,"0"))+" · "+esc(x.category)+'</span><span>● LIVE</span></div><h3>'+esc(x.name)+'</h3><p>Use this tool in the browser. View the formula or method, enter variables, and get the result.</p><button class="os-btn mega-open" type="button" data-id="'+x.id+'">OPEN TOOL →</button></article>').join("");grid.querySelectorAll(".mega-open").forEach(b=>b.onclick=()=>window.HBMegaToolOpen(b.dataset.id));if($("megaToolCount"))$("megaToolCount").textContent=rows.length.toLocaleString()+" tools indexed"};const cats=[...new Set(window.__HBMegaTools.map(x=>x.category))].sort();if($("megaToolCategory"))$("megaToolCategory").innerHTML='<option value="all">ALL CATEGORIES</option>'+cats.map(x=>'<option>'+esc(x)+'</option>').join("");$("megaToolSearch")?.addEventListener("input",draw);$("megaToolCategory")?.addEventListener("change",draw);draw();
};

document.addEventListener("DOMContentLoaded",()=>{$("resourceToolClose")?.addEventListener("click",window.HBMegaToolClose);$("resourceToolModal")?.addEventListener("click",e=>{if(e.target.id==="resourceToolModal")window.HBMegaToolClose()})});
})();