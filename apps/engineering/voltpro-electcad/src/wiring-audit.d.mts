export function auditWireColorConsistency(wires: Array<{label?: string; color?: string; ref?: string}>): Array<{
  code: 'NET_COLOR_MISMATCH';
  severity: 'warning';
  label: string;
  colors: string[];
  references: string[];
  basis: string;
}>;
