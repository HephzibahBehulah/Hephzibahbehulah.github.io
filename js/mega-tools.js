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
"Hex to RGB":["#RRGGBB → RGB",["Hex color"],()=>{const x=($( "megaInput0")?.value||"").replace("#","");return/^[0-9a-f]{6}$/i.test(x)?"RGB = "+parseInt(x.slice(0,2),16)+", "+parseInt(x.slice(2,4),16)+", "+parseInt(x.slice(4,6),16):"Enter #RRGGBB."}],
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
const TOOL_METHODS = {
 "Pull-Down Resistor": ["Rpd(max) ≈ VIL(max) / Ileak(max); Iclosed ≈ VCC / Rpd",["VCC (V)","VIL(max) (V)","Ileak(max) (µA)","Chosen Rpd (Ω)"],v=>{const [vcc,vil,ileak,r]=v;if(vcc>0&&vil>=0&&ileak>0){const rmax=vil/(ileak/1e6);if(r>0)return "Rmax ≈ "+rmax.toFixed(2)+" Ω; Iclosed ≈ "+(vcc/r).toFixed(6)+" A; "+(r<=rmax?"chosen resistor is within the leakage-based limit":"chosen resistor exceeds the leakage-based limit");return "Rmax ≈ "+rmax.toFixed(2)+" Ω. Choose a standard value below this limit and check the datasheet.";}return "Enter VCC, VIL(max), leakage current and optionally a chosen resistor."; }],
 "Pull-Up Resistor": ["Rpu(max) ≈ (VCC − VIH(min)) / Ileak(max); Iclosed ≈ VCC / Rpu","Use the input datasheet's minimum HIGH-level voltage VIH(min) and worst-case leakage current to estimate the maximum pull-up resistance. Then choose a standard value that balances logic margin, noise immunity, rise time and closed-state current."],

 "DHCP Pool": ["No universal equation","1. Define the subnet. 2. Reserve gateway, servers and fixed devices. 3. Choose the dynamic address range inside the subnet. 4. Configure lease time, gateway and DNS. 5. Test that a client receives an address in the intended range."],
 "DHCP Scope": ["Pool range = first usable address … last usable address","Choose a subnet, calculate its usable range, exclude reserved addresses, then define the remaining dynamic range."],
 "Subnet Mask": ["IPv4 mask = first prefix bits set to 1","Enter a CIDR prefix such as /24. The tool converts the prefix into dotted-decimal notation and identifies network/host bits."],
 "Network Address": ["Network = IP AND subnet mask","Enter an IPv4 address and CIDR prefix. Apply a bitwise AND between the address and mask."],
 "Broadcast Address": ["Broadcast = Network OR inverted mask","Enter IPv4 + prefix. Find the network address first, then set all host bits to 1."],
 "Host Count": ["Usable hosts = 2^hostBits − 2","Calculate host bits as 32 − prefix. Subtract network and broadcast addresses for ordinary IPv4 subnets."],
 "Star Delta Voltage": ["Vphase(star) = Vline/√3; Vline(delta) = Vphase","Enter line voltage. Use the star relationship for phase voltage or the delta relationship for phase voltage."],
 "Star Delta Current": ["Iline(star) = Iphase; Iline(delta) = √3 × Iphase","Determine the connection first, then apply the corresponding line/phase current relationship."],
 "Transformer VA": ["S = V × I","Multiply the rated winding voltage by its rated current to obtain apparent power in VA."],
 "Cable Loss": ["Ploss = I²R","Enter current and conductor resistance. For a complete cable circuit, include the resistance of the full current path."],
 "Fuse Current": ["I = P/V","For a simple resistive load, divide load power by supply voltage; select protection using the applicable installation standard and manufacturer data."],
 "Thermal Power": ["Pthermal = I²R or P = V²/R","Use the form that matches the available electrical values. The result is heat dissipation in watts."],
 "Temperature Coefficient": ["R(T) = R0[1 + α(T − T0)]","Enter reference resistance, temperature coefficient and temperature change. This linear model is an approximation over the stated operating range."],
 "Heat Sink Estimate": ["ΔT = P × Rθ; Tj = Ta + P × RθJA","Enter dissipated power and the relevant thermal resistance. Check the component and heatsink datasheets before selecting hardware."],
 "Cable Sizing": ["Iload = P/(V×PF) for single-phase; Iload = P/(√3×V×PF) for balanced three-phase","Determine load current, installation method, conductor material, ambient temperature, grouping, voltage-drop limit and protective device before selecting conductor size."],
 "Conductor Ampacity": ["Allowable current = base ampacity × applicable correction factors","Start from the conductor's rated ampacity and apply the correction/derating factors required by the applicable standard."],
 "Voltage Tolerance": ["Tolerance % = |actual − nominal|/nominal × 100","Enter nominal and measured voltage, then compare the percentage deviation with the permitted equipment or installation tolerance."],
 "Loop Impedance": ["Zs = Ze + (R1 + R2)","Use measured/declared external loop impedance plus the circuit protective and phase conductor impedances. Verify against the applicable disconnection requirement."],
 "Earth Fault Loop": ["If ≈ U0/Zs","Divide nominal line-to-earth voltage by earth fault loop impedance for a prospective fault-current estimate."],
 "Power Factor Correction": ["Qc = P(tanφ1 − tanφ2)","Enter real power and the present and target power factors. Use the angle relation to estimate required capacitive reactive power."],
 "Capacitor kVAR": ["Qc = 2πfCV²","For a capacitor bank, use the correct single/three-phase connection voltage and total capacitance."],
 "Generator Sizing": ["S(kVA) ≈ P(kW)/PF","Estimate required apparent power from real load and power factor, then account for starting/inrush loads and required design margin."],
 "UPS Sizing": ["S(kVA) ≥ required load VA/1000","Add the connected load, consider power factor, battery runtime, surge/inrush and manufacturer derating."],
 "Battery Bank": ["Series voltage = Nseries×V; parallel capacity = Nparallel×Ah","Choose series count for required voltage and parallel count for required capacity/current. Respect battery chemistry, BMS and manufacturer limits."],
 "PLC Scan Time": ["Tscan = Tinput + Tlogic + Toutput + Tcommunication + overhead","Measure or estimate each execution component. Actual values depend on PLC model, program size and communication load."],
 "4-20mA Scaling": ["PV = PVmin + (I−4)/16 × (PVmax−PVmin)","Enter current and engineering range. 4 mA represents the lower range and 20 mA the upper range."],
 "0-10V Scaling": ["PV = PVmin + V/10 × (PVmax−PVmin)","Map the measured 0–10 V signal linearly onto the engineering range."],
 "Linear Interpolation": ["y = y1 + (x−x1)(y2−y1)/(x2−x1)","Enter two known points and the new x value. The result assumes a linear relationship between the points."],
 "Mechanical Power": ["P = τω; ω = 2πn/60","Convert RPM to angular velocity, then multiply torque by angular velocity."],
 "Motor Speed": ["n = 60P/(2πτ)","Enter mechanical power and torque. This ideal relationship ignores losses unless power is explicitly output power."],
 "Gear Ratio": ["GR = Nin/Nout = Nout_speed/Nin_speed","Define which shaft is input and output before calculating the ratio."],
 "Generator Frequency": ["f = PN/120","Enter pole count P and rotational speed N in RPM."],
 "Conduit Fill": ["Fill % = conductor area total / usable conduit area × 100","Count conductors, use their actual cross-sectional areas and compare the total against the permitted fill percentage."],
 "Cable Tray Fill": ["Fill % = cable cross-sectional area total / usable tray area × 100","Add cable occupied area and compare it with the permitted tray fill and spacing requirements."],
 "Phase Balance": ["Imbalance % = deviation from average / average × 100","Measure all phase currents or voltages, calculate the average, then compare each phase's deviation."],
 "Motor Starting Current": ["Istart ≈ multiplier × FLA","Use the motor manufacturer's locked-rotor/starting-current data rather than assuming a universal multiplier."],
 "PLC I/O Count": ["Required I/O = field devices + spare capacity","Count every required digital/analog input and output separately, then add the planned spare percentage."],
 "Memory Address Space": ["Address space = 2^addressBits","Enter address width in bits. The result is the number of unique addressable locations."],
 "EEPROM Size": ["Memory bytes = number of addresses × bytes/address","Use the device's address width and data width from its datasheet."],
 "ADC Resolution": ["LSB ≈ Vref/(2^N−1)","Enter reference voltage and ADC bit depth. Smaller LSB means finer nominal voltage resolution."],
 "DAC Resolution": ["LSB ≈ Vref/(2^N−1)","Enter reference/full-scale voltage and bit depth."],
 "Quantization Error": ["|error| ≤ 0.5 LSB (ideal rounding ADC)","For an ideal uniformly quantized converter, the maximum rounding error is half an LSB."],
 "555 Frequency": ["Astable: f ≈ 1.44/[(RA+2RB)C]","Enter RA, RB and C for the standard 555 astable configuration. Real devices vary with component tolerances."],
 "555 Duty Cycle": ["D ≈ (RA+RB)/(RA+2RB) × 100%","Use the standard 555 astable formula and note that the basic circuit does not independently set a duty cycle below 50%."],
 "Bit Mask": ["result = value AND mask","Enter the value and mask in a common base. AND preserves only bits enabled by the mask."],
 "Bit Shift": ["Left shift: x<<n = x×2^n; right shift: x>>n ≈ floor(x/2^n)","Choose direction and shift count. Signed right shifts depend on the programming language."],
 "Parity Bit": ["Even parity: total number of 1 bits including parity is even","Count the set bits and choose the parity bit according to the selected even/odd rule."],
 "Memory Utilization": ["Used/total × 100%","Divide used memory by total memory and multiply by 100."],
 "CPU Utilization": ["CPU usage % = busy time / total measured time × 100","Use an operating-system measurement interval rather than a single instantaneous reading."],
 "Uptime Percentage": ["Uptime % = uptime/(uptime + downtime) × 100","Enter the same measurement period for both uptime and downtime."],
 "MAE": ["MAE = Σ|yi−ŷi|/n","Enter actual and predicted values with matching lengths."],
 "MSE": ["MSE = Σ(yi−ŷi)²/n","Square each prediction error, average the squared errors."],
 "RMSE": ["RMSE = √MSE","Calculate MSE first, then take its square root."],
 "MAPE": ["MAPE = 100/n × Σ|((yi−ŷi)/yi)|","Do not use ordinary MAPE where actual values are zero; use an appropriate alternative."],
 "Correlation": ["r = cov(X,Y)/(σXσY)","Use paired observations and check that both variables have non-zero standard deviation."],
 "R Squared": ["R² = 1 − SSE/SST","Compare residual sum of squares with total sum of squares."],
 "Bayes Rule": ["P(A|B) = P(B|A)P(A)/P(B)","Enter the prior, likelihood and evidence probability."],
 "Conditional Probability": ["P(A|B) = P(A∩B)/P(B)","The condition B must have non-zero probability."],
 "Expected Value": ["E[X] = ΣxP(x)","Multiply each possible value by its probability and sum."],
 "Geometric Mean": ["GM = (x1×x2×…×xn)^(1/n)","Use positive values for the ordinary real-valued geometric mean."],
 "Harmonic Mean": ["HM = n/Σ(1/xi)","Use non-zero values; this is useful for rates such as speeds under suitable conditions."],
 "Cpk": ["Cpk = min[(USL−μ)/(3σ),(μ−LSL)/(3σ)]","Enter upper/lower specification limits, process mean and standard deviation."],
 "Cp": ["Cp = (USL−LSL)/(6σ)","This measures potential capability assuming the process is centered."],
 "Six Sigma DPMO": ["DPMO = defects/(units×opportunities per unit) × 1,000,000","Define the number of defect opportunities consistently before calculating."],
 "Min Max Scaling": ["x' = (x−xmin)/(xmax−xmin)","Maps a value into 0–1 when the standard min-max transformation is used."],
 "Standardization": ["z = (x−μ)/σ","Subtract the mean and divide by standard deviation."],
 "IQR": ["IQR = Q3 − Q1","Sort the data, determine first and third quartiles using the selected quartile convention, then subtract."],
 "Outlier Fence": ["Lower = Q1−1.5IQR; Upper = Q3+1.5IQR","Values outside these fences are flagged by the common Tukey rule."],
 "Precision": ["Precision = TP/(TP+FP)","Of predicted positives, calculate the fraction that are actually positive."],
 "Recall": ["Recall = TP/(TP+FN)","Of actual positives, calculate the fraction correctly identified."],
 "F1 Score": ["F1 = 2PR/(P+R)","Use precision and recall on the same evaluation set."],
 "Accuracy": ["Accuracy = (TP+TN)/(TP+TN+FP+FN)","Use all four confusion-matrix counts."],
 "Conversion Rate": ["Conversion rate = conversions/eligible population × 100%","Define the denominator before calculating."],
 "Churn Rate": ["Churn rate = customers lost during period/customers at start of period × 100%","Keep the measurement window and population definition consistent."],
 "Retention Rate": ["Retention = retained customers / starting customers × 100%","State whether new customers are excluded from the denominator."],
 "Average Order Value": ["AOV = revenue/orders","Use the same period and order population for numerator and denominator."],
 "Revenue per User": ["RPU = revenue/users","Use a clearly defined active or paying user population."],
 "Break Even": ["Break-even units = fixed costs/(price−variable cost per unit)","Contribution margin per unit must be positive."],
 "ROAS": ["ROAS = attributed revenue/ad spend","Define attribution window and revenue consistently."],
 "Cost per Acquisition": ["CPA = acquisition cost/number of acquisitions","Use the same campaign and attribution window."],
 "Markdown Table": ["Method: header row + separator row + aligned data rows","Enter columns and rows; the tool formats them into Markdown table syntax."],
 "Markdown Link": ["[label](URL)","Enter link text and a valid URL."],
 "Regex Tester": ["Method: pattern matching with a regular expression","Enter pattern, flags and test text. The tool compiles the pattern and reports matches or syntax errors."],
 "Regex Escape": ["Method: escape regex metacharacters","Enter literal text; special regex characters are prefixed so they are treated literally."],
 "JSON Formatter": ["Method: JSON.parse → JSON.stringify(value, null, 2)","Paste valid JSON. The tool parses it and re-serializes it with indentation."],
 "JSON Minifier": ["Method: JSON.parse → JSON.stringify(value)","Paste valid JSON to validate and remove unnecessary whitespace."],
 "XML Formatter": ["Method: parse XML → serialize with indentation","Paste well-formed XML. Formatting does not repair invalid XML."],
 "Text Diff": ["Method: compare lines/tokens and report insertions, deletions and changes","Enter the two texts and inspect the changed regions."],
 "Character Frequency": ["frequency(c) = count of character c","Enter text; count occurrences for each character."],
 "Word Count": ["count = number of whitespace-delimited tokens","Paste text and count words using the tool's tokenization rule."],
 "Line Count": ["count = number of line breaks + 1 for non-empty text","Paste text; empty input returns zero."],
 "UTF-8 Byte Count": ["bytes = UTF-8 encoded length","Enter text; multi-byte Unicode characters can occupy more than one byte."],
 "URL Encoder": ["Method: encodeURIComponent(text)","Enter text to make it safe for use as a URL component."],
 "URL Decoder": ["Method: decodeURIComponent(text)","Paste an encoded URL component and decode percent escapes."],
 "Base64 Encoder": ["Method: binary/text → Base64 representation","Enter text; the tool encodes its byte representation."],
 "Base64 Decoder": ["Method: Base64 representation → bytes/text","Paste valid Base64 and decode it."],
 "Unix Timestamp": ["Unix time = seconds since 1970-01-01T00:00:00Z","Enter a date/time and convert using UTC."],
 "Cron Expression": ["Method: minute hour day-of-month month day-of-week","Enter a five-field cron expression and check each field against its schedule position."],
 "Systemd Timer": ["Method: OnCalendar / OnBootSec / OnUnitActiveSec scheduling rules","Enter the desired systemd timer directive and validate its intended schedule."],
 "chmod Calculator": ["Permission value = user + group + other; r=4,w=2,x=1","Add permission bits for each owner class, e.g. 7 = rwx."],
 "umask Calculator": ["effective permissions = requested permissions masked by umask","Enter requested mode and umask; subtract/clear the masked permission bits."],
 "chown Helper": ["Method: owner:group file","Enter the target owner, group and path; apply the command only where you have authorization."],
 "SQL Row Count": ["SELECT COUNT(*) FROM table;","Choose the table and count rows, optionally adding a WHERE clause for a subset."],
 "SQL Distinct Count": ["SELECT COUNT(DISTINCT column) FROM table;","Choose the column whose unique non-duplicate values you want to count."],
 "SQL Null Count": ["COUNT(*) − COUNT(column)","Count all rows and subtract rows where the selected column is non-NULL."],
 "SQL Duplicate Check": ["GROUP BY key HAVING COUNT(*) > 1","Choose the columns that define a duplicate and group by them."],
 "SQL Date Difference": ["Method: database-specific date difference function","Specify database engine because DATE_DIFF/DATEDIFF syntax differs between PostgreSQL, MySQL, SQL Server and others."],
 "Pandas GroupBy Helper": ["df.groupby(keys)[column].agg(function)","Choose grouping columns and an aggregation such as sum, mean or count."],
 "Pandas Merge Notes": ["df.merge(right, on=keys, how='left')","Define join keys and choose the correct join type before merging."],
 "Pandas Missing Values": ["missing rate = missing cells/total cells × 100%","Inspect isna().sum() and decide whether to remove, impute or preserve missingness."],
 "One Hot Encoding": ["k categories → k binary indicator columns (or k−1 with drop-first)","Fit the encoder on training data and apply the same learned categories to validation/test data."],
 "Feature Count": ["features = number of predictor columns","Exclude the target and non-feature identifiers according to the modeling design."],
 "Rows per Feature": ["ratio = rows/features","Use the training-row count and predictor-feature count."],
 "Missing Value Rate": ["missing rate = missing values/total cells × 100%","Count missing cells across the chosen data scope."],
 "Duplicate Rate": ["duplicate rate = duplicate rows/total rows × 100%","Define whether the first occurrence is treated as the retained record."],
 "Unique Rate": ["unique rate = unique values/rows × 100%","Use this to describe cardinality relative to row count."],
 "Entropy": ["H(X) = −Σ p(x)log2 p(x)","Calculate category probabilities from observed frequencies."],
 "Information Gain": ["IG = H(parent) − Σ(weighted child entropy)","Compare parent impurity with the weighted impurity after the split."],
 "Gini Impurity": ["Gini = 1 − Σpᵢ²","Calculate class proportions at a node."],
 "Cross Validation": ["Method: split data into k folds; train on k−1 and validate on the remaining fold","Rotate the validation fold and average the evaluation metric."],
 "K Fold Split": ["Method: partition observations into k approximately equal folds","Choose k, keep folds disjoint, and use each fold once as validation."],
 "Train Test Split": ["Method: partition dataset into training and holdout sets","Split before model fitting and keep the test set isolated until final evaluation."],
 "SMOTE Planning": ["Synthetic sample = xi + λ(xNN−xi), 0≤λ≤1","Apply SMOTE only to the training portion after splitting; never synthesize validation/test observations."],
 "Moving Average": ["MA = sum of last k observations/k","Choose the window length k and average the observations in each window."],
 "Exponential Smoothing": ["St = αXt + (1−α)St−1","Choose α between 0 and 1 and define the initial smoothed value."],
 "Sample Size": ["n ≈ z²p(1−p)/E² for a large-population proportion estimate","Choose confidence level z, expected proportion p and margin of error E; finite-population correction may be required."],
 "Margin of Error": ["MOE = critical value × standard error","Choose the confidence level and the correct standard error for the statistic."],
 "Confidence Interval": ["estimate ± critical value × standard error","Use the distribution and degrees of freedom appropriate to the estimator."],
 "Percentage Difference": ["|A−B|/[(A+B)/2] × 100%","Use when neither value is designated as the reference/baseline."],
 "Measurement Uncertainty": ["Combined standard uncertainty = √(u1²+u2²+…) for independent components","Combine independent standard uncertainties by root-sum-square; correlated components require covariance terms."],
 "Significant Figures": ["Method: retain the requested number of meaningful digits using the appropriate rounding rule","Enter a value and desired significant-figure count."],
 "Rounding Helper": ["Method: round to the selected decimal place or significant figures","Choose the rounding precision and verify units before reporting."],
 "Pythagorean Theorem": ["c = √(a²+b²)","Enter the two perpendicular sides of a right triangle."],
 "Trigonometry Sine": ["sin θ = opposite/hypotenuse","Enter the known sides or angle according to the selected mode."],
 "Trigonometry Cosine": ["cos θ = adjacent/hypotenuse","Enter the known sides or angle according to the selected mode."],
 "Trigonometry Tangent": ["tan θ = opposite/adjacent","Use the two perpendicular side lengths or solve for the angle."],
 "Vector Magnitude": ["|v| = √(vx²+vy²+vz²)","Enter vector components."],
 "Vector Dot Product": ["a·b = Σai bi","Multiply corresponding components and sum."],
 "Vector Cross Product": ["a×b = determinant of component matrix","Enter two 3D vectors; the result is perpendicular to both."],
 "Polar Cartesian": ["x = r cosθ; y = r sinθ","Enter radius and angle."],
 "Cartesian Polar": ["r = √(x²+y²); θ = atan2(y,x)","Enter x and y coordinates."],
 "Quadratic Equation": ["x = (−b ± √(b²−4ac))/(2a)","Enter coefficients a, b and c with a ≠ 0."],
 "Exponential Growth": ["A(t) = A0e^(kt)","Enter initial value and growth constant; for discrete compounding use the appropriate discrete model."],
 "Natural Log": ["ln(x) = loge(x)","Enter a positive x value."],
 "Logarithm": ["log_b(x) = ln(x)/ln(b)","Enter positive x and a positive base other than 1."]
};

