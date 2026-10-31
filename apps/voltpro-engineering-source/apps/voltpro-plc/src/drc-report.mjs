/**
 * Combines VoltPro PLC model validation with its ladder topology advisories.
 * This report is an educational project review; it does not assess IEC 61131-3
 * conformity, machine safety, protection coordination, or installation rules.
 * @param {string[]} validationErrors
 * @param {{code:string,severity:'error'|'warning',deviceIds:string[],message:string}[]} wiringFindings
 */
export function createPLCDRCReport(validationErrors = [], wiringFindings = []) {
  const findings = [
    ...validationErrors.map((message, index) => ({
      id: `model-${index}`,
      code: 'project-model',
      severity: 'error',
      deviceIds: [],
      message,
    })),
    ...wiringFindings.map((finding, index) => ({
      ...finding,
      id: `wiring-${finding.code}-${index}`,
    })),
  ];

  return {
    findings,
    passed: findings.length === 0,
    profile: 'VoltPro educational project review',
    standardsAssessment: 'not-assessed',
  };
}
