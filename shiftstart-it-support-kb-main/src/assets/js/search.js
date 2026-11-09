(() => {
  const input = document.querySelector("#kb-search");
  const panel = document.querySelector("#search-results");
  if (!input || !panel || !window.lunr) return;
  let index, docs = {}, active = -1, results = [];

  Promise.all([
    fetch(`${window.KB_BASE}data/search-index.json`).then(r => r.json()),
    fetch(`${window.KB_BASE}data/search-documents.json`).then(r => r.json())
  ]).then(([serialized, documents]) => {
    index = lunr.Index.load(serialized);
    docs = Object.fromEntries(documents.map(d => [d.id, d]));
  }).catch(console.error);

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, results.length - 1); paint(); }
    if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); paint(); }
    if (e.key === "Enter" && active >= 0) location.href = results[active].url;
    if (e.key === "Escape") panel.classList.add("hidden");
  });

  input.addEventListener("input", () => {
    const q = input.value.trim(); active = -1;
    if (!index || q.length < 2) { panel.classList.add("hidden"); return; }
    try {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      const raw = index.query(builder => {
        terms.forEach(term => {
          builder.term(term, { boost: 10 });
          builder.term(term, { wildcard: lunr.Query.wildcard.TRAILING, boost: 5 });
          if (term.length > 3) builder.term(term, { editDistance: 1, boost: 3 });
        });
      });
      results = raw.slice(0, 10).map(r => docs[r.ref]).filter(Boolean);
      if (!results.length) logZero(q);
      paint();
    } catch (e) { console.warn("Search query rejected", e); }
  });

  function paint() {
    panel.innerHTML = results.length ? results.map((d, i) => `<a role="option" class="search-result ${i === active ? "active" : ""}" href="${d.url}"><div class="flex justify-between gap-3"><strong>${escapeHtml(d.title)}</strong><span class="badge">${escapeHtml(d.type)}</span></div><p class="mt-1 text-sm text-slate-600">${escapeHtml(d.description || "")}</p></a>`).join("") : '<p class="p-4 text-sm text-slate-600">No results. Try an error code, device, or simpler symptom.</p>';
    panel.classList.remove("hidden");
  }
  function logZero(query) {
    const payload = { query, at: new Date().toISOString(), path: location.pathname };
    console.info("KB zero-result search", payload);
    const endpoint = window.KB_CONFIG?.zeroResultEndpoint;
    if (endpoint) fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(console.warn);
  }
  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
})();
