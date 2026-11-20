(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => { initOnboarding(); initCatalogue(); initArticle(); initSearchPage(); });

  function initOnboarding() {
    const block = document.querySelector('[data-onboarding]');
    if (!block) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem('shiftstart:onboarding:v1') === 'dismissed'; } catch {}
    if (!dismissed) block.hidden = false;
    block.querySelector('[data-dismiss-onboarding]')?.addEventListener('click', () => {
      block.hidden = true;
      try { localStorage.setItem('shiftstart:onboarding:v1', 'dismissed'); } catch {}
    });
  }

  function initCatalogue() {
    const root = document.querySelector('[data-catalog-root]');
    if (!root) return;
    const q = root.querySelector('[data-catalog-search]');
    const category = root.querySelector('[data-catalog-category]');
    const risk = root.querySelector('[data-catalog-risk]');
    const status = root.querySelector('[data-catalog-status]');
    const tier = root.querySelector('[data-catalog-tier]');
    const sort = root.querySelector('[data-catalog-sort]');
    const container = root.querySelector('[data-catalog-items]');
    const items = [...root.querySelectorAll('.catalog-item')];
    const count = root.querySelector('[data-catalog-count]');
    const empty = root.querySelector('[data-catalog-empty]');
    const active = root.querySelector('[data-active-filters]');
    let frame;
    const params = new URLSearchParams(location.search);
    setFromParam(category, 'category'); setFromParam(risk, 'risk'); setFromParam(status, 'status'); setFromParam(tier, 'tier');
    if (q && params.get('q')) q.value = params.get('q');

    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const term = q?.value.trim().toLowerCase() || '';
        const cat = category?.value || 'all', rv = risk?.value || 'all', sv = status?.value || 'all', tv = tier?.value || 'all';
        let visible = items.filter(item => (!term || item.dataset.search.includes(term)) && (cat === 'all' || item.dataset.category === cat) && (rv === 'all' || item.dataset.risk === rv) && (sv === 'all' || item.dataset.status === sv) && (tv === 'all' || item.dataset.tier === tv));
        items.forEach(item => item.hidden = !visible.includes(item));
        if (sort && container) { visible = [...visible].sort((a,b) => compare(a,b,sort.value)); visible.forEach(item => container.appendChild(item)); }
        if (count) count.textContent = `Showing ${visible.length} of ${items.length} articles.`;
        if (empty) empty.hidden = visible.length !== 0;
        renderActive(active, { term, cat, rv, sv, tv });
        syncUrl({ q: term, category: cat, risk: rv, status: sv, tier: tv, sort: sort?.value || '' });
      });
    };
    [q, category, risk, status, tier, sort].filter(Boolean).forEach(control => control.addEventListener(control === q ? 'input' : 'change', apply, { passive: control === q }));
    root.querySelectorAll('[data-catalog-reset]').forEach(button => button.addEventListener('click', () => { if (q) q.value = ''; [category,risk,status,tier].filter(Boolean).forEach(s => s.value='all'); if (sort) sort.value='name'; apply(); q?.focus(); }));
    apply();

    function setFromParam(select, key) { if (!select) return; const value = params.get(key); if ([...select.options].some(o => o.value === value)) select.value = value; }
  }

  function compare(a,b,mode) {
    if (mode === 'risk') { const rank={critical:4,high:3,medium:2,low:1,'':0}; return (rank[b.dataset.risk]||0)-(rank[a.dataset.risk]||0) || a.dataset.title.localeCompare(b.dataset.title); }
    if (mode === 'verified') { const rank={verified:3,under_review:2,draft:1,deprecated:0,'':0}; return (rank[b.dataset.status]||0)-(rank[a.dataset.status]||0) || a.dataset.title.localeCompare(b.dataset.title); }
    return a.dataset.title.localeCompare(b.dataset.title);
  }
  function renderActive(target, v) {
    if (!target) return;
    const entries=[]; if(v.term)entries.push(`Search: ${v.term}`); if(v.cat!=='all')entries.push(v.cat); if(v.rv!=='all')entries.push(`${v.rv} risk`); if(v.sv!=='all')entries.push(v.sv.replaceAll('_',' ')); if(v.tv!=='all')entries.push(v.tv);
    target.innerHTML=entries.map(x=>`<span>${escapeHtml(x)}</span>`).join('');
  }
  function syncUrl(values) {
    const url=new URL(location.href); Object.entries(values).forEach(([key,value])=>{ if(!value||value==='all'||(key==='sort'&&value==='name'))url.searchParams.delete(key);else url.searchParams.set(key,value); }); history.replaceState(null,'',url);
  }

  function initArticle() {
    const article=document.querySelector('[data-article-page]'); if(!article)return;
    const body=article.querySelector('[data-article-body]'), toc=article.querySelector('[data-article-toc]'), sidebar=article.querySelector('[data-article-sidebar]');
    if(body&&toc){
      const headings=[...body.querySelectorAll('h2,h3')].filter(h=>h.textContent.trim()); const used=new Set();
      headings.forEach((heading,index)=>{ if(!heading.id){ let base=slug(heading.textContent)||`section-${index+1}`,id=base,n=2; while(used.has(id)||document.getElementById(id))id=`${base}-${n++}`; heading.id=id;} used.add(heading.id); });
      toc.innerHTML=headings.map(h=>`<a class="${h.tagName==='H3'?'is-sub':''}" href="#${h.id}">${escapeHtml(h.textContent.trim())}</a>`).join('');
      if(!headings.length&&sidebar)sidebar.hidden=true;
      if('IntersectionObserver'in window&&headings.length){ const links=new Map([...toc.querySelectorAll('a')].map(a=>[a.hash.slice(1),a])); const observer=new IntersectionObserver(entries=>{ const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top); if(!visible.length)return; toc.querySelectorAll('a').forEach(a=>a.classList.remove('active')); links.get(visible[0].target.id)?.classList.add('active'); },{rootMargin:'-22% 0px -65% 0px',threshold:[0,1]}); headings.forEach(h=>observer.observe(h)); }
    }
    article.querySelector('[data-copy-article-link]')?.addEventListener('click',async e=>{await copyText(location.href);flash(e.currentTarget,'Copied');});
    article.querySelector('[data-print-procedure]')?.addEventListener('click',()=>print());
    const back=article.querySelector('[data-back-to-results]'); if(back&&document.referrer){try{const ref=new URL(document.referrer);if(ref.origin===location.origin&&ref.pathname.includes('/procedures/')){back.href=document.referrer;back.textContent='← Back to results';}}catch{}}
  }

  function initSearchPage() {
    const root=document.querySelector('[data-search-page]'); if(!root||!window.lunr)return;
    const form=root.querySelector('[data-search-page-form]'), input=root.querySelector('#search-page-input'), status=root.querySelector('[data-search-page-status]'), target=root.querySelector('[data-search-page-results]'), help=root.querySelector('[data-search-help]'), typeButtons=[...root.querySelectorAll('[data-search-type]')];
    let index,docs={},type=new URLSearchParams(location.search).get('type')||'all';
    typeButtons.forEach(button=>{button.classList.toggle('active',button.dataset.searchType===type);button.addEventListener('click',()=>{type=button.dataset.searchType;typeButtons.forEach(b=>b.classList.toggle('active',b===button));run();});});
    Promise.all([fetch(`${window.KB_BASE}assets/data/search-index.json`).then(r=>r.json()),fetch(`${window.KB_BASE}assets/data/search-documents.json`).then(r=>r.json())]).then(([serialized,documents])=>{index=lunr.Index.load(serialized);docs=Object.fromEntries(documents.map(d=>[d.id,d]));const q=new URLSearchParams(location.search).get('q')||'';input.value=q;if(q)run();}).catch(error=>{status.textContent='Search could not be loaded.';console.error(error);});
    form.addEventListener('submit',event=>{event.preventDefault();run();});
    function run(){
      const q=input.value.trim();const url=new URL(location.href);if(q)url.searchParams.set('q',q);else url.searchParams.delete('q');if(type!=='all')url.searchParams.set('type',type);else url.searchParams.delete('type');history.replaceState(null,'',url);
      if(!index||q.length<2){target.innerHTML='';status.textContent=q?'Enter at least two characters.':'';help.hidden=false;return;}
      let raw=[];try{const terms=q.toLowerCase().split(/\s+/).filter(Boolean);raw=index.query(builder=>terms.forEach(term=>{builder.term(term,{boost:10});builder.term(term,{wildcard:lunr.Query.wildcard.TRAILING,boost:5});if(term.length>3)builder.term(term,{editDistance:1,boost:2});}));}catch{}
      let results=raw.map(r=>docs[r.ref]).filter(Boolean);if(type!=='all')results=results.filter(d=>d.type===type);results=results.slice(0,50);help.hidden=!!results.length;status.textContent=`${results.length} result${results.length===1?'':'s'} for “${q}”.`;target.innerHTML=results.length?results.map(renderSearchCard).join(''):`<div class="rd-empty-state"><span aria-hidden="true">⌕</span><strong>No results found</strong><p>Try a simpler symptom, exact error code, or the symptom wizard.</p><a class="btn-secondary" href="${window.KB_BASE}wizard/">Open wizard</a></div>`;
    }
    function renderSearchCard(d){const risk=d.severity?`<span class="rd-risk rd-risk-${escapeHtml(d.severity.toLowerCase())}">${escapeHtml(d.severity)}</span>`:'';const trust=d.contentStatus?`<span class="rd-status status-${escapeHtml(d.contentStatus)}">${escapeHtml(d.contentStatus.replaceAll('_',' '))}</span>`:'';const meta=[d.category,d.supportTier,d.ownerTeam].filter(Boolean).map(escapeHtml).join(' · ');return `<a class="rd-search-page-card card" href="${d.url}"><div class="rd-card-badges">${risk}${trust}<span class="badge">${escapeHtml(d.type)}</span></div><h2>${escapeHtml(d.title)}</h2><p>${escapeHtml(d.description||'')}</p>${meta?`<span class="rd-search-page-meta">${meta}</span>`:''}<span class="rd-card-link">Open ${escapeHtml(d.type)} →</span></a>`;}
  }

  async function copyText(text){if(navigator.clipboard?.writeText&&isSecureContext)return navigator.clipboard.writeText(text);const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();}
  function flash(el,text){const old=el.textContent;el.textContent=text;setTimeout(()=>el.textContent=old,1400);}
  function slug(v){return String(v).toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');}
  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
})();
