(() => {
  'use strict';
  const cfg = window.KB_CONFIG || {};
  const enterpriseCfg = cfg.enterprise || {};
  const base = (window.KB_BASE || '/').replace(/\/?$/, '/');
  const state = { catalog: null, catalogPromise: null, commandResults: [], commandActive: -1 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderControls();
    initDialogs();
    initCommandPalette();
    initExplorer();
    initDashboard();
    initProcedureActions(document);
    initAffiliateTracking();
    initAffiliateAdmin();
  });

  function esc(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  }

  function normalize(value) {
    return String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9._-]+/g, ' ').trim();
  }
  function toArray(value) { return Array.isArray(value) ? value : (value == null || value === '' ? [] : [value]); }

  function showProgress(show = true) {
    const bar = $('[data-load-progress]');
    if (bar) bar.hidden = !show;
  }

  function toast(message, tone = 'info') {
    const region = $('[data-ss-toast-region]');
    if (!region) return;
    const item = document.createElement('div');
    item.className = `ss-toast ss-toast-${tone}`;
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(() => item.remove(), 3200);
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
  }

  function initHeaderControls() {
    const actions = $('.rd-header-actions');
    if (!actions || actions.querySelector('[data-command-trigger]')) return;
    const mobileButton = actions.querySelector('[data-menu-toggle]');
    const command = document.createElement('button');
    command.type = 'button'; command.className = 'ss-header-control'; command.dataset.commandTrigger = '';
    command.innerHTML = '<span class="ss-command-icon" aria-hidden="true">⌕</span><span class="ss-command-label">Command</span><kbd>Ctrl K</kbd>';
    command.setAttribute('aria-label', 'Open command palette');
    const theme = document.createElement('button');
    theme.type = 'button'; theme.className = 'ss-header-control ss-theme-toggle'; theme.dataset.themeToggle = '';
    theme.setAttribute('aria-label', 'Toggle dark mode');
    const avatar = document.createElement('span');
    avatar.className = 'ss-user-avatar'; avatar.setAttribute('aria-label', 'Technician session'); avatar.title = 'Technician session'; avatar.textContent = 'IT';
    actions.insertBefore(command, mobileButton || null); actions.insertBefore(theme, mobileButton || null); actions.insertBefore(avatar, mobileButton || null);
    updateThemeButton(theme);
    theme.addEventListener('click', toggleTheme);
  }

  function currentTheme() { return document.documentElement.dataset.theme || 'light'; }
  function updateThemeButton(button = $('[data-theme-toggle]')) { if (button) button.textContent = currentTheme() === 'dark' ? '☀' : '☾'; }
  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('shiftstart-theme', next);
    updateThemeButton();
    toast(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled.`);
  }

  async function loadCatalog() {
    if (state.catalog) return state.catalog;
    if (state.catalogPromise) return state.catalogPromise;
    showProgress(true);
    state.catalogPromise = fetch(`${base}assets/data/enterprise-catalog.json`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`Enterprise catalog ${r.status}`); return r.json(); })
      .then(data => (state.catalog = data))
      .finally(() => showProgress(false));
    return state.catalogPromise;
  }

  function initDialogs() {
    document.addEventListener('click', event => {
      const openRequest = event.target.closest('[data-open-request-modal]');
      if (openRequest) { openDialog($('[data-request-dialog]')); return; }
      const openEdit = event.target.closest('[data-open-edit-modal]');
      if (openEdit) { fillProcedureIds(); openDialog($('[data-edit-dialog]')); return; }
      const openError = event.target.closest('[data-open-error-modal]');
      if (openError) { fillProcedureIds(); openDialog($('[data-error-dialog]')); return; }
      const close = event.target.closest('[data-close-dialog]');
      if (close) { close.closest('dialog')?.close(); return; }
    });
    $('[data-request-form]')?.addEventListener('submit', event => submitStructuredForm(event, 'procedure-request', enterpriseCfg.requestProcedureEndpoint, 'Procedure request'));
    $('[data-edit-form]')?.addEventListener('submit', event => submitStructuredForm(event, 'edit-suggestion', enterpriseCfg.editSuggestionEndpoint, 'Edit suggestion'));
    $('[data-error-form]')?.addEventListener('submit', event => submitStructuredForm(event, 'error-report', enterpriseCfg.errorReportEndpoint, 'Error report'));
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    requestAnimationFrame(() => dialog.querySelector('input:not([type=hidden]),select,textarea')?.focus());
  }

  function fillProcedureIds() {
    const article = $('[data-procedure-id]');
    const id = article?.dataset.procedureId || new URL(location.href).searchParams.get('procedure') || location.pathname.split('/').filter(Boolean).pop() || 'site-general';
    $$('[data-modal-procedure-id]').forEach(input => { input.value = id; });
  }

  async function submitStructuredForm(event, storageType, endpoint, label) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.type = storageType; payload.url = location.href; payload.createdAt = new Date().toISOString();
    const key = `shiftstart:${storageType}:queue`;
    const queue = JSON.parse(localStorage.getItem(key) || '[]'); queue.push(payload); localStorage.setItem(key, JSON.stringify(queue.slice(-100)));
    if (endpoint) {
      showProgress(true);
      try {
        const response = await fetch(endpoint, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload) });
        if (!response.ok) throw new Error(`Endpoint ${response.status}`);
        toast(`${label} submitted.`, 'success');
      } catch (error) {
        await copyText(JSON.stringify(payload, null, 2));
        toast(`${label} saved locally; endpoint unavailable. A copy is on your clipboard.`, 'warning');
        console.warn(error);
      } finally { showProgress(false); }
    } else {
      await copyText(JSON.stringify(payload, null, 2));
      toast(`${label} saved locally and copied for manual submission.`, 'success');
    }
    form.closest('dialog')?.close(); form.reset();
  }

  function initCommandPalette() {
    const dialog = $('[data-command-dialog]');
    const input = $('[data-command-input]');
    const results = $('[data-command-results]');
    if (!dialog || !input || !results) return;
    const keyLabel = $('[data-command-key]');
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) keyLabel.textContent = '⌘ K';

    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); openDialog(dialog); loadCatalog().catch(() => toast('Search catalog could not be loaded.', 'warning'));
      }
      if (!dialog.open) return;
      if (event.key === 'ArrowDown' && state.commandResults.length) { event.preventDefault(); state.commandActive = Math.min(state.commandActive + 1, state.commandResults.length - 1); updateCommandActive(); }
      if (event.key === 'ArrowUp' && state.commandResults.length) { event.preventDefault(); state.commandActive = Math.max(state.commandActive - 1, 0); updateCommandActive(); }
      if (event.key === 'Enter' && state.commandActive >= 0) { const target = results.querySelector(`[data-command-index="${state.commandActive}"]`); if (target) { event.preventDefault(); target.click(); } }
    });
    document.addEventListener('click', event => { if (event.target.closest('[data-command-trigger]')) { openDialog(dialog); loadCatalog(); } });
    let timer;
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => renderCommandResults(input.value), 70); });
    dialog.addEventListener('close', () => { state.commandResults = []; state.commandActive = -1; input.value=''; results.innerHTML='<div class="ss-command-hint"><strong>Start typing to search</strong><p>Results are grouped by symptom, procedure name and error code.</p></div>'; $('[data-command-correction]').hidden=true; });
  }

  async function renderCommandResults(queryRaw) {
    const target = $('[data-command-results]');
    const correction = $('[data-command-correction]');
    const query = normalize(queryRaw);
    if (!query) { target.innerHTML='<div class="ss-command-hint"><strong>Start typing to search</strong><p>Results are grouped by symptom, procedure name and error code.</p></div>'; correction.hidden=true; return; }
    let data;
    try { data = await loadCatalog(); } catch { target.innerHTML='<div class="ss-command-hint"><strong>Catalog unavailable</strong><p>Use the standard search or procedure explorer.</p></div>'; return; }
    const items = [...(data.symptoms || []), ...(data.procedures || [])];
    const scored = items.map(item => scoreCatalogItem(item, query)).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,18);
    state.commandResults = scored; state.commandActive = -1;
    const suggestion = findCorrection(query, dictionaryFromCatalog(data));
    if (suggestion && suggestion !== query && !scored.some(x => x.exact)) { correction.hidden=false; correction.innerHTML=`Showing closest matches for <strong>${esc(suggestion)}</strong> (typed “${esc(queryRaw)}”).`; }
    else correction.hidden=true;
    if (!scored.length) { target.innerHTML='<div class="ss-command-hint"><strong>No matching knowledge</strong><p>Try fewer words, another error code or request a new procedure.</p></div>'; return; }
    const groups = { 'Symptom': [], 'Procedure Name': [], 'Error Code': [] };
    scored.forEach(result => groups[result.kind].push(result));
    let flatIndex = 0;
    target.innerHTML = Object.entries(groups).filter(([,list])=>list.length).map(([name,list]) => `<section class="ss-command-group"><strong>${name}</strong>${list.map(result => { const idx=flatIndex++; result.flatIndex=idx; return `<a class="ss-command-result" href="${esc(result.item.url)}" data-command-index="${idx}" data-command-kind="${esc(result.kind)}"><div><strong>${esc(result.item.title)}</strong><small>${esc(result.item.category || result.item.description || '')}</small></div><span>${result.item.priority ? esc(result.item.priority) : esc(result.item.type)}</span></a>`; }).join('')}</section>`).join('');
    target.querySelectorAll('[data-command-index]').forEach(link => link.addEventListener('click', () => { const r = scored.find(x => x.flatIndex === Number(link.dataset.commandIndex)); if (r?.item.type === 'symptom') recordSymptomSearch(r.item.title); }));
  }

  function scoreCatalogItem(item, query) {
    const title = normalize(item.title); const desc = normalize(item.description); const category = normalize(item.category); const errorCodes = toArray(item.errorCodes).map(normalize);
    let score = 0; let exact = false; let kind = item.type === 'symptom' ? 'Symptom' : 'Procedure Name';
    if (title === query) { score += 120; exact=true; }
    if (title.startsWith(query)) score += 80;
    if (title.includes(query)) score += 55;
    if (category.includes(query)) score += 22;
    if (desc.includes(query)) score += 16;
    if (errorCodes.some(code => code === query || code.includes(query))) { score += 110; exact = errorCodes.some(code=>code===query); kind='Error Code'; }
    const qTokens = query.split(/\s+/).filter(Boolean); const titleTokens = title.split(/\s+/);
    qTokens.forEach(q => { const best = Math.min(...titleTokens.map(t => levenshtein(q,t))); if (q.length >= 4 && best <= 2) score += (3-best)*11; });
    if (!score) return null;
    return { item, score, exact, kind };
  }

  function updateCommandActive() {
    $$('[data-command-index]').forEach(el => el.classList.toggle('is-active', Number(el.dataset.commandIndex) === state.commandActive));
    $('[data-command-index="'+state.commandActive+'"]')?.scrollIntoView({block:'nearest'});
  }

  function levenshtein(a,b) {
    if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
    const prev = Array.from({length:b.length+1},(_,i)=>i); const curr = new Array(b.length+1);
    for (let i=1;i<=a.length;i++){ curr[0]=i; for(let j=1;j<=b.length;j++){ curr[j]=Math.min(curr[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)); } for(let j=0;j<=b.length;j++) prev[j]=curr[j]; }
    return prev[b.length];
  }

  function dictionaryFromCatalog(data) {
    const set = new Set(); [...(data.procedures||[]),...(data.symptoms||[])].forEach(item => normalize(`${item.title} ${item.category}`).split(/\s+/).forEach(w => { if(w.length>=4)set.add(w); })); return [...set];
  }
  function findCorrection(query, dictionary) {
    const tokens = normalize(query).split(/\s+/).filter(Boolean); let changed=false;
    const fixed=tokens.map(token=>{ if(token.length<4||dictionary.includes(token))return token; let best=token,bestD=3; for(const word of dictionary){ if(Math.abs(word.length-token.length)>2)continue; const d=levenshtein(token,word); if(d<bestD){bestD=d;best=word;if(d===1)break;} } if(best!==token)changed=true; return best; });
    return changed ? fixed.join(' ') : query;
  }

  function initExplorer() {
    const root = $('[data-enterprise-explorer]'); if (!root) return;
    const rows = $$('[data-procedure-row]', root); const tbody = $('[data-procedure-rows]', root); const search = $('[data-explorer-search]', root); const count = $('[data-explorer-count]', root); const correction = $('[data-explorer-correction]', root); const empty = $('[data-grid-empty]', root);
    const model = { chips:new Set(), category:'', query:'', sortKey:'priority', direction:1 };
    buildCategoryTree(rows, root, model, apply);

    $$('[data-filter-chip]', root).forEach(chip => chip.addEventListener('click', () => {
      const name=chip.dataset.filterChip;
      if(name==='all'){model.chips.clear();model.category='';search.value='';model.query='';}
      else { if(['verified','under_review'].includes(name)){model.chips.delete('verified');model.chips.delete('under_review');} model.chips.has(name)?model.chips.delete(name):model.chips.add(name); }
      syncChips(); apply();
    }));
    search.addEventListener('input',()=>{model.query=normalize(search.value);apply();});
    $$('[data-sort-key]',root).forEach(btn=>btn.addEventListener('click',()=>{ const key=btn.dataset.sortKey; model.direction=model.sortKey===key?model.direction*-1:1; model.sortKey=key; apply(); }));
    $$('[data-reset-explorer]',root).forEach(btn=>btn.addEventListener('click',()=>{model.chips.clear();model.category='';model.query='';search.value='';syncChips();apply();}));
    tbody.addEventListener('click', event => { const opener=event.target.closest('[data-open-procedure]'); if(!opener)return; const row=opener.closest('[data-procedure-row]'); rows.forEach(r=>r.classList.toggle('is-selected',r===row)); loadDetail(row.dataset.url,row.dataset.id); });
    $('[data-tree-collapse-all]',root)?.addEventListener('click',()=>$$('.ss-category-tree details[open]',root).forEach(d=>d.open=false));

    function syncChips(){ $$('[data-filter-chip]',root).forEach(c=>{const active=c.dataset.filterChip==='all'?model.chips.size===0&&!model.category&&!model.query:model.chips.has(c.dataset.filterChip);c.classList.toggle('is-active',active);c.setAttribute('aria-pressed',String(active));}); }
    function matches(row, q){
      const searchText=normalize(row.dataset.search); if(q&&!searchText.includes(q))return false;
      if(model.category&&!row.dataset.category.toLowerCase().startsWith(model.category.toLowerCase()))return false;
      if(model.chips.has('verified')&&row.dataset.status!=='verified')return false;
      if(model.chips.has('under_review')&&!['under_review','live_validation_pending','revalidation_required'].includes(row.dataset.status))return false;
      if(model.chips.has('critical')&&!['P0','P1'].includes(row.dataset.priority))return false;
      const domainChips=['windows','linux','network','security'].filter(x=>model.chips.has(x)); if(domainChips.length&&!domainChips.some(x=>searchText.includes(x)))return false;
      return true;
    }
    function apply(){
      let q=model.query; let visible=rows.filter(r=>matches(r,q));
      if(q&&!visible.length){ const dictionary=[...new Set(rows.flatMap(r=>normalize(`${r.dataset.titleDisplay} ${r.dataset.category}`).split(/\s+/)).filter(w=>w.length>=4))]; const fixed=findCorrection(q,dictionary); if(fixed!==q){ const attempt=rows.filter(r=>matches(r,fixed)); if(attempt.length){visible=attempt;correction.hidden=false;correction.innerHTML=`Showing results for <strong>${esc(fixed)}</strong> (typed “${esc(search.value)}”).`; q=fixed;} else correction.hidden=true;} else correction.hidden=true; } else correction.hidden=true;
      const visibleSet=new Set(visible); rows.forEach(r=>r.hidden=!visibleSet.has(r));
      const sorted=[...visible].sort((a,b)=>compareRows(a,b,model.sortKey)*model.direction); sorted.forEach(r=>tbody.appendChild(r));
      count.textContent=`Showing ${visible.length} of ${rows.length} procedures`; empty.hidden=visible.length!==0; syncChips();
    }
    apply();
  }

  function compareRows(a,b,key){
    if(key==='priority')return Number(a.dataset.priorityOrder)-Number(b.dataset.priorityOrder);
    const map={title:'titleDisplay',status:'status',updated:'updated',owner:'owner'}; const field=map[key]||'titleDisplay'; return String(a.dataset[field]||'').localeCompare(String(b.dataset[field]||''),undefined,{numeric:true,sensitivity:'base'});
  }

  function buildCategoryTree(rows, root, model, apply) {
    const target=$('[data-category-tree]',root); if(!target)return;
    const tree={children:new Map(),count:rows.length,path:''};
    rows.forEach(row=>{ const raw=row.dataset.category||'Uncategorised'; const parts=raw.split(/\s*(?:>|\/|::)\s*/).filter(Boolean); let node=tree; let path=[]; parts.forEach(part=>{path.push(part);if(!node.children.has(part))node.children.set(part,{children:new Map(),count:0,path:path.join(' > ')});node=node.children.get(part);node.count++;}); });
    const renderNode=node=>[...node.children.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([name,child])=>{ const nested=child.children.size>0; return nested?`<details><summary><span>${esc(name)}</span><span class="ss-tree-count">${child.count}</span></summary><button class="ss-tree-leaf" type="button" data-category-filter="${esc(child.path)}"><span>All ${esc(name)}</span><span class="ss-tree-count">${child.count}</span></button>${renderNode(child)}</details>`:`<button class="ss-tree-leaf" type="button" data-category-filter="${esc(child.path)}"><span>${esc(name)}</span><span class="ss-tree-count">${child.count}</span></button>`;}).join('');
    target.innerHTML=`<button class="ss-tree-leaf is-active" type="button" data-category-filter=""><span>All procedures</span><span class="ss-tree-count">${rows.length}</span></button>${renderNode(tree)}`;
    target.addEventListener('click',e=>{const button=e.target.closest('[data-category-filter]');if(!button)return;model.category=button.dataset.categoryFilter;$$('[data-category-filter]',target).forEach(x=>x.classList.toggle('is-active',x===button));apply();});
  }

  async function loadDetail(url,id){
    const rail=$('[data-detail-rail]'); const content=$('[data-detail-content]'); const placeholder=$('[data-detail-placeholder]'); if(!rail||!content)return;
    rail.classList.add('is-open'); placeholder.hidden=true; content.hidden=false; content.innerHTML='<div class="ss-detail-loader" aria-label="Loading procedure"><i></i><i></i><i></i><i></i></div>'; showProgress(true);
    try{
      const response=await fetch(url,{cache:'no-store'}); if(!response.ok)throw new Error(`Procedure ${response.status}`); const html=await response.text(); const doc=new DOMParser().parseFromString(html,'text/html'); const article=doc.querySelector('[data-article-page]'); if(!article)throw new Error('Procedure markup unavailable');
      const pieces=['.rd-article-header','.ss-executive-summary','.ss-metadata-strip','.ss-governance-grid','.ss-lifecycle','.assurance-banner','[data-enterprise-detail-source]']; const selected=pieces.map(s=>article.querySelector(s)).filter(Boolean).map(node=>node.outerHTML).join('');
      content.innerHTML=`<div class="ss-detail-loaded"><a class="ss-detail-open-full" href="${esc(url)}">Open full procedure page ↗</a>${selected}</div>`; history.pushState({procedure:id},'',`${base}procedures/?procedure=${encodeURIComponent(id)}`);
    }catch(error){content.innerHTML='<div class="ss-grid-empty"><strong>Procedure could not be loaded</strong><p>Open the full procedure page or try again.</p></div>';toast('Procedure detail could not be loaded.','warning');console.warn(error);}finally{showProgress(false);}
  }

  function initDashboard(){
    const root=$('[data-enterprise-dashboard]'); if(!root)return;
    loadCatalog().then(data=>{
      renderCriticalWidget(data); renderRecentWidget(data); renderSearchWidget(); renderHealthWidget(data);
    }).catch(error=>{root.querySelectorAll('[data-widget-critical],[data-widget-recent],[data-widget-searches],[data-widget-health]').forEach(x=>x.innerHTML='<p>Dashboard data unavailable.</p>');console.warn(error);});
  }
  function renderCriticalWidget(data){ const target=$('[data-widget-critical]'); if(!target)return; const list=(data.procedures||[]).filter(p=>['P0','P1'].includes(p.priority)&&p.governanceStatus!=='deprecated'&&p.governanceStatus!=='verified').slice(0,6); target.innerHTML=list.length?`<div class="ss-widget-list">${list.map(p=>`<div class="ss-widget-row"><span class="ss-priority ss-priority-${p.priority.toLowerCase()}">${p.priority}</span><a href="${esc(p.url)}">${esc(p.title)}</a><small>${esc((p.governanceStatus||p.contentStatus).replaceAll('_',' '))}</small></div>`).join('')}</div>`:'<p>No open P0/P1 knowledge items.</p>'; }
  function renderRecentWidget(data){ const target=$('[data-widget-recent]'); if(!target)return; const list=(data.procedures||[]).filter(p=>p.governanceStatus==='verified'&&p.evidenceComplete).sort((a,b)=>String(b.lastUpdated).localeCompare(String(a.lastUpdated))).slice(0,5); target.innerHTML=list.length?`<div class="ss-widget-list">${list.map(p=>`<div class="ss-widget-row"><span class="ss-status-pill ss-status-verified">✓</span><a href="${esc(p.url)}">${esc(p.title)}</a><time>${esc(p.lastUpdated||'Not recorded')}</time></div>`).join('')}</div>`:'<div class="ss-command-hint"><strong>No evidence-complete verified procedures yet</strong><p>Legacy verified statuses are excluded until the current evidence gate is complete.</p></div>'; }
  function weekKey(){const d=new Date();const year=d.getUTCFullYear();const start=new Date(Date.UTC(year,0,1));const day=Math.floor((d-start)/86400000);return `${year}-W${String(Math.ceil((day+start.getUTCDay()+1)/7)).padStart(2,'0')}`;}
  function recordSymptomSearch(title){const key=`shiftstart:symptom-searches:${weekKey()}`;const data=JSON.parse(localStorage.getItem(key)||'{}');data[title]=(data[title]||0)+1;localStorage.setItem(key,JSON.stringify(data));}
  function renderSearchWidget(){const target=$('[data-widget-searches]');if(!target)return;const data=JSON.parse(localStorage.getItem(`shiftstart:symptom-searches:${weekKey()}`)||'{}');const list=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,5);target.innerHTML=list.length?`<div class="ss-widget-list">${list.map(([title,n],i)=>`<div class="ss-widget-row"><span class="ss-priority ss-priority-p4">${i+1}</span><span>${esc(title)}</span><small>${n} search${n===1?'':'es'}</small></div>`).join('')}</div>`:'<div class="ss-command-hint"><strong>No symptom search telemetry yet</strong><p>Command-palette symptom selections will appear here for this browser.</p></div>';}
  function renderHealthWidget(data){const target=$('[data-widget-health]');if(!target)return;const systems=[['Windows',['windows']],['Exchange / M365',['exchange','microsoft 365','outlook']],['Entra ID / Azure AD',['entra','azure ad','active directory']],['VPN',['vpn']],['DNS',['dns']],['Network',['network','lan','wan']],['Printing',['printer','print']],['Linux',['linux']],['macOS',['macos','mac']],['Security / Defender',['security','defender','ransomware']]];target.innerHTML=systems.map(([name,keywords])=>{const matches=(data.procedures||[]).filter(p=>{const h=normalize(`${p.title} ${p.category} ${toArray(p.tags).join(' ')}`);return keywords.some(k=>h.includes(k));});const complete=matches.filter(p=>p.evidenceComplete).length;const ratio=matches.length?complete/matches.length:0;const tone=ratio>=.8?'green':ratio>0?'amber':'red';return `<div class="ss-health-item"><span><i class="ss-health-light ss-health-${tone}"></i>${esc(name)}</span><small>${complete}/${matches.length} evidence-complete</small></div>`;}).join('');}

  function initProcedureActions(root){
    root.addEventListener?.('click',async event=>{
      const copy=event.target.closest('[data-copy-procedure]'); if(copy){const article=copy.closest('[data-article-page]')||$('[data-article-page]');const text=article?.querySelector('[data-article-body]')?.innerText||article?.innerText||'';await copyText(text);toast('Procedure copied to clipboard.','success');return;}
      const exportPdf=event.target.closest('[data-export-pdf]'); if(exportPdf){showProgress(true);toast('Preparing print/PDF view…');setTimeout(()=>{showProgress(false);window.print();},350);return;}
      const print=event.target.closest('[data-print-procedure]:not([data-export-pdf])'); if(print){window.print();return;}
    });
  }

  function initAffiliateTracking(){
    document.addEventListener('click',event=>{const link=event.target.closest('[data-affiliate-link]');if(!link)return;const payload={affiliateId:link.dataset.affiliateId||'unknown',commissionModel:link.dataset.commissionModel||'not recorded',procedureId:link.closest('[data-procedure-id]')?.dataset.procedureId||'',url:link.href,clickedAt:new Date().toISOString()};const key='shiftstart:affiliate-clicks';const clicks=JSON.parse(localStorage.getItem(key)||'[]');clicks.push(payload);localStorage.setItem(key,JSON.stringify(clicks.slice(-1000)));if(enterpriseCfg.affiliateTrackingEndpoint)fetch(enterpriseCfg.affiliateTrackingEndpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}).catch(console.warn);});
  }

  function initAffiliateAdmin(){
    const root=$('[data-affiliate-admin]');if(!root)return;const clicks=JSON.parse(localStorage.getItem('shiftstart:affiliate-clicks')||'[]');const byId={};clicks.forEach(c=>{byId[c.affiliateId]=(byId[c.affiliateId]||0)+1;});const rows=$('[data-affiliate-admin-rows]',root);const total=$('[data-affiliate-total]',root);const unique=$('[data-affiliate-unique]',root);if(total)total.textContent=clicks.length;if(unique)unique.textContent=Object.keys(byId).length;if(rows)rows.innerHTML=clicks.slice().reverse().slice(0,100).map(c=>`<tr><td>${esc(c.clickedAt)}</td><td>${esc(c.affiliateId)}</td><td>${esc(c.procedureId||'—')}</td><td>${esc(c.commissionModel)}</td></tr>`).join('')||'<tr><td colspan="4">No local affiliate click records yet.</td></tr>';
    $('[data-export-affiliate]',root)?.addEventListener('click',()=>{const csv=['clickedAt,affiliateId,procedureId,commissionModel',...clicks.map(c=>[c.clickedAt,c.affiliateId,c.procedureId,c.commissionModel].map(v=>`"${String(v||'').replaceAll('"','""')}"`).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='shiftstart-affiliate-clicks.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);});
  }
})();
