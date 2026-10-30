const CONTACT_PAIRS = {
  no: [['3', '4']], nc: [['1', '2']], selector: [['3', '4']], breaker: [['1', '2']],
  overloadNC: [['95', '96']], overloadNO: [['97', '98']], auxNO: [['13', '14']], auxNC: [['21', '22']],
  breaker3: [['1', '2'], ['3', '4'], ['5', '6']],
  contactor3: [['1', '2'], ['3', '4'], ['5', '6']],
  overload3: [['1', '2'], ['3', '4'], ['5', '6']],
};

/** @typedef {{version:number,mode:string,nodes:{id:string,data:{kind:string,tag:string},position?:{x:number,y:number}}[],edges:{source:string,target:string,sourceHandle?:string|null,targetHandle?:string|null}[]}} Project */

const key = (nodeId, terminal) => `${nodeId}:${terminal}`;

/**
 * Runs limited terminal-topology checks for ladder coil chains and rung rails.
 * These checks are educational diagnostics, not an IEC or safety compliance review.
 * @param {Project} project
 * @returns {{code:string,severity:'error'|'warning',deviceIds:string[],message:string}[]}
 */
export function analyzePLCWiring(project) {
  if (!project || project.mode !== 'ladder') return [];
  const nodes = new Map(project.nodes.map(node => [node.id, node]));
  const coils = project.nodes.filter(node => node.data.kind === 'coil');
  const adjacency = new Map();
  const link = (a, b) => {
    const from = adjacency.get(a) || [];
    const to = adjacency.get(b) || [];
    from.push(b);
    to.push(a);
    adjacency.set(a, from);
    adjacency.set(b, to);
  };
  for (const edge of project.edges) {
    if (!nodes.has(edge.source) || !nodes.has(edge.target) || !edge.sourceHandle || !edge.targetHandle) continue;
    link(key(edge.source, edge.sourceHandle), key(edge.target, edge.targetHandle));
  }
  for (const node of project.nodes) {
    for (const [from, to] of CONTACT_PAIRS[node.data.kind] || []) link(key(node.id, from), key(node.id, to));
  }

  const rails = new Set();
  for (const node of project.nodes) {
    if (node.data.kind === 'supply') rails.add(key(node.id, 'L'));
    if (node.data.kind === 'threephase') for (const terminal of ['L1', 'L2', 'L3']) rails.add(key(node.id, terminal));
    if (node.data.kind === 'neutral') rails.add(key(node.id, 'N'));
  }
  const coilTerminals = new Map(coils.map(node => [node.id, new Set([key(node.id, 'A1'), key(node.id, 'A2')])]));
  const reaches = (start, targetRails, blockedCoilId) => {
    const queue = [start];
    const seen = new Set(queue);
    while (queue.length) {
      const current = queue.shift();
      for (const next of adjacency.get(current) || []) {
        if (targetRails.has(next)) return true;
        const nextCoilId = next.slice(0, next.lastIndexOf(':'));
        if (nextCoilId !== blockedCoilId && coilTerminals.has(nextCoilId)) continue;
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    return false;
  };

  const findings = [];
  const seriesPairs = new Set();
  for (const coil of coils) {
    const a1 = key(coil.id, 'A1');
    const a2 = key(coil.id, 'A2');
    const connectedA1 = (adjacency.get(a1) || []).length > 0;
    const connectedA2 = (adjacency.get(a2) || []).length > 0;
    if (!connectedA1 || !connectedA2) {
      findings.push({
        code: 'coil-open-terminal', severity: 'error', deviceIds: [coil.id],
        message: `${coil.data.tag} does not have both A1 and A2 terminals wired; the coil cannot terminate a complete rung.`,
      });
      continue;
    }

    for (const terminal of [a1, a2]) {
      const queue = [terminal];
      const seen = new Set(queue);
      while (queue.length) {
        const current = queue.shift();
        for (const next of adjacency.get(current) || []) {
          const otherCoilId = next.slice(0, next.lastIndexOf(':'));
          if (otherCoilId !== coil.id && coilTerminals.has(otherCoilId)) {
            const otherTerminal = next.slice(next.lastIndexOf(':') + 1);
            const thisTerminal = terminal.slice(terminal.lastIndexOf(':') + 1);
            if (otherTerminal !== thisTerminal) {
              const pair = [coil.id, otherCoilId].sort().join('|');
              if (!seriesPairs.has(pair)) {
                seriesPairs.add(pair);
                const other = nodes.get(otherCoilId);
                findings.push({ code: 'series-coils', severity: 'error', deviceIds: [coil.id, otherCoilId], message: `Possible series-connected output coils ${coil.data.tag} and ${other.data.tag}; terminate each rung on its own output coil.` });
              }
            }
            continue;
          }
          if (!seen.has(next)) { seen.add(next); queue.push(next); }
        }
      }
    }

    if (!reaches(a1, rails, coil.id)) findings.push({ code: 'rung-supply-missing', severity: 'warning', deviceIds: [coil.id], message: `${coil.data.tag} A1 cannot be traced to a control supply through the wired contacts.` });
    if (!reaches(a2, new Set([...rails].filter(rail => nodes.get(rail.slice(0, rail.lastIndexOf(':')))?.data.kind === 'neutral')), coil.id)) {
      findings.push({ code: 'rung-return-missing', severity: 'warning', deviceIds: [coil.id], message: `${coil.data.tag} A2 cannot be traced to a neutral / 0 V return through the wired contacts.` });
    }
  }
  return findings;
}

