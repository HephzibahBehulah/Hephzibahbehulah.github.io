(() => {
  'use strict';
  const cell = (row, value, className = '') => {
    const td = document.createElement('td');
    td.textContent = Array.isArray(value) ? value.join('; ') : String(value ?? '');
    if (className) td.className = className;
    row.append(td);
  };
  async function loadBuild() {
    const error = document.getElementById('buildError');
    try {
      const response = await fetch('/api/status', { cache:'no-store' });
      if (!response.ok) throw new Error(`Status endpoint returned ${response.status}.`);
      const info = await response.json();
      document.getElementById('buildVersion').textContent = info.version || 'Unknown';
      document.getElementById('commitHash').textContent = info.commitHash || 'Unknown';
      document.getElementById('deploymentTimestamp').textContent = info.deploymentTimestamp || 'Not recorded';
    } catch (failure) {
      error.hidden = false;
      error.textContent = `Build metadata unavailable: ${failure.message}`;
      document.getElementById('buildVersion').textContent = 'Unavailable';
      document.getElementById('commitHash').textContent = 'Unavailable';
      document.getElementById('deploymentTimestamp').textContent = 'Unavailable';
    }
  }
  async function loadGaps() {
    const body = document.getElementById('gapRows');
    try {
      const response = await fetch('/gaps.json', { cache:'no-store' });
      if (!response.ok) throw new Error(`gaps.json returned ${response.status}.`);
      const data = await response.json();
      if (data.schemaVersion !== 1 || !Array.isArray(data.gaps)) throw new Error('Unsupported gap register format.');
      body.replaceChildren();
      for (const gap of data.gaps) {
        const row = document.createElement('tr');
        cell(row, gap.gapId); cell(row, gap.tool); cell(row, gap.capability);
        const statusClass = gap.currentStatus === 'Complete' ? 'status-complete' : gap.currentStatus === 'Partial' ? 'status-partial' : 'status-not-started';
        cell(row, gap.currentStatus, statusClass); cell(row, gap.blockerType);
        cell(row, gap.ownerActionRequired); cell(row, gap.acceptanceTestName);
        body.append(row);
      }
      document.getElementById('gapCount').textContent = `${data.gaps.length} tracked gaps · source ${data.source}`;
    } catch (failure) {
      body.replaceChildren();
      const row = document.createElement('tr'), message = document.createElement('td');
      message.colSpan = 7; message.textContent = `Gap register unavailable: ${failure.message}`; row.append(message); body.append(row);
      document.getElementById('gapCount').textContent = 'Register unavailable';
    }
  }
  loadBuild();
  loadGaps();
})();
