(() => {
  const input = document.querySelector('#kb-search');
  const panel = document.querySelector('#search-results');
  const clearButton = document.querySelector('[data-search-clear]');
  const status = document.querySelector('#search-status');
  if (!input || !panel || !window.lunr) return;

  let index, docs = {}, active = -1, results = [], debounceTimer, ready = false;

  Promise.all([
    fetch(`${window.KB_BASE}assets/data/search-index.json`).then(r => { if (!r.ok) throw new Error(`Search index ${r.status}`); return r.json(); }),
    fetch(`${window.KB_BASE}assets/data/search-documents.json`).then(r => { if (!r.ok) throw new Error(`Search documents ${r.status}`); return r.json(); })
  ]).then(([serialized, documents]) => {
    index = lunr.Index.load(serialized);
    docs = Object.fromEntries(documents.map(d => [d.id, d]));
    ready = true;
  }).catch(error => { status.textContent = 'Search could not be loaded.'; console.error(error); });

  document.addEventListener('keydown', event => {
    const editable = /input|textarea|select/i.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if (event.key === '/' && !editable) { event.preventDefault(); input.focus(); return; }
    if (document.activeElement !== input && !panel.contains(document.activeElement)) return;
    if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); active = Math.min(active + 1, results.length - 1); updateActive(); }
    if (event.key === 'ArrowUp' && results.length) { event.preventDefault(); active = Math.max(active - 1, 0); updateActive(); }
    if (event.key === 'Enter' && active >= 0) { event.preventDefault(); location.href = results[active].url; }
    if (event.key === 'Escape') closeResults();
  });

  input.addEventListener('input', () => {
    clearButton.hidden = !input.value;
    active = -1;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(search, 100);
  }, { passive: true });
  input.addEventListener('focus', () => { if (input.value.trim().length >= 2 && results.length) render(); });
  clearButton.addEventListener('click', () => { input.value = ''; clearButton.hidden = true; results = []; closeResults(); input.focus(); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('[data-search-region]')) closeResults(); }, { passive: true });

  function search() {
    const query = input.value.trim();
    if (!ready || query.length < 2) { results = []; closeResults(); return; }
    try {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const raw = index.query(builder => terms.forEach(term => {
        builder.term(term, { boost: 10 });
        builder.term(term, { wildcard: lunr.Query.wildcard.TRAILING, boost: 5 });
        if (term.length > 3) builder.term(term, { editDistance: 1, boost: 2 });
      }));
      results = raw.slice(0, 8).map(r => docs[r.ref]).filter(Boolean);
      render();
    } catch (error) {
      results = [];
      panel.innerHTML = '<div class="rd-search-empty">Try fewer words or an exact error code.</div>';
      openResults();
    }
  }

  function render() {
    const query = encodeURIComponent(input.value.trim());
    panel.innerHTML = results.length
      ? results.map((d, i) => `<a id="kb-search-result-${i}" class="search-result rd-search-result${i === active ? ' active' : ''}" href="${d.url}" role="option" aria-selected="${i === active}" data-result-index="${i}"><div class="rd-search-result-top"><strong>${esc(d.title)}</strong><span class="badge">${esc(d.type)}</span></div><p>${esc(d.description || '')}</p><div class="rd-search-result-meta">${meta(d)}</div></a>`).join('') + `<a class="rd-view-all-results" href="${window.KB_BASE}search/?q=${query}">View all results →</a>`
      : `<div class="rd-search-empty"><strong>No results</strong><p>Try a simpler symptom or use the wizard.</p><a href="${window.KB_BASE}wizard/">Open symptom wizard →</a></div>`;
    status.textContent = results.length ? `${results.length} suggestions available.` : 'No search suggestions.';
    openResults();
    panel.querySelectorAll('[data-result-index]').forEach(el => el.addEventListener('mousemove', () => { active = Number(el.dataset.resultIndex); updateActive(); }, { passive: true }));
  }

  function meta(d) { return [d.category, d.severity ? `${d.severity} risk` : '', d.supportTier || '', d.contentStatus ? d.contentStatus.replaceAll('_', ' ') : ''].filter(Boolean).map(esc).join(' · '); }
  function updateActive() {
    panel.querySelectorAll('[data-result-index]').forEach(el => {
      const on = Number(el.dataset.resultIndex) === active;
      el.classList.toggle('active', on); el.setAttribute('aria-selected', String(on));
      if (on) { input.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); }
    });
    if (active < 0) input.removeAttribute('aria-activedescendant');
  }
  function openResults() { panel.classList.remove('hidden'); input.setAttribute('aria-expanded', 'true'); }
  function closeResults() { panel.classList.add('hidden'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
  function esc(value) { const div = document.createElement('div'); div.textContent = value ?? ''; return div.innerHTML; }
})();
