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

function normalizeToolName(name){return String(name||"").replace(/[’']/g,"'").replace(/\s+(Calculator|Converter|Quick Check|Planner|Estimator|Helper|Reference|Analyzer|Checker|Workbench|Simulator|Sizing Tool|Lookup|Practice Tool|Study Card|Formula Tool)\s+\d+$/i,"").trim()}
function permSymbol(n){return[(n&4)?"r":"-",(n&2)?"w":"-",(n&1)?"x":"-"].join("")}
function umaskResult(mask,base){const m=String(Math.trunc(mask)).padStart(3,"0"),b=String(base).padStart(3,"0");return[0,1,2].map(i=>Math.max(0,Number(b[i])-Number(m[i]))).join("")}
function prefixMask(p){const m=p===0?0:(0xffffffff<<(32-p))>>>0;return[(m>>>24)&255,(m>>>16)&255,(m>>>8)&255,m&255].join(".")}
function prefixWildcard(p){const m=p===0?0:(0xffffffff<<(32-p))>>>0,w=(~m)>>>0;return[(w>>>24)&255,(w>>>16)&255,(w>>>8)&255,w&255].join(".")}
function cidrParts(ip,p){if(!/^\d+\.\d+\.\d+\.\d+$/.test(ip)||!Number.isInteger(p)||p<0||p>32)return{};const o=ip.split(".").map(Number);if(o.some(x=>x>255))return{};const n=o.reduce((x,v)=>(x*256+v)>>>0,0),mask=p===0?0:(0xffffffff<<(32-p))>>>0,net=n&mask,broad=(net|(~mask))>>>0,fmt=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join(".");return{network:fmt(net),broadcast:fmt(broad)}}
function parseNums(id){return($(id)?.value||"").split(",").map(Number).filter(Number.isFinite)}
function metricArrays(kind){const a=parseNums("megaInput0"),b=parseNums("megaInput1");if(!a.length||a.length!==b.length)return"Enter equal-length numeric arrays.";let x;if(kind==="mae")x=a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0)/a.length;else if(kind==="mse"||kind==="rmse")x=a.reduce((s,v,i)=>s+(v-b[i])**2,0)/a.length;else x=a.reduce((s,v,i)=>s+(v===0?0:Math.abs(v-b[i])/Math.abs(v)),0)/a.length*100;return kind==="rmse"?"RMSE = "+Math.sqrt(x).toFixed(6):kind==="mse"?"MSE = "+x.toFixed(6):kind==="mae"?"MAE = "+x.toFixed(6):"MAPE = "+x.toFixed(4)+" %"}
function correlationResult(){const x=parseNums("megaInput0"),y=parseNums("megaInput1");if(!x.length||x.length!==y.length)return"Enter equal-length X and Y arrays.";const mx=x.reduce((a,b)=>a+b,0)/x.length,my=y.reduce((a,b)=>a+b,0)/y.length,num=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0),dx=x.reduce((s,v)=>s+(v-mx)**2,0),dy=y.reduce((s,v)=>s+(v-my)**2,0);return dx&&dy?"r = "+(num/Math.sqrt(dx*dy)).toFixed(6):"Correlation undefined for constant data."}
function factorial(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function comb(n,r){let z=1;for(let i=1;i<=r;i++)z=z*(n-r+i)/i;return Math.round(z)}
function perm(n,r){let z=1;for(let i=0;i<r;i++)z*=n-i;return z}
function statFormula(k){return k==="mean"?"μ = Σx/n":k==="median"?"middle value after sorting":k==="mode"?"most frequent value":k==="range"?"range = max − min":k==="variance"?"σ² = Σ(x−μ)²/n":k==="std"?"σ = √variance":"CV = σ/|μ| × 100"}

const EXTRA_DEFINITIONS={
"Electrical Work":["W = P × t",["Power P (W)","Time t (s)"],v=>v[0]!=null&&v[1]!=null?"W = "+(v[0]*v[1]).toFixed(6)+" J":"Enter P and t."],
"Electrical Power":["P = W / t",["Work W (J)","Time t (s)"],v=>v[0]!=null&&v[1]>0?"P = "+(v[0]/v[1]).toFixed(6)+" W":"Enter W and t."],
"Reactance":["XL = 2πfL; XC = 1/(2πfC)",["Frequency f (Hz)","Inductance L (H)","Capacitance C (F)"],v=>v[0]>0&&v[1]!=null?"XL = "+(2*Math.PI*v[0]*v[1]).toFixed(6)+" Ω":v[0]>0&&v[2]>0?"XC = "+(1/(2*Math.PI*v[0]*v[2])).toFixed(6)+" Ω":"Enter f + L or f + C."],
"LED Power":["P = Vf × I",["Forward voltage Vf (V)","Current I (A)"],v=>v[0]!=null&&v[1]!=null?"P = "+(v[0]*v[1]).toFixed(6)+" W":"Enter Vf and I."],
"Diode Power":["P = Vf × I",["Forward voltage Vf (V)","Current I (A)"],v=>v[0]!=null&&v[1]!=null?"P = "+(v[0]*v[1]).toFixed(6)+" W":"Enter Vf and I."],
"Zener Resistor":["R = (Vs − Vz) / Iz",["Supply Vs (V)","Zener voltage Vz (V)","Zener current Iz (A)"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"R = "+((v[0]-v[1])/v[2]).toFixed(3)+" Ω":"Enter Vs, Vz and Iz."],
"Battery Energy":["E = V × Ah",["Battery voltage V (V)","Capacity (Ah)"],v=>v[0]!=null&&v[1]>=0?"E = "+(v[0]*v[1]).toFixed(4)+" Wh":"Enter V and Ah."],
"Battery Capacity":["Ah = I × t",["Load current I (A)","Runtime t (h)"],v=>v[0]!=null&&v[1]!=null?"Capacity = "+(v[0]*v[1]).toFixed(4)+" Ah":"Enter I and t."],
"Coulomb Charge":["Q = I × t",["Current I (A)","Time t (s)"],v=>v[0]!=null&&v[1]!=null?"Q = "+(v[0]*v[1]).toFixed(4)+" C":"Enter I and t."],
"Duty Cycle":["D = ton / T × 100",["On time ton (s)","Period T (s)"],v=>v[0]!=null&&v[1]>0?"Duty cycle = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter ton and T."],
"PWM Average Voltage":["Vavg = D × Vs",["Duty cycle D (0–1)","Supply voltage Vs (V)"],v=>v[0]!=null&&v[1]!=null?"Vavg = "+(v[0]*v[1]).toFixed(4)+" V":"Enter D and Vs."],
"ADC Resolution":["Resolution = Vref / (2^N − 1)",["Reference voltage Vref (V)","ADC bits N"],v=>v[0]!=null&&Number.isInteger(v[1])&&v[1]>0?"Resolution = "+(v[0]/(2**v[1]-1)).toFixed(8)+" V/LSB":"Enter Vref and bits."],
"Conductor Resistance":["R = ρL/A",["Resistivity ρ (Ω·m)","Length L (m)","Area A (m²)"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"R = "+(v[0]*v[1]/v[2]).toFixed(8)+" Ω":"Enter ρ, L and A."],
"Mechanical Power":["P = τω; ω = 2πn/60",["Torque τ (N·m)","Speed n (RPM)"],v=>v[0]!=null&&v[1]>0?"P = "+(v[0]*2*Math.PI*v[1]/60).toFixed(4)+" W":"Enter torque and RPM."],
"Motor Speed":["n = 60P/(2πτ)",["Power P (W)","Torque τ (N·m)"],v=>v[0]!=null&&v[1]>0?"n = "+(60*v[0]/(2*Math.PI*v[1])).toFixed(4)+" RPM":"Enter P and torque."],
"Gear Ratio":["GR = Nin / Nout",["Input speed (RPM)","Output speed (RPM)"],v=>v[0]!=null&&v[1]>0?"Gear ratio = "+(v[0]/v[1]).toFixed(4)+":1":"Enter input and output speed."],
"Generator Frequency":["f = PN/120",["Poles P","Speed N (RPM)"],v=>v[0]>0&&v[1]>=0?"f = "+(v[0]*v[1]/120).toFixed(4)+" Hz":"Enter poles and RPM."],
"Relay Coil Current":["I = V/R",["Coil voltage V (V)","Coil resistance R (Ω)"],v=>v[0]!=null&&v[1]>0?"I = "+(v[0]/v[1]).toFixed(6)+" A":"Enter V and R."],
"Relay Power":["P = V²/R",["Coil voltage V (V)","Coil resistance R (Ω)"],v=>v[0]!=null&&v[1]>0?"P = "+(v[0]**2/v[1]).toFixed(6)+" W":"Enter V and R."],
"Solar Panel Power":["P = G × A × η",["Irradiance G (W/m²)","Area A (m²)","Efficiency η (0–1)"],v=>v.every(x=>x!=null)?"P = "+(v[0]*v[1]*v[2]).toFixed(4)+" W":"Enter G, A and η."],
"Series Capacitor":["1/Ct = 1/C1 + 1/C2",["C1 (F)","C2 (F)"],v=>v[0]>0&&v[1]>0?"Ct = "+(1/(1/v[0]+1/v[1])).toFixed(9)+" F":"Enter C1 and C2."],
"Parallel Capacitor":["Ct = C1 + C2",["C1 (F)","C2 (F)"],v=>v[0]!=null&&v[1]!=null?"Ct = "+(v[0]+v[1]).toFixed(9)+" F":"Enter C1 and C2."],
"Series Inductor":["Lt = L1 + L2",["L1 (H)","L2 (H)"],v=>v[0]!=null&&v[1]!=null?"Lt = "+(v[0]+v[1]).toFixed(9)+" H":"Enter L1 and L2."],
"Parallel Inductor":["1/Lt = 1/L1 + 1/L2",["L1 (H)","L2 (H)"],v=>v[0]>0&&v[1]>0?"Lt = "+(1/(1/v[0]+1/v[1])).toFixed(9)+" H":"Enter L1 and L2."],
"RC Filter Cutoff":["fc = 1/(2πRC)",["R (Ω)","C (F)"],v=>v[0]>0&&v[1]>0?"fc = "+(1/(2*Math.PI*v[0]*v[1])).toFixed(6)+" Hz":"Enter R and C."],
"RL Filter Cutoff":["fc = R/(2πL)",["R (Ω)","L (H)"],v=>v[0]>0&&v[1]>0?"fc = "+(v[0]/(2*Math.PI*v[1])).toFixed(6)+" Hz":"Enter R and L."],
"Non-Inverting Gain":["Av = 1 + Rf/Rg",["Feedback Rf (Ω)","Ground Rg (Ω)"],v=>v[0]!=null&&v[1]>0?"Av = "+(1+v[0]/v[1]).toFixed(6):"Enter Rf and Rg."],
"Inverting Gain":["Av = −Rf/Rin",["Feedback Rf (Ω)","Input Rin (Ω)"],v=>v[0]!=null&&v[1]>0?"Av = "+(-v[0]/v[1]).toFixed(6):"Enter Rf and Rin."],
"IPv4 Subnet Mask":["mask = 32-bit prefix mask",["Prefix 0–32"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=32?"Mask = "+prefixMask(v[0]):"Enter prefix 0–32."],
"IPv4 Wildcard Mask":["wildcard = 255.255.255.255 − subnet mask",["Prefix 0–32"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=32?"Wildcard = "+prefixWildcard(v[0]):"Enter prefix 0–32."],
"IPv4 Network Address":["network = IP AND subnet mask",["IPv4 address","Prefix 0–32"],v=>cidrParts($( "megaInput0")?.value.trim(),parseInt($( "megaInput1")?.value)).network||"Enter IPv4 and prefix."],
"IPv4 Broadcast":["broadcast = network OR inverted mask",["IPv4 address","Prefix 0–32"],v=>cidrParts($( "megaInput0")?.value.trim(),parseInt($( "megaInput1")?.value)).broadcast||"Enter IPv4 and prefix."],
"Transfer Time":["t = data size / throughput",["Data size (Mb)","Throughput (Mb/s)"],v=>v[0]>=0&&v[1]>0?"Time = "+(v[0]/v[1]).toFixed(6)+" s":"Enter size and throughput."],
"Bandwidth Delay Product":["BDP = bandwidth × RTT",["Bandwidth (bit/s)","RTT (s)"],v=>v[0]>=0&&v[1]>=0?"BDP = "+(v[0]*v[1]).toFixed(3)+" bits":"Enter bandwidth and RTT."],
"Uptime Percentage":["availability = uptime/(uptime+downtime) × 100",["Uptime (h)","Downtime (h)"],v=>v[0]>=0&&v[1]>=0&&v[0]+v[1]>0?"Availability = "+(v[0]/(v[0]+v[1])*100).toFixed(4)+" %":"Enter uptime and downtime."],
"ASCII Converter":["ASCII code ↔ character; valid range 0–127",["ASCII code 0–127"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=127?"Character = "+JSON.stringify(String.fromCharCode(v[0])):"Enter integer 0–127."],
"Unicode Code Point":["U+code point ↔ character",["Code point"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=0x10ffff?"Character = "+String.fromCodePoint(v[0])+" · U+"+v[0].toString(16).toUpperCase().padStart(4,"0"):"Enter valid code point."],
"String Length":["length = number of characters",["Text"],()=> "Characters = "+($( "megaInput0")?.value||"").length],
"Line Count":["count newline-separated lines",["Text"],()=> "Lines = "+(($( "megaInput0")?.value||"")?$( "megaInput0").value.split(/\r?\n/).length:0)],
"Word Count":["count whitespace-separated tokens",["Text"],()=>{const s=$( "megaInput0")?.value.trim()||"";return"Words = "+(s?s.split(/\s+/).length:0)}],
"UTF-8 Byte Count":["bytes = TextEncoder(text).length",["Text"],()=> "UTF-8 bytes = "+new TextEncoder().encode($( "megaInput0")?.value||"").length],
"URL Encoder":["encodeURIComponent(text)",["Text"],()=>encodeURIComponent($( "megaInput0")?.value||"")],
"URL Decoder":["decodeURIComponent(text)",["Encoded text"],()=>{try{return decodeURIComponent($( "megaInput0")?.value||"")}catch{return"Invalid URL encoding."}}],
"Base64 Encoder":["UTF-8 bytes → Base64",["Text"],()=>btoa(unescape(encodeURIComponent($( "megaInput0")?.value||"")))],
"Base64 Decoder":["Base64 → UTF-8 text",["Base64"],()=>{try{return decodeURIComponent(escape(atob($( "megaInput0")?.value||"")))}catch{return"Invalid Base64."}}],
"Hex Encoder":["UTF-8 bytes → hexadecimal",["Text"],()=>[...new TextEncoder().encode($( "megaInput0")?.value||"")].map(x=>x.toString(16).padStart(2,"0")).join("")],
"Hex Decoder":["hexadecimal → UTF-8 bytes",["Hex"],()=>{try{const h=($( "megaInput0")?.value||"").replace(/\s/g,"");if(!/^(?:[0-9a-f]{2})+$/i.test(h))return"Enter even-length hexadecimal.";return new TextDecoder().decode(Uint8Array.from(h.match(/../g),x=>parseInt(x,16)))}catch{return"Invalid hex."}}],
"Unix Timestamp":["Unix timestamp = seconds since 1970-01-01T00:00:00Z",["Timestamp seconds"],v=>v[0]!=null?"UTC = "+new Date(v[0]*1000).toISOString():"Enter timestamp."],
"File Size":["KiB = bytes/1024; MiB = bytes/1024²; GiB = bytes/1024³",["Bytes"],v=>v[0]>=0?v[0].toLocaleString()+" B = "+(v[0]/1024).toFixed(3)+" KiB = "+(v[0]/1048576).toFixed(3)+" MiB = "+(v[0]/1073741824).toFixed(6)+" GiB":"Enter bytes."],
"Disk Space":["used% = used/total × 100",["Used space (GB)","Total space (GB)"],v=>v[0]>=0&&v[1]>0?"Used = "+(v[0]/v[1]*100).toFixed(3)+" % · Free = "+(v[1]-v[0]).toFixed(3)+" GB":"Enter used and total."],
"Inode Usage":["used% = used inodes/total inodes × 100",["Used inodes","Total inodes"],v=>v[0]>=0&&v[1]>0?"Usage = "+(v[0]/v[1]*100).toFixed(3)+" %":"Enter used and total."],
"CPU Utilization":["CPU% = busy time/total time × 100",["Busy time","Total time"],v=>v[0]>=0&&v[1]>0?"CPU utilization = "+(v[0]/v[1]*100).toFixed(3)+" %":"Enter busy and total."],
"Memory Utilization":["used% = used memory/total memory × 100",["Used memory (GB)","Total memory (GB)"],v=>v[0]>=0&&v[1]>0?"Memory utilization = "+(v[0]/v[1]*100).toFixed(3)+" %":"Enter used and total."],
"Swap Usage":["used% = used swap/total swap × 100",["Used swap (GB)","Total swap (GB)"],v=>v[0]>=0&&v[1]>0?"Swap usage = "+(v[0]/v[1]*100).toFixed(3)+" %":"Enter used and total."],
"Load Average":["load per core = load average/CPU cores",["Load average","CPU cores"],v=>v[0]!=null&&v[1]>0?"Load/core = "+(v[0]/v[1]).toFixed(3):"Enter load and CPU cores."],
"Open File Count":["usage% = open descriptors/limit × 100",["Open descriptors","Descriptor limit"],v=>v[0]>=0&&v[1]>0?"Usage = "+(v[0]/v[1]*100).toFixed(3)+" %":"Enter count and limit."],
"File Descriptor Limit":["usage% = used/maximum × 100; remaining = maximum − used",["Used descriptors","Maximum descriptors"],v=>v[0]>=0&&v[1]>0?"Usage = "+(v[0]/v[1]*100).toFixed(3)+" % · Remaining = "+Math.max(0,v[1]-v[0]):"Enter used and maximum."],
"chmod Calculator":["permission = r(4) + w(2) + x(1)",["Owner 0–7","Group 0–7","Other 0–7"],v=>v.every(x=>Number.isInteger(x)&&x>=0&&x<=7)?"chmod "+v.join("")+" · "+permSymbol(v[0])+permSymbol(v[1])+permSymbol(v[2]):"Enter three digits 0–7."],
"Unix Permissions":["r=4, w=2, x=1; mode = owner/group/other",["Owner 0–7","Group 0–7","Other 0–7"],v=>v.every(x=>Number.isInteger(x)&&x>=0&&x<=7)?"chmod "+v.join("")+" · "+permSymbol(v[0])+permSymbol(v[1])+permSymbol(v[2]):"Enter three digits."],
"File Permission Calculator":["permission bits: r=4, w=2, x=1",["Owner 0–7","Group 0–7","Other 0–7"],v=>v.every(x=>Number.isInteger(x)&&x>=0&&x<=7)?"chmod "+v.join("")+" · "+permSymbol(v[0])+permSymbol(v[1])+permSymbol(v[2]):"Enter three digits."],
"umask Calculator":["created mode = base mode with umask bits removed; files 666, directories 777",["umask octal"],v=>Number.isInteger(v[0])?"Files = "+umaskResult(v[0],666)+" · Directories = "+umaskResult(v[0],777):"Enter umask."],
"umask Helper":["created mode = base mode with umask bits removed",["umask octal"],v=>Number.isInteger(v[0])?"Files = "+umaskResult(v[0],666)+" · Directories = "+umaskResult(v[0],777):"Enter umask."],
"chown Helper":["syntax = chown [options] user[:group] path",["User","Group"],()=> "Command: chown "+($( "megaInput0")?.value.trim()||"<user>")+($( "megaInput1")?.value.trim()?":"+$( "megaInput1").value.trim():"")+" <path>"],
"Cron Expression":["five fields = minute hour day-of-month month day-of-week",["Cron expression"],()=>{const x=$( "megaInput0")?.value.trim()||"",p=x.split(/\s+/);return p.length===5?"Valid 5-field cron: minute="+p[0]+" hour="+p[1]+" day="+p[2]+" month="+p[3]+" weekday="+p[4]:"Enter 5 cron fields."}],
"Systemd Timer":["OnCalendar / OnUnitActiveSec schedules a systemd service",["Schedule expression"],()=> "Systemd schedule = "+($( "megaInput0")?.value||"<expression>")],
"Markdown Table":["header + separator + rows",["Columns comma separated"],()=>{const c=($( "megaInput0")?.value||"").split(",").map(x=>x.trim()).filter(Boolean);return c.length?"| "+c.join(" | ")+" |\n| "+c.map(()=> "---").join(" | ")+" |":"Enter columns."}],
"Markdown Link":["[label](URL)",["Label","URL"],()=> "["+($( "megaInput0")?.value||"label")+"]("+($( "megaInput1")?.value||"https://example.com")+")"],
"Color Hex Parser":["#RRGGBB → RGB channels",["Hex color"],()=>{const x=($( "megaInput0")?.value||"").trim().replace("#","");return/^[0-9a-f]{6}$/i.test(x)?"RGB = "+parseInt(x.slice(0,2),16)+", "+parseInt(x.slice(2,4),16)+", "+parseInt(x.slice(4,6),16):"Enter #RRGGBB."}],
"RGB to Hex":["hex = RRGGBB",["R 0–255","G 0–255","B 0–255"],v=>v.every(x=>Number.isInteger(x)&&x>=0&&x<=255)?"#"+v.map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase():"Enter RGB 0–255."],
"Hex to RGB":["#RRGGBB → RGB",["Hex color"],()=>{const x=($( "megaInput0")?.value||"").replace("#","");return/^[0-9a-f]{6}$/i.test(x)?"RGB = "+parseInt(x.slice(0,2),16)+", "+parseInt(x.slice(2,4),16)+", "+parseInt(x.slice(4,6),16):"Enter #RRGGBB."],
"Null Rate":["null rate = null values/total rows × 100",["Null values","Total rows"],v=>v[0]>=0&&v[1]>0?"Null rate = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter null and total."],
"Duplicate Rate":["duplicate rate = duplicate rows/total rows × 100",["Duplicate rows","Total rows"],v=>v[0]>=0&&v[1]>0?"Duplicate rate = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter duplicate and total."],
"Unique Rate":["unique rate = unique values/total rows × 100",["Unique values","Total rows"],v=>v[0]>=0&&v[1]>0?"Unique rate = "+(v[0]/v[1]*100).toFixed(4)+" %":"Enter unique and total."],
"Weighted Average":["μw = Σ(wx) / Σw",["Values x (comma separated)","Weights w (comma separated)"],()=>{const a=parseNums("megaInput0"),w=parseNums("megaInput1"),sw=w.reduce((s,x)=>s+x,0);return a.length===w.length&&a.length&&sw?"Weighted mean = "+(a.reduce((s,x,i)=>s+x*w[i],0)/sw).toFixed(6):"Enter matching values and weights."}],
"Min Max Scaling":["x′ = (x − min)/(max − min)",["x","Minimum","Maximum"],v=>v[0]!=null&&v[2]>v[1]?"Scaled = "+((v[0]-v[1])/(v[2]-v[1])).toFixed(6):"Enter x, min and max."],
"MAE":["MAE = Σ|yi − ŷi| / n",["Actual values","Predicted values"],()=>metricArrays("mae")],
"MSE":["MSE = Σ(yi − ŷi)² / n",["Actual values","Predicted values"],()=>metricArrays("mse")],
"RMSE":["RMSE = √MSE",["Actual values","Predicted values"],()=>metricArrays("rmse")],
"MAPE":["MAPE = mean(|actual−predicted|/|actual|) × 100",["Actual values","Predicted values"],()=>metricArrays("mape")],
"Correlation":["r = Σ[(x−x̄)(y−ȳ)] / √[Σ(x−x̄)²Σ(y−ȳ)²]",["X values (comma separated)","Y values (comma separated)"],()=>correlationResult()],
"R Squared":["R² = 1 − SSE/SST",["SSE","SST"],v=>v[0]>=0&&v[1]>0?"R² = "+(1-v[0]/v[1]).toFixed(6):"Enter SSE and SST."],
"Probability":["P(A) = favorable outcomes/total outcomes",["Favorable outcomes","Total outcomes"],v=>v[0]>=0&&v[1]>0?"P(A) = "+(v[0]/v[1]).toFixed(6)+" · "+(v[0]/v[1]*100).toFixed(3)+" %":"Enter favorable and total."],
"Factorial":["n! = n × (n−1) × … × 1",["n"],v=>Number.isInteger(v[0])&&v[0]>=0&&v[0]<=170?"n! = "+factorial(v[0]):"Enter integer n 0–170."],
"Combinations":["C(n,r) = n!/[r!(n−r)!]",["n","r"],v=>Number.isInteger(v[0])&&Number.isInteger(v[1])&&v[0]>=v[1]&&v[1]>=0?"C(n,r) = "+comb(v[0],v[1]).toLocaleString():"Enter n ≥ r ≥ 0."],
"Permutations":["P(n,r) = n!/(n−r)!",["n","r"],v=>Number.isInteger(v[0])&&Number.isInteger(v[1])&&v[0]>=v[1]&&v[1]>=0?"P(n,r) = "+perm(v[0],v[1]).toLocaleString():"Enter n ≥ r ≥ 0."]
};
function definitionFor(t){
 const exact=DEFINITIONS[t.name]||DEFINITIONS[t.name.replace(/’/g,"'")];if(exact)return exact;
 const key=normalizeToolName(t.name);if(EXTRA_DEFINITIONS[key])return EXTRA_DEFINITIONS[key];
 const k=key.toLowerCase();
 if(/mean|median|mode|variance|standard deviation|coefficient of variation/.test(k)){const m=k==="mean"?"mean":k==="median"?"median":k==="mode"?"mode":k==="variance"?"variance":k.includes("standard")?"std":"cv";return[statFormula(m),["Values (comma separated)"],()=>stat(m)]}
 if(/converter| to /.test(k))return["Method: named source unit/representation → named destination unit/representation",["Value"],v=>v[0]!=null?"Input = "+v[0]:"Enter a value."];
 if(/notes|checklist|map|guide|reference|lookup|helper|planner|builder|formatter|tester|table/.test(k))return["Method: rule-based technical reference or validation; no single universal equation",["Input"],()=> "Reference method: "+key+". This tool uses domain rules rather than generic arithmetic."];
 return["Method: domain-specific technical procedure; no universal equation",["Input"],()=> "No single universal equation applies to "+key+". Use the stated technical method for this tool."];
}

window.HBMegaToolOpen=function(id){const t=window.__HBMegaTools?.find(x=>String(x.id)===String(id));if(!t)return;const modal=$("resourceToolModal"),body=$("resourceToolBody");if(!modal||!body)return;const d=definitionFor(t);$("resourceToolTitle").textContent=t.name;body.innerHTML='<div class="tool-modal-domain">'+esc(t.category)+'</div><div class="tool-formula"><b>FORMULA / METHOD</b><code>'+esc(d[0])+'</code></div><div class="tool-inputs">'+d[1].map((x,i)=>'<label>'+esc(x)+'<input id="megaInput'+i+'" type="'+(/text|json|url|regex|cron|user|group|expression|columns|color|hex|ipv4|character|comma|html|markdown|yaml|xml/i.test(x)?'text':'number')+'" step="any" placeholder="'+esc(x)+'"></label>').join("")+'</div><div class="hb-mini-actions"><button id="megaCalculate" class="os-btn primary" type="button">CALCULATE</button><button id="megaClear" class="os-btn" type="button">CLEAR</button></div><div id="megaResult" class="hb-result">Enter variables. Results appear here.</div><div class="tool-source-note">Runs locally in your browser. No input is sent to GitHub or the source repository.</div>';modal.classList.add("open");modal.setAttribute("aria-hidden","false");const run=()=>{const v=d[1].map((_,i)=>{const e=$("megaInput"+i);if(!e)return null;if(e.type==="text")return e.value.trim()||null;const n=parseFloat(e.value);return Number.isFinite(n)?n:null});try{$("megaResult").textContent=d[2](v)}catch(e){$("megaResult").textContent="Check the input values."}};$("megaCalculate").onclick=run;$("megaClear").onclick=()=>{d[1].forEach((_,i)=>{const e=$("megaInput"+i);if(e)e.value=""});$("megaResult").textContent="Enter variables. Results appear here."};body.querySelectorAll("input").forEach(e=>e.addEventListener("input",run))};
window.HBMegaToolClose=function(){const m=$("resourceToolModal");if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true")}};

window.HBUpgradeMegaTools=function(list){
 window.__HBMegaTools=list||[];
 const grid=$("megaToolGrid");if(!grid)return;
 const draw=()=>{const q=($("megaToolSearch")?.value||"").toLowerCase().trim(),f=$("megaToolCategory")?.value||"all";const rows=window.__HBMegaTools.filter(x=>(f==="all"||x.category===f)&&(!q||x.name.toLowerCase().includes(q)||x.category.toLowerCase().includes(q)));grid.innerHTML=rows.map(x=>'<article class="hb-card mega-tool-card"><div class="hb-card-top"><span>'+esc(String(x.id).padStart(4,"0"))+" · "+esc(x.category)+'</span><span>● LIVE</span></div><h3>'+esc(x.name)+'</h3><p>Use this tool in the browser. View the formula or method, enter variables, and get the result.</p><button class="os-btn mega-open" type="button" data-id="'+x.id+'">OPEN TOOL →</button></article>').join("");grid.querySelectorAll(".mega-open").forEach(b=>b.onclick=()=>window.HBMegaToolOpen(b.dataset.id));if($("megaToolCount"))$("megaToolCount").textContent=rows.length.toLocaleString()+" tools indexed"};const cats=[...new Set(window.__HBMegaTools.map(x=>x.category))].sort();if($("megaToolCategory"))$("megaToolCategory").innerHTML='<option value="all">ALL CATEGORIES</option>'+cats.map(x=>'<option>'+esc(x)+'</option>').join("");$("megaToolSearch")?.addEventListener("input",draw);$("megaToolCategory")?.addEventListener("change",draw);draw();
};

document.addEventListener("DOMContentLoaded",()=>{$("resourceToolClose")?.addEventListener("click",window.HBMegaToolClose);$("resourceToolModal")?.addEventListener("click",e=>{if(e.target.id==="resourceToolModal")window.HBMegaToolClose()})});
})();