export const IEC_CABLE_SECTIONS_MM2:number[];
export function calculateCableSizing(input?:Record<string,number|string|Array<{sectionMM2:number;ampacityA:number}>>):{
 status:string;sectionAssessment:Array<{sectionMM2:number;baseAmpacityA:number;correctedAmpacityA:number;voltageDropPercent:number;ampacityPass:boolean;voltageDropPass:boolean;shortCircuitPass:boolean;protectiveDevicePass:boolean;passes:boolean}>;selectedSectionAssessment:{sectionMM2:number;baseAmpacityA:number;correctedAmpacityA:number;voltageDropPercent:number;ampacityPass:boolean;voltageDropPass:boolean;shortCircuitPass:boolean;protectiveDevicePass:boolean;passes:boolean}|null;inputs:Record<string,unknown>;currentA:number;correctionFactors:Record<string,number>;requiredBaseAmpacityA:number;ampacityCandidateMM2:number|null;
 voltageDrop:Record<string,number|boolean|null>;shortCircuit:Record<string,number|null>;selectedSectionMM2:number|null;correctedSelectedAmpacityA:number|null;
 protectiveDeviceCheck:{protectiveDeviceA:number;designCurrentA:number;correctedCableAmpacityA:number;passes:boolean}|null;assumptions:string[];forConstruction:false;
};
export function iecInverseTime(currentA:number,pickupA:number,timeMultiplier?:number,curve?:string):number;
export function assessProtectionPair(input:Record<string,number|string>):Record<string,unknown>;
export function exportDrawingDxf(documentData:unknown):string;
export function exportIfc4(documentData:unknown):string;

export function exportEngineeringPackageIfc4(pkg:unknown):string;

export function renderEngineeringIsometricSvg(pkg:unknown):string|null;

export interface ProtectionEnvelopeRow {faultCurrentA:number;downstreamRelayTimeS:number;downstreamTotalClearingS:number;upstreamRelayTimeS:number;upstreamTotalClearingS:number;selectivityMarginS:number;passes:boolean}
export interface ProtectionEnvelopeResult {status:string;curve:string;curves:{downstream:string;upstream:string};settings:Record<string,unknown>;summary:{evaluatedPoints:number;passingPoints:number;failingPoints:number;minimumMarginS:number;minimumMarginCurrentA:number};rows:ProtectionEnvelopeRow[];assumptions:string[];forConstruction:false}
export function assessProtectionEnvelope(input:Record<string,number|string|Array<{currentA:number;timeS:number}>>):ProtectionEnvelopeResult;

export function exportEngineeringPackageGltf(pkg:unknown):string;

export function analyzeEngineeringPackageClashes(pkg:unknown):{status:string;checks:Record<string,number>;overlapCount:number;overlaps:Array<Record<string,string|number>>;assumptions:string[];forConstruction:false};

export function equipmentProxyDimensions(e?:Record<string,unknown>):{widthM:number;depthM:number;heightM:number};