function toolHelp(name){
 const direct=TOOL_METHODS[name]; if(direct)return direct;
 const k=normalizeToolName(name).toLowerCase();

 // Formula-first rules for common engineering/electronics tool families.
 const rules=[
  [/voltage divider/,["Vout = Vin × R2/(R1+R2)",["Vin (V)","R1 (Ω)","R2 (Ω)"],v=>v[0]!=null&&v[1]+v[2]>0?"Vout = "+(v[0]*v[2]/(v[1]+v[2])).toFixed(6)+" V":"Enter Vin, R1 and R2."]],
  [/current divider/,["I1 = It × R2/(R1+R2)",["It (A)","R1 (Ω)","R2 (Ω)"],v=>v[0]!=null&&v[1]>0&&v[2]>0?"I1 = "+(v[0]*v[2]/(v[1]+v[2])).toFixed(6)+" A":"Enter It, R1 and R2."]],
  [/cable resistance|conductor resistance|copper resistance|aluminium resistance/,["R = ρL/A",["Resistivity ρ (Ω·m)","Length L (m)","Area A (mm²)"],v=>v[0]!=null&&v[1]>0&&v[2]>0?"R ≈ "+(v[0]*v[1]/(v[2]*1e-6)).toFixed(6)+" Ω":"Enter resistivity, length and conductor area."]],
  [/power factor correction/,["Qc = P(tanφ1 − tanφ2)",["Real power P (W)","Initial PF","Target PF"],v=>v[0]>0&&v[1]>0&&v[1]<=1&&v[2]>0&&v[2]<=1?"Qc ≈ "+(v[0]*(Math.tan(Math.acos(v[1]))-Math.tan(Math.acos(v[2])))).toFixed(3)+" var":"Enter P and valid initial/target PF."]],
  [/capacitor.*kvar|kvar.*capacitor/,["Qc = P(tanφ1 − tanφ2)",["Real power P (kW)","Initial PF","Target PF"],v=>v[0]>0&&v[1]>0&&v[2]>0?"Qc ≈ "+(v[0]*1000*(Math.tan(Math.acos(v[1]))-Math.tan(Math.acos(v[2])))).toFixed(3)+" var":"Enter kW and PF values."]],
  [/three.?phase.*power|three phase load/,["P = √3 × VL × IL × PF",["Line voltage VL (V)","Line current IL (A)","Power factor"],v=>v.every(x=>x!=null)?"P ≈ "+(Math.sqrt(3)*v[0]*v[1]*v[2]).toFixed(3)+" W":"Enter VL, IL and PF."]],
  [/three.?phase.*current/,["I = P/(√3 × V × PF)",["Power P (W)","Line voltage V (V)","Power factor"],v=>v[0]!=null&&v[1]>0&&v[2]>0?"I ≈ "+(v[0]/(Math.sqrt(3)*v[1]*v[2])).toFixed(3)+" A":"Enter P, V and PF."]],
  [/motor torque|servo torque/,["τ = P/ω; ω = 2πn/60",["Power P (W)","Speed n (RPM)"],v=>v[0]>0&&v[1]>0?"τ ≈ "+(v[0]/(2*Math.PI*v[1]/60)).toFixed(4)+" N·m":"Enter power and RPM."]],
  [/motor speed|servo speed|encoder rpm/,["n = 60P/(2πτ)",["Power P (W)","Torque τ (N·m)"],v=>v[0]>0&&v[1]>0?"n ≈ "+(60*v[0]/(2*Math.PI*v[1])).toFixed(3)+" RPM":"Enter power and torque."]],
  [/generator frequency/,["f = PN/120",["Poles P","Speed N (RPM)"],v=>v[0]>0&&v[1]>=0?"f = "+(v[0]*v[1]/120).toFixed(4)+" Hz":"Enter poles and RPM."]],
  [/rpm.*hz|frequency.*rpm/,["f = RPM/60",["RPM"],v=>v[0]!=null?(v[0]/60).toFixed(6)+" Hz":"Enter RPM."]],
  [/hz.*rpm/,["RPM = 60f",["Frequency (Hz)"],v=>v[0]!=null?(v[0]*60).toFixed(4)+" RPM":"Enter frequency."]],
  [/battery.*energy/,["E = V × Ah",["Voltage V (V)","Capacity (Ah)"],v=>v[0]>0&&v[1]>=0?"E ≈ "+(v[0]*v[1]).toFixed(4)+" Wh":"Enter voltage and capacity."]],
  [/battery.*capacity/,["Ah = I × t",["Current I (A)","Time t (h)"],v=>v[0]>=0&&v[1]>=0?"Capacity ≈ "+(v[0]*v[1]).toFixed(4)+" Ah":"Enter current and time."]],
  [/battery.*runtime|ups runtime|solar runtime/,["t ≈ usable energy/load power",["Usable energy (Wh)","Load (W)"],v=>v[0]>=0&&v[1]>0?"Runtime ≈ "+(v[0]/v[1]).toFixed(4)+" h":"Enter usable energy and load."]],
  [/led power|diode power/,["P = Vf × I",["Forward voltage Vf (V)","Current I (A)"],v=>v[0]>=0&&v[1]>=0?"P ≈ "+(v[0]*v[1]).toFixed(6)+" W":"Enter Vf and current."]],
  [/zener resistor/,["R = (Vs−Vz)/Iz",["Supply Vs (V)","Zener Vz (V)","Zener current Iz (A)"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"R ≈ "+((v[0]-v[1])/v[2]).toFixed(3)+" Ω":"Enter Vs, Vz and Iz."]],
  [/relay coil current/,["I = V/R",["Coil voltage (V)","Coil resistance (Ω)"],v=>v[0]!=null&&v[1]>0?"I = "+(v[0]/v[1]).toFixed(6)+" A":"Enter voltage and resistance."]],
  [/relay power/,["P = V²/R",["Voltage (V)","Coil resistance (Ω)"],v=>v[0]!=null&&v[1]>0?"P = "+(v[0]*v[0]/v[1]).toFixed(6)+" W":"Enter voltage and resistance."]],
  [/solar panel power/,["P = G × A × η",["Irradiance G (W/m²)","Area A (m²)","Efficiency η (0–1)"],v=>v.every(x=>x!=null)?"P ≈ "+(v[0]*v[1]*v[2]).toFixed(3)+" W":"Enter irradiance, area and efficiency."]],
  [/conduit fill|cable tray fill/,["Fill ratio = occupied area / available area × 100%",["Occupied area","Available area"],v=>v[0]>=0&&v[1]>0?(v[0]/v[1]*100).toFixed(3)+" %":"Enter occupied and available area."]],
  [/voltage tolerance|supply variation/,["% deviation = |measured−nominal|/nominal × 100%",["Measured voltage","Nominal voltage"],v=>v[0]!=null&&v[1]>0?(Math.abs(v[0]-v[1])/v[1]*100).toFixed(3)+" %":"Enter measured and nominal voltage."]],
  [/temperature coefficient/,["ΔR = R0 × α × ΔT",["R0 (Ω)","α (1/°C)","ΔT (°C)"],v=>v.every(x=>x!=null)?"R ≈ "+(v[0]*(1+v[1]*v[2])).toFixed(6)+" Ω":"Enter R0, α and ΔT."]],
  [/heat sink estimate/,["RθJA ≈ (Tj(max)−Ta)/P",["Max junction Tj (°C)","Ambient Ta (°C)","Power P (W)"],v=>v[0]!=null&&v[1]!=null&&v[2]>0?"RθJA ≈ "+((v[0]-v[1])/v[2]).toFixed(4)+" °C/W":"Enter junction temperature, ambient temperature and power."]],
  [/4.?20ma scaling|0.?20ma scaling|0.?10v scaling|analog input scaling|analog output scaling|sensor range scaling/,["Output = Low + (Input−InLow)/(InHigh−InLow) × (OutHigh−OutLow)",["Input","Input low","Input high","Output low","Output high"],v=>v.every(x=>x!=null)&&v[2]!==v[1]?"Output = "+(v[3]+(v[0]-v[1])/(v[2]-v[1])*(v[4]-v[3])).toFixed(6):"Enter all scaling limits."]],
  [/linear interpolation/,["y = y1 + (x−x1)(y2−y1)/(x2−x1)",["x","x1","x2","y1","y2"],v=>v.every(x=>x!=null)&&v[2]!==v[1]?"y = "+(v[3]+(v[0]-v[1])*(v[4]-v[3])/(v[2]-v[1])).toFixed(6):"Enter x, x1, x2, y1 and y2."]],
  [/adc resolution/,["LSB = Vref/(2^N−1)",["Reference voltage Vref (V)","Resolution N (bits)"],v=>v[0]>0&&v[1]>0?"LSB ≈ "+(v[0]/(2**v[1]-1)).toFixed(8)+" V":"Enter Vref and bit resolution."]],
  [/dac resolution/,["LSB = Vref/(2^N−1)",["Reference voltage Vref (V)","Resolution N (bits)"],v=>v[0]>0&&v[1]>0?"LSB ≈ "+(v[0]/(2**v[1]-1)).toFixed(8)+" V":"Enter Vref and bit resolution."]],
  [/nyquist frequency/,["fN = fs/2",["Sampling frequency fs (Hz)"],v=>v[0]>0?"Nyquist frequency = "+(v[0]/2).toFixed(6)+" Hz":"Enter sampling frequency."]],
  [/sampling frequency/,["fs ≥ 2fmax (Nyquist criterion)",["Maximum signal frequency (Hz)"],v=>v[0]>0?"Minimum ideal fs ≥ "+(2*v[0]).toFixed(6)+" Hz":"Enter maximum signal frequency."]],
  [/pid proportional/,["P = Kp × error",["Kp","Error"],v=>v.every(x=>x!=null)?"P output = "+(v[0]*v[1]).toFixed(6):"Enter Kp and error."]],
  [/pid integral/,["I contribution = Ki × ∫error dt",["Ki","Error integral"],v=>v.every(x=>x!=null)?"I contribution = "+(v[0]*v[1]).toFixed(6):"Enter Ki and accumulated error."]],
  [/pid derivative/,["D contribution = Kd × d(error)/dt",["Kd","Error rate"],v=>v.every(x=>x!=null)?"D contribution = "+(v[0]*v[1]).toFixed(6):"Enter Kd and error rate."]],
  [/torque conversion/,["Torque conversion factor depends on source/destination unit",["Torque value"],v=>v[0]!=null?"Enter the source unit and apply the published conversion factor.":"Enter a torque value."]]
 ];
 for(const [rx,d] of rules) if(rx.test(k)) return d;

 if(/converter/.test(k))return["Method: source unit/representation → destination unit/representation",["Value"],v=>v[0]!=null?"Apply the documented source-to-destination conversion factor for the selected units.":"Enter a value, then select the source and destination units."];
 if(/selection|sizing|rating|budget|count|space|capacity/.test(k))return["Method: calculate demand, apply required factors, then compare with the equipment/specification limit",["Design value"],v=>v[0]!=null?"Use the calculated demand with the applicable derating, margin and manufacturer/standard limit; result is a design check, not an automatic approval.":"Enter the relevant design demand."];
 if(/lookup|code|class|colour|color/.test(k))return["Method: decode the identifier using the applicable standard, manufacturer table or code system",["Code / value"],()=> "Enter the code or value and compare it with the authoritative reference table."];
 if(/check|validation|test|inspection|interval|maintenance/.test(k))return["Method: compare the measured condition against the defined acceptance criterion and record the result",["Measured value"],v=>v[0]!=null?"Compare the measured value with the applicable limit, test procedure or maintenance interval.":"Enter the measured value or inspection parameter."];
 if(/notes|guide|reference|helper|planner|builder|logic|table|summary/.test(k))return["Method: structured technical procedure",["Input"],()=> "Enter the requested parameters and follow the displayed procedure. Use the applicable standard, datasheet or manufacturer documentation for the final decision."];
 return["Purpose and use: "+name,["Input"],()=> "This tool is intended to support "+name.toLowerCase()+". Enter the relevant engineering values, identify the governing standard or datasheet, then apply the stated calculation or procedure. Safety-critical results must be verified against the applicable requirements."];
}

function definitionFor(t){
 const exact=DEFINITIONS[t.name]||DEFINITIONS[t.name.replace(/’/g,"'")];if(exact)return exact;
 const key=normalizeToolName(t.name);if(EXTRA_DEFINITIONS[key])return EXTRA_DEFINITIONS[key];
 const k=key.toLowerCase();
 if(/mean|median|mode|variance|standard deviation|coefficient of variation/.test(k)){const m=k==="mean"?"mean":k==="median"?"median":k==="mode"?"mode":k==="variance"?"variance":k.includes("standard")?"std":"cv";return[statFormula(m),["Values (comma separated)"],()=>stat(m)]}
 const h=toolHelp(t.name);
 return[h[0],["Input"],()=>h[1]];
}

window.HBMegaToolOpen=function(id){const t=window.__HBMegaTools?.find(x=>String(x.id)===String(id));if(!t)return;const modal=$("resourceToolModal"),body=$("resourceToolBody");if(!modal||!body)return;const d=definitionFor(t);$("resourceToolTitle").textContent=t.name;body.innerHTML='<div class="tool-modal-domain">'+esc(t.category)+'</div><div class="tool-formula"><b>FORMULA / METHOD</b><code>'+esc(d[0])+'</code></div><div class="tool-inputs">'+d[1].map((x,i)=>'<label>'+esc(x)+'<input id="megaInput'+i+'" type="'+(/text|json|url|regex|cron|user|group|expression|columns|color|hex|ipv4|character|comma|html|markdown|yaml|xml/i.test(x)?'text':'number')+'" step="any" placeholder="'+esc(x)+'"></label>').join("")+'</div><div class="hb-mini-actions"><button id="megaCalculate" class="os-btn primary" type="button">CALCULATE</button><button id="megaClear" class="os-btn" type="button">CLEAR</button></div><div id="megaResult" class="hb-result">Enter variables. Results appear here.</div><div class="tool-source-note">Runs locally in your browser. No input is sent to GitHub or the source repository.</div>';modal.classList.add("open");modal.setAttribute("aria-hidden","false");const run=()=>{const v=d[1].map((_,i)=>{const e=$("megaInput"+i);if(!e)return null;if(e.type==="text")return e.value.trim()||null;const n=parseFloat(e.value);return Number.isFinite(n)?n:null});try{$("megaResult").textContent=d[2](v)}catch(e){$("megaResult").textContent="Check the input values."}};$("megaCalculate").onclick=run;$("megaClear").onclick=()=>{d[1].forEach((_,i)=>{const e=$("megaInput"+i);if(e)e.value=""});$("megaResult").textContent="Enter variables. Results appear here."};body.querySelectorAll("input").forEach(e=>e.addEventListener("input",run))};
window.HBMegaToolClose=function(){const m=$("resourceToolModal");if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true")}};

window.HBUpgradeMegaTools=function(list){
 const base=Array.isArray(list)?list:[], local=window.HBEngineeringToolRegistry||[], library=window.HBEngineeringLibraryRegistry||[];
 const coreEngineering=[
  {name:"Power",category:"Core Engineering",type:"FORMULA",formula:"P = V × I",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"V",label:"Voltage (V)"},{key:"I",label:"Current (A)"}],calculate:v=>v.V!=null&&v.I!=null?(v.V*v.I).toFixed(4)+" W (V × I)":"Enter voltage and current."},
  {name:"Energy",category:"Core Engineering",type:"FORMULA",formula:"E = P × t",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"P",label:"Power (W)"},{key:"t",label:"Time (h)"}],calculate:v=>v.P!=null&&v.t!=null?(v.P*v.t).toFixed(4)+" Wh (P × hours)":"Enter power and time."},
  {name:"Voltage Divider (Core)",category:"Core Engineering",type:"FORMULA",formula:"Vout = Vin × R2 / (R1 + R2)",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"Vin",label:"Input voltage Vin (V)"},{key:"R1",label:"R1 (Ω)"},{key:"R2",label:"R2 (Ω)"}],calculate:v=>v.Vin!=null&&v.R1!=null&&v.R2!=null&&v.R1+v.R2!==0?"Vout = "+(v.Vin*v.R2/(v.R1+v.R2)).toFixed(4)+" V":"Enter Vin, R1 and R2."},
  {name:"Series Resistance",category:"Core Engineering",type:"FORMULA",formula:"Rtotal = R1 + R2",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"R1",label:"R1 (Ω)"},{key:"R2",label:"R2 (Ω)"}],calculate:v=>v.R1!=null&&v.R2!=null?(v.R1+v.R2).toFixed(4)+" Ω":"Enter both resistances."},
  {name:"Parallel Resistance",category:"Core Engineering",type:"FORMULA",formula:"1/Rt = 1/R1 + 1/R2",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"R1",label:"R1 (Ω)"},{key:"R2",label:"R2 (Ω)"}],calculate:v=>v.R1>0&&v.R2>0?(1/(1/v.R1+1/v.R2)).toFixed(4)+" Ω":"Enter positive resistances."},
  {name:"Current from Power",category:"Core Engineering",type:"FORMULA",formula:"I = P / V",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"P",label:"Power P (W)"},{key:"V",label:"Voltage V (V)"}],calculate:v=>v.P!=null&&v.V!==0?(v.P/v.V).toFixed(4)+" A":"Enter power and non-zero voltage."},
  {name:"Resistance from Power",category:"Core Engineering",type:"FORMULA",formula:"R = V² / P",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"V",label:"Voltage V (V)"},{key:"P",label:"Power P (W)"}],calculate:v=>v.V!=null&&v.P>0?(v.V*v.V/v.P).toFixed(4)+" Ω":"Enter voltage and positive power."},
  {name:"Frequency / Period",category:"Core Engineering",type:"FORMULA",formula:"f = 1 / T",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"T",label:"Period T (s)"}],calculate:v=>v.T>0?(1/v.T).toFixed(6)+" Hz":"Enter a positive period."},
  {name:"Wavelength",category:"Core Engineering",type:"FORMULA",formula:"λ = c / f",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"f",label:"Frequency f (Hz)"}],calculate:v=>v.f>0?(299792458/v.f).toFixed(4)+" m":"Enter a positive frequency."},
  {name:"dBm → mW",category:"Core Engineering",type:"CONVERTER",formula:"mW = 10^(dBm/10)",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"dBm",label:"dBm"}],calculate:v=>v.dBm!=null?Math.pow(10,v.dBm/10).toFixed(6)+" mW":"Enter dBm."},
  {name:"mW → dBm",category:"Core Engineering",type:"CONVERTER",formula:"dBm = 10 log10(mW)",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"mW",label:"Power (mW)"}],calculate:v=>v.mW>0?(10*Math.log10(v.mW)).toFixed(4)+" dBm":"Enter positive mW."},
  {name:"CIDR IPv4",category:"Core Engineering",type:"NETWORK",formula:"Calculate network, broadcast and usable hosts",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"ip",label:"IPv4 address",inputType:"text"},{key:"prefix",label:"Prefix (0–32)",inputType:"number"}],calculate:v=>{const p=Number(v.prefix);if(!/^\d+\.\d+\.\d+\.\d+$/.test(String(v.ip||""))||!Number.isInteger(p)||p<0||p>32)return"Enter a valid IPv4 address and prefix 0–32.";const o=String(v.ip).split(".").map(Number);if(o.some(x=>x>255))return"Invalid IPv4 address.";const n=o.reduce((x,z)=>(x*256+z)>>>0,0),mask=p===0?0:(0xffffffff<<(32-p))>>>0,net=(n&mask)>>>0,broad=(net|(~mask))>>>0,hosts=p>=31?Math.pow(2,32-p):Math.max(0,Math.pow(2,32-p)-2),fmt=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join(".");return"Network "+fmt(net)+" · Broadcast "+fmt(broad)+" · Hosts "+hosts.toLocaleString();}},
  {name:"Subnet Hosts",category:"Core Engineering",type:"NETWORK",formula:"2^hostBits − 2",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"hostBits",label:"Host bits"}],calculate:v=>v.hostBits!=null?Math.max(0,Math.pow(2,v.hostBits)-2).toLocaleString()+" usable hosts":"Enter host bits."},
  {name:"Binary → Decimal",category:"Core Engineering",type:"CONVERTER",formula:"Base-2 → base-10",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"value",label:"Binary value",inputType:"text"}],calculate:v=>{const s=String(v.value||"").trim();return /^[01]+$/.test(s)?parseInt(s,2).toString(10):"Enter a valid binary value."}},
  {name:"Hex → Decimal",category:"Core Engineering",type:"CONVERTER",formula:"Base-16 → base-10",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"value",label:"Hex value",inputType:"text"}],calculate:v=>{const s=String(v.value||"").replace(/^0x/i,"").trim();return /^[0-9a-f]+$/i.test(s)?parseInt(s,16).toString(10):"Enter a valid hexadecimal value."}},
  {name:"Decimal → Binary",category:"Core Engineering",type:"CONVERTER",formula:"Base-10 → base-2",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"value",label:"Decimal value"}],calculate:v=>v.value!=null?Math.trunc(v.value).toString(2):"Enter a decimal value."},
  {name:"Decimal → Hex",category:"Core Engineering",type:"CONVERTER",formula:"Base-10 → base-16",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"value",label:"Decimal value"}],calculate:v=>v.value!=null?Math.trunc(v.value).toString(16).toUpperCase():"Enter a decimal value."},
  {name:"Bytes → KB / MB",category:"Core Engineering",type:"CONVERTER",formula:"KB = bytes/1024 · MB = bytes/1048576",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"bytes",label:"Bytes"}],calculate:v=>v.bytes!=null?v.bytes+" bytes = "+(v.bytes/1024).toFixed(3)+" KB = "+(v.bytes/1048576).toFixed(3)+" MB":"Enter bytes."},
  {name:"Celsius → Fahrenheit",category:"Core Engineering",type:"CONVERTER",formula:"F = C × 9/5 + 32",execution:"BROWSER",source:"ADIGUN Core Engineering",engine:"engineering",inputs:[{key:"C",label:"Temperature (°C)"}],calculate:v=>v.C!=null?(v.C*9/5+32).toFixed(2)+" °F":"Enter temperature."}
 ];
 const workbench=[
  {name:"Technical Workbench / Decoder",category:"Technical Workbench",type:"INTERACTIVE",formula:"Decode binary, hex, ASCII and IP/CIDR representations",execution:"WORKBENCH",source:"HB Technical Workbench",workbench:"decoder"},
  {name:"Technical Workbench / Color & LED",category:"Technical Workbench",type:"INTERACTIVE",formula:"Inspect HEX/RGB colours, LED PWM and resistor calculations",execution:"WORKBENCH",source:"HB Technical Workbench",workbench:"color"},
  {name:"Technical Workbench / Protocol",category:"Technical Workbench",type:"REFERENCE",formula:"Protocol and service reference for common network services",execution:"WORKBENCH",source:"HB Technical Workbench",workbench:"protocol"},
  {name:"Technical Workbench / Signal Lab",category:"Technical Workbench",type:"SIMULATOR",formula:"Model sine, square, triangle and sawtooth signals",execution:"WORKBENCH",source:"HB Technical Workbench",workbench:"signal"},
  {name:"Technical Workbench / Challenge",category:"Technical Workbench",type:"LEARNING",formula:"Interactive technical challenge generator",execution:"WORKBENCH",source:"HB Technical Workbench",workbench:"challenge"}
 ];
 const normalise=(x,i,source)=>source!=="base"?{id:"eng-"+source+"-"+i,name:x.name,category:x.category||"Engineering",type:x.type||"FORMULA",formula:x.formula||"",execution:x.execution||"BROWSER",source:x.source||source,engine:"engineering",inputs:x.inputs||[],calculate:x.calculate}:{...x,id:x.id??("base-"+i),category:x.category||"General",execution:x.execution||"LINK",source:x.source||"Indexed library"};
 const merged=[...base.map((x,i)=>normalise(x,i,"base")),...local.map((x,i)=>normalise(x,i,"local")),...library.map((x,i)=>normalise(x,i,"library")),...coreEngineering.map((x,i)=>({...x,id:"core-"+i})),...workbench.map((x,i)=>({...x,id:"workbench-"+i}))];
 const seen=new Set(),tools=merged.filter(x=>{const k=(x.name+"|"+x.category).toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
 window.__HBMegaTools=tools;
 window.dispatchEvent(new CustomEvent("hb:mega-tools-ready",{detail:{count:tools.length}}));
 const grid=$("megaToolGrid");if(!grid)return;
 const search=$("megaToolSearch"),category=$("megaToolCategory"),typeSel=$("megaToolType"),execSel=$("megaToolExecution");
 let showAllMega=false;
 const searchable=x=>{try{return JSON.stringify(x,(k,v)=>typeof v==="function"?undefined:v).toLowerCase()}catch{return [x.name,x.category,x.type,x.formula,x.source].join(" ").toLowerCase()}};
 const normaliseSearch=v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 const draw=()=>{
  const q=(search?.value||"").toLowerCase().trim(),f=category?.value||"all",tf=typeSel?.value||"all",ex=execSel?.value||"all";
  const hasFilters=!!q||f!=="all"||tf!=="all"||ex!=="all";
  if(!hasFilters){
   const counts=new Map();tools.forEach(x=>{const c=x.category||"General";counts.set(c,(counts.get(c)||0)+1)});
   grid.innerHTML='<div class="mega-category-overview" aria-label="Tool categories">'+[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,n])=>'<button type="button" class="mega-category-tile" data-open-mega-category="'+esc(cat)+'"><span>'+n+' CAPABILITIES</span><strong>'+esc(cat)+'</strong><small>Browse this domain →</small></button>').join("")+'</div><p class="mega-catalog-hint">Choose a domain or search by tool name, alias, category, formula, description, keyword or source. All catalogue records remain searchable even when not shown.</p>';
   if($("megaToolCount"))$("megaToolCount").textContent=tools.length.toLocaleString()+" capabilities across "+counts.size.toLocaleString()+" domains";
   return;
  }
  const qNormal=normaliseSearch(q),qCompact=qNormal.replace(/\s+/g,"");
  const rows=tools.filter(x=>{const hay=searchable(x),normal=normaliseSearch(hay);return (f==="all"||x.category===f)&&(tf==="all"||String(x.type||"").toUpperCase()===tf)&&(ex==="all"||String(x.execution||"").toUpperCase()===ex)&&(!q||hay.includes(q)||normal.includes(qNormal)||normal.replace(/\s+/g,"").includes(qCompact));});
  const shown=showAllMega?rows:rows.slice(0,36);
  grid.innerHTML=shown.map(x=>'<article class="hb-card mega-tool-card"><div class="hb-card-top"><span>'+esc(String(x.id).padStart(4,"0"))+" · "+esc(x.category)+'</span><span>● LIVE</span></div><h3>'+esc(x.name)+'</h3><p>'+esc(x.formula||x.description||"Interactive technical capability.")+'</p><small>'+esc((x.type||"TOOL")+" · "+(x.execution||"LOCAL"))+'</small><br><button class="os-btn mega-open" type="button" data-id="'+esc(x.id)+'">OPEN TOOL →</button></article>').join("")||'<div class="intel-empty">No tools match the current filters. Try a shorter query or clear one of the filters.</div>';
  if(rows.length>shown.length)grid.insertAdjacentHTML("beforeend",'<div class="mega-show-more"><button type="button" data-show-more-mega>SHOW ALL '+rows.length+' MATCHES</button></div>');
  grid.querySelectorAll(".mega-open").forEach(b=>b.onclick=()=>window.HBMegaToolOpen(b.dataset.id));
  if($("megaToolCount"))$("megaToolCount").textContent=rows.length.toLocaleString()+" matching · "+tools.length.toLocaleString()+" total capabilities";
 };
 grid.addEventListener("click",e=>{
  const cat=e.target.closest("[data-open-mega-category]");
  if(cat&&category){category.value=cat.dataset.openMegaCategory;showAllMega=false;draw();grid.scrollIntoView({behavior:"smooth",block:"start"});return;}
  if(e.target.closest("[data-show-more-mega]")){showAllMega=true;draw();}
 });
