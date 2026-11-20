(() => {
  'use strict';
  const root = document.querySelector('[data-operations-lab]');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const dialog = $('[data-lab-dialog]');
  let nodes, logs, selected, busy, timer;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const target = () => nodes.find(node => node.id === 'DEMO-18');
  const destination = () => $('[data-lab-destination]').value;
  const payload = () => ({ simulation: true, incident: 'DEMO-INC-40912', endpoint: target().id, destination: destination(), retryCount: target().attempts, error: 'SIMULATED_HTTP_504', circuit: target().circuit });
  const addLog = (severity, message) => { logs.unshift({ timestamp: new Date().toISOString(), severity, message }); };
  const notify = message => { $('[data-lab-feedback]').textContent = message; };
  function reset() {
    clearTimeout(timer); busy = false; logs = [];
    nodes = Array.from({ length:18 }, (_, i) => ({ id:`DEMO-${String(i + 1).padStart(2,'0')}`, state:i === 17 ? 'failed' : 'healthy', attempts:0, circuit:'CLOSED', queued:false }));
    selected = 'DEMO-18'; $('[data-lab-filter]').value = 'all'; $('[data-lab-search]').value = ''; $('[data-lab-severity]').value = 'ALL';
    if (dialog.open) dialog.close();
    addLog('WARN','DEMO-18 synthetic gateway timeout. Retry budget: 3.');
    addLog('INFO','Local training scenario initialised: 17 healthy nodes, 1 failed node.'); render();
  }
  function render() {
    const healthy = nodes.filter(node => node.state === 'healthy').length;
    const quarantined = nodes.filter(node => node.circuit === 'OPEN').length;
    const queued = nodes.filter(node => node.queued).length;
    const metrics = [['Fleet availability',`${(healthy / nodes.length * 100).toFixed(1)}%`, `${healthy}/${nodes.length} healthy (demo)`],['Retry attempts',`${target().attempts}/3`,'Synthetic webhook'],['Circuit breaker',quarantined ? 'OPEN' : 'CLOSED',`${quarantined} quarantined`],['Dead-letter queue',String(queued),'Locally buffered payloads']];
    $('[data-lab-metrics]').innerHTML = metrics.map(([title,value,subtitle]) => `<div class="ot-metric"><span class="ot-label">${title}</span><strong>${value}</strong><small>${subtitle}</small></div>`).join('');
    const filter = $('[data-lab-filter]').value;
    const query = $('[data-lab-search]').value.toLowerCase();
    const visible = nodes.filter(node => (filter === 'all' || filter === node.state) && node.id.toLowerCase().includes(query));
    $('[data-lab-nodes]').innerHTML = visible.map(node => `<button class="ot-node" type="button" data-node="${node.id}" data-state="${node.state}" aria-pressed="${selected === node.id}">${node.id}<small>${node.circuit === 'OPEN' ? 'QUARANTINED' : node.state.toUpperCase()}</small></button>`).join('') || '<p>No nodes match this filter.</p>';
    const node = nodes.find(item => item.id === selected);
    $('[data-lab-inspector]').innerHTML = `<h2>${node.id}</h2><p>Status: <strong>${node.state.toUpperCase()}</strong> · Circuit: ${node.circuit}</p><p>Destination: ${escape(destination())} (simulated)</p><p>Retry attempts: ${node.attempts}/3 · DLQ: ${node.queued ? 'Buffered' : 'Empty'}</p><p class="ot-notice">${node.circuit === 'OPEN' ? 'Circuit is open. The demo payload is isolated; other synthetic nodes can continue.' : 'This is a local training scenario. No real device state is available.'}</p>${node.queued ? '<button type="button" class="btn" data-lab-action="inspect">Inspect DLQ payload →</button>' : ''}`;
    root.querySelectorAll('[data-lab-action="batch"],[data-lab-action="retry"],[data-lab-action="probe"]').forEach(button => { button.disabled = busy || (button.dataset.labAction === 'retry' && (target().state === 'healthy' || target().circuit === 'OPEN')) || (button.dataset.labAction === 'probe' && target().circuit !== 'OPEN'); });
    renderLogs();
  }
  function renderLogs() { const filter = $('[data-lab-severity]').value; $('[data-lab-log]').textContent = logs.filter(event => filter === 'ALL' || event.severity === filter).map(event => `${event.timestamp} [${event.severity}] ${event.message}`).join('\n') || 'No matching events.'; }
  function renderPayload() {
    const tab = $('[data-lab-tab]').value;
    $('[data-lab-payload]').textContent = tab === 'headers' ? 'SIMULATED HTTP/2 504 Gateway Timeout\nContent-Type: application/json\nX-Training-Scenario: true' : tab === 'error' ? 'SimulationError: retry limit 3 reached\nCircuit transition: CLOSED -> OPEN\nPayload held in local demo DLQ' : JSON.stringify(payload(), null, 2);
  }
  function download(name, value) { const url = URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{ type:'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url),1000); }
  async function copyLog() {
    try { await navigator.clipboard.writeText($('[data-lab-log]').textContent); notify('Simulation log copied.'); } catch (_) { notify('Clipboard unavailable. Select the log text and copy it manually.'); }
  }
  function retry() {
    const node = target(); if (busy || node.state === 'healthy' || node.circuit === 'OPEN') return;
    const delay = 300 * 2 ** node.attempts; const route = destination(); busy = true; node.state = 'retrying'; addLog('INFO',`${node.id}: simulated backoff ${delay}ms; ${route} attempt ${node.attempts + 1}/3.`); render();
    timer = setTimeout(() => { node.attempts++; node.state = 'failed'; busy = false; addLog('WARN',`${node.id}: simulated HTTP 504 on attempt ${node.attempts}.`); if (node.attempts === 3) { node.circuit = 'OPEN'; node.queued = true; addLog('CRITICAL','Retry budget exhausted. Circuit OPEN; synthetic payload routed to local DLQ.'); selected = node.id; renderPayload(); $('[data-dry-run-status]').textContent = ''; dialog.showModal(); } render(); },delay);
  }
  function probe() {
    const node = target(); if (busy || node.circuit !== 'OPEN') return;
    busy = true; node.circuit = 'HALF-OPEN'; node.state = 'retrying'; addLog('INFO','Simulated half-open probe started.'); render();
    timer = setTimeout(() => { node.circuit = 'CLOSED'; node.state = 'healthy'; node.queued = false; node.attempts = 0; busy = false; addLog('INFO','Synthetic probe accepted. Circuit CLOSED; example payload replay complete.'); render(); },600);
  }
  root.addEventListener('click', event => {
    const node = event.target.closest('[data-node]'); if (node) { selected = node.dataset.node; render(); root.querySelector(`[data-node="${selected}"]`)?.focus(); return; }
    const action = event.target.closest('[data-lab-action]')?.dataset.labAction;
    switch (action) {
      case 'batch': if (busy) return; addLog('INFO',`Simulated ${destination()} batch: ${nodes.filter(node => node.state === 'healthy').length} healthy nodes ACKed locally; failed nodes excluded.`); render(); break;
      case 'retry': retry(); break;
      case 'probe': probe(); break;
      case 'inspect': $('[data-dry-run-status]').textContent = ''; renderPayload(); dialog.showModal(); break;
      case 'close': dialog.close(); break;
      case 'dryrun': { const valid = payload().simulation === true && target().queued && target().attempts === 3; $('[data-dry-run-status]').textContent = valid ? 'Local example schema passed. No request sent.' : 'No eligible buffered demo payload.'; addLog('INFO',`Local dry run ${valid ? 'passed' : 'not eligible'}; no network dispatch.`); renderLogs(); break; }
      case 'export': download('shiftstart-simulation-bundle.json',{ simulation:true, nodes, logs, destination:destination(), notice:'Fictional training data only.' }); break;
      case 'payload-export': download('shiftstart-demo-payload.json',payload()); break;
      case 'copy': copyLog(); break;
      case 'reset': reset(); notify('Simulation reset.'); break;
    }
  });
  root.addEventListener('input', event => { if (event.target.matches('[data-lab-search]')) render(); });
  root.addEventListener('change', event => { if (event.target.matches('[data-lab-filter],[data-lab-destination]')) render(); if (event.target.matches('[data-lab-severity]')) renderLogs(); if (event.target.matches('[data-lab-tab]')) renderPayload(); });
  reset();
})();
