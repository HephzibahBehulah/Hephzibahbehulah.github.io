export interface Schematic3DEquipment {
  tag: string;
  name: string;
  xM: number;
  yM: number;
  zM: number;
  widthM: number;
  depthM: number;
  heightM: number;
  rating: string;
  manufacturer?: string;
  partNumber?: string;
  electricalValue?: number | string | null;
  tolerance?: number | null;
}
export interface Schematic3DCableRoute {
  tag: string;
  x1M: number;
  y1M: number;
  x2M: number;
  y2M: number;
  color: string;
  label: string;
}
export interface Schematic3DPackage {
  kind: 'schematic-3d-preview';
  status: string;
  project: { name: string; facility: { buildingZones: unknown[] } };
  equipmentCoordinates: Schematic3DEquipment[];
  cableRoutes: Schematic3DCableRoute[];
  assumptions: string[];
  forConstruction: false;
}
export function createSchematic3DPackage(documentData: unknown): Schematic3DPackage;