const cats=[...new Set(tools.map(x=>x.category))].sort();if(category)category.innerHTML='<option value="all">ALL DOMAINS</option>'+cats.map(x=>'<option value="'+esc(x)+'">'+esc(x.toUpperCase())+'</option>').join("");if(typeSel){const vals=[...new Set(tools.map(x=>String(x.type||"TOOL").toUpperCase()))].sort();typeSel.innerHTML='<option value="all">ALL TOOL TYPES</option>'+vals.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("")}if(execSel){const vals=[...new Set(tools.map(x=>String(x.execution||"LOCAL").toUpperCase()))].sort();execSel.innerHTML='<option value="all">ALL EXECUTION</option>'+vals.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("")}[search,category,typeSel,execSel].forEach(e=>{if(e&&!e.dataset.hbBound){const update=()=>{showAllMega=false;draw()};e.addEventListener("input",update);e.addEventListener("change",update);e.dataset.hbBound="1"}});draw();
};
window.HBMegaToolOpen=function(id){
 const t=window.__HBMegaTools?.find(x=>String(x.id)===String(id));if(!t)return;
 if(t.workbench){const host=document.querySelector("#technicalWorkbench");host?.scrollIntoView({behavior:"smooth",block:"start"});document.querySelectorAll(".hb-machine-tabs button").forEach(b=>{if(b.dataset.machine===t.workbench)b.click()});return}
 if(t.engine==="engineering"&&typeof t.calculate==="function"){const modal=$("resourceToolModal"),body=$("resourceToolBody");if(!modal||!body)return; $("resourceToolTitle").textContent=t.name;body.innerHTML='<div class="tool-modal-domain">'+esc(t.category)+'</div><h2>'+esc(t.name)+'</h2><div class="tool-formula"><b>FORMULA</b><code>'+esc(t.formula)+'</code></div><div class="tool-inputs">'+t.inputs.map((x,i)=>'<label>'+esc(x.label)+'<input id="megaInput'+i+'" type="'+(x.inputType||"number")+'" step="any" placeholder="'+esc(x.label)+'"></label>').join("")+'</div><div class="hb-mini-actions"><button id="megaCalculate" class="os-btn primary">CALCULATE</button><button id="megaClear" class="os-btn">CLEAR</button></div><div id="megaResult" class="hb-result">Enter variables. Results appear here.</div><div class="tool-source-note">Runs locally in your browser. Source registry: '+esc(t.source)+'. Verify safety-critical work against the applicable standard and manufacturer data.</div>';modal.classList.add("open");modal.setAttribute("aria-hidden","false");const run=()=>{const v={};t.inputs.forEach((x,i)=>{const e=$("megaInput"+i);v[x.key]=e&&e.value!==""?(e.type==="text"?e.value.trim():Number(e.value)):null});try{$("megaResult").textContent=t.calculate(v)}catch(e){$("megaResult").textContent="Check the input values."}};$("megaCalculate").onclick=run;$("megaClear").onclick=()=>{t.inputs.forEach((_,i)=>{const e=$("megaInput"+i);if(e)e.value=""});$("megaResult").textContent="Enter variables. Results appear here."};body.querySelectorAll("input").forEach(e=>e.addEventListener("input",run));return}
 const modal=$("resourceToolModal"),body=$("resourceToolBody");if(!modal||!body)return;const d=definitionFor(t);$("resourceToolTitle").textContent=t.name;body.innerHTML='<div class="tool-modal-domain">'+esc(t.category)+'</div><div class="tool-formula"><b>FORMULA / METHOD</b><code>'+esc(d[0])+'</code></div><div class="tool-inputs">'+d[1].map((x,i)=>'<label>'+esc(x)+'<input id="megaInput'+i+'" type="'+(/text|json|url|regex|cron|user|group|expression|columns|color|hex|ipv4|character|comma|html|markdown|yaml|xml/i.test(x)?"text":"number")+'" step="any" placeholder="'+esc(x)+'"></label>').join("")+'</div><div class="hb-mini-actions"><button id="megaCalculate" class="os-btn primary" type="button">CALCULATE</button><button id="megaClear" class="os-btn" type="button">CLEAR</button></div><div id="megaResult" class="hb-result">Enter variables. Results appear here.</div><div class="tool-source-note">Runs locally in your browser. No input is sent to GitHub or the source repository.</div>';modal.classList.add("open");modal.setAttribute("aria-hidden","false");const run=()=>{const v=d[1].map((_,i)=>{const e=$("megaInput"+i);if(!e)return null;if(e.type==="text")return e.value.trim()||null;const n=parseFloat(e.value);return Number.isFinite(n)?n:null});try{$("megaResult").textContent=d[2](v)}catch(e){$("megaResult").textContent="Check the input values."}};$("megaCalculate").onclick=run;$("megaClear").onclick=()=>{d[1].forEach((_,i)=>{const e=$("megaInput"+i);if(e)e.value=""});$("megaResult").textContent="Enter variables. Results appear here."};body.querySelectorAll("input").forEach(e=>e.addEventListener("input",run));
};

document.addEventListener("DOMContentLoaded",()=>{$("resourceToolClose")?.addEventListener("click",window.HBMegaToolClose);$("resourceToolModal")?.addEventListener("click",e=>{if(e.target.id==="resourceToolModal")window.HBMegaToolClose()})});
})();