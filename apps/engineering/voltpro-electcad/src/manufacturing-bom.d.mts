export type SchedulePart = {
  type: string;
  ref?: string;
  value?: string;
  manufacturer?: string;
  partNumber?: string;
  tolerance?: number;
  electricalValue?: number;
};
export type ScheduleWire = {
  id?: string;
  ref?: string;
  label?: string;
  cableType?: string;
  gauge?: string;
  cores?: number;
  color?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  manufacturer?: string;
  partNumber?: string;
  lengthAllowance?: number;
};
export type ScheduleSheet = {
  id?: string;
  name?: string;
  parts: SchedulePart[];
  wires: ScheduleWire[];
};
export function routeGeometryLength(wire: Pick<ScheduleWire, 'x1' | 'y1' | 'x2' | 'y2'>): { horizontal: number; vertical: number; total: number };
export function buildManufacturingSchedule(sheets: ScheduleSheet[]): {
  deviceItems: Array<{
    type: string;
    value: string;
    manufacturer: string;
    partNumber: string;
    tolerance: number | '';
    electricalValue: number | '';
    quantity: number;
    references: string[];
    sheets: string[];
    sourcingStatus: string;
  }>;
  cableRuns: Array<{
    sheet: string;
    reference: string;
    id: string;
    net: string;
    cableType: string;
    conductorSize: string;
    cores: number | '';
    color: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    horizontal: number;
    vertical: number;
    geometryLength: number;
    userAllowance: number | '';
    geometryPlusAllowance: number | '';
    manufacturer: string;
    partNumber: string;
    sourcingStatus: string;
    lengthStatus: string;
  }>;
  totals: { deviceQuantity: number; cableRunCount: number; cableGeometryLength: number };
  notes: string[];
};
