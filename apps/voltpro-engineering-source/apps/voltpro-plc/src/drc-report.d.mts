export type PLCDRCFinding = {
  id: string;
  code: string;
  severity: 'error' | 'warning';
  deviceIds: string[];
  message: string;
};
export type PLCDRCReport = {
  findings: PLCDRCFinding[];
  passed: boolean;
  profile: string;
  standardsAssessment: 'not-assessed';
};
export function createPLCDRCReport(
  validationErrors?: string[],
  wiringFindings?: Omit<PLCDRCFinding, 'id'>[],
): PLCDRCReport;
