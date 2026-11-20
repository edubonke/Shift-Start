(() => {
  const cfg = window.KB_CONFIG || {};
  const base = (window.KB_BASE || "/").replace(/\/?$/, "/");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const statusLabels = {
    verified: "Verified",
    under_review: "Under review",
    revalidation_required: "Revalidation required",
    draft: "Draft",
    deprecated: "Deprecated"
  };

  const listenMedia = (media, handler) => {
    if (!media) return;
    if (media.addEventListener) media.addEventListener("change", handler);
    else if (media.addListener) media.addListener(handler);
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));

  initNavigation();
  configureTicketLink();
  configureAccess();

  const wizard = document.querySelector("#wizard-root");
  if (wizard) initWizard(wizard);

  document.addEventListener("click", handleGlobalClick);

  async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function setTemporaryLabel(element, label, resetLabel, delay = 1600) {
    element.textContent = label;
    window.setTimeout(() => { element.textContent = resetLabel; }, delay);
  }

  function initNavigation() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("#mobile-navigation");
    const searchButton = document.querySelector("[data-search-toggle]");
    const searchInput = document.querySelector("#kb-search");

    const closeMenu = (returnFocus = false) => {
      if (!menuButton || !mobileNav) return;
      menuButton.setAttribute("aria-expanded", "false");
      if (menuButton.type === "checkbox") menuButton.checked = false;
      const label = menuButton.querySelector(".sr-only");
      if (label) label.textContent = "Open navigation menu";
      mobileNav.hidden = true;
      document.body.classList.remove("mobile-menu-open");
      if (returnFocus) menuButton.focus();
    };

    menuButton?.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        menuButton.setAttribute("aria-expanded", "true");
        const label = menuButton.querySelector(".sr-only");
        if (label) label.textContent = "Close navigation menu";
        mobileNav.hidden = false;
        document.body.classList.add("mobile-menu-open");
        mobileNav.querySelector("a")?.focus({ preventScroll: true });
      }
    });

    mobileNav?.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    searchButton?.addEventListener("click", () => {
      closeMenu();
      searchInput?.focus({ preventScroll: false });
      searchButton.setAttribute("aria-expanded", "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });

    listenMedia(window.matchMedia?.("(min-width: 768px)"), (event) => {
      if (event.matches) closeMenu();
    });
  }

  async function handleGlobalClick(event) {
    const copy = event.target.closest(".copy-command");
    if (copy) {
      const code = copy.closest(".command-block")?.querySelector("code")?.innerText || "";
      try {
        await copyText(code);
        setTemporaryLabel(copy, "Copied", "Copy", 1400);
      } catch (error) {
        setTemporaryLabel(copy, "Copy failed", "Copy", 1800);
        console.error(error);
      }
      return;
    }

    const diagnostic = event.target.closest("[data-diagnostic-action]");
    if (diagnostic) {
      const block = diagnostic.closest(".command-block");
      const command = block?.querySelector("code")?.innerText || "";
      const id = diagnostic.dataset.diagnosticAction;
      if (!cfg.diagnostics?.enabled || !cfg.diagnostics?.endpoint) {
        try {
          await copyText(command);
          setTemporaryLabel(diagnostic, "Copied (service off)", "Run diagnostic", 1800);
        } catch (error) {
          setTemporaryLabel(diagnostic, "Unavailable", "Run diagnostic", 1800);
          console.error(error);
        }
      } else {
        diagnostic.disabled = true;
        diagnostic.textContent = "Running…";
        try {
          const response = await fetch(cfg.diagnostics.endpoint, {
            method: cfg.diagnostics.method || "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ diagnosticId: id, article: location.pathname })
          });
          const result = await response.json();
          diagnostic.textContent = response.ok ? "Completed" : "Failed";
          console.info("Diagnostic result", result);
        } catch (error) {
          diagnostic.textContent = "Unavailable";
          console.error(error);
        } finally {
          diagnostic.disabled = false;
          window.setTimeout(() => { diagnostic.textContent = "Run diagnostic"; }, 2200);
        }
      }
      return;
    }

    const feedback = event.target.closest("[data-feedback]");
    if (feedback) {
      const payload = {
        vote: feedback.dataset.feedback,
        url: location.href,
        title: document.title,
        contentStatus: document.body.dataset.contentStatus || "",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        at: new Date().toISOString()
      };
      localStorage.setItem(`kb-feedback:${location.pathname}`, JSON.stringify(payload));
      const status = document.querySelector("#feedback-status");
      if (status) status.textContent = "Feedback recorded. Thank you.";
      if (cfg.feedbackEndpoint) {
        fetch(cfg.feedbackEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(console.warn);
      }
      return;
    }

    const procedureLink = event.target.closest("[data-procedure-link]");
    if (procedureLink?.dataset.selectedSymptoms) {
      sessionStorage.setItem("kb:last-symptoms", procedureLink.dataset.selectedSymptoms);
    }
  }

  function configureTicketLink() {
    const ticket = document.querySelector("[data-ticket-link]");
    if (!ticket) return;
    const itsm = cfg.itsm || {};
    const template = itsm.ticketUrlTemplate || cfg.ticketUrlTemplate || "";
    if (!itsm.enabled || !template) {
      ticket.removeAttribute("href");
      ticket.setAttribute("aria-disabled", "true");
      ticket.classList.add("is-disabled");
      ticket.textContent = "ITSM integration not configured";
      ticket.addEventListener("click", (event) => event.preventDefault());
      return;
    }

    const selectedSymptoms = sessionStorage.getItem("kb:last-symptoms") || "";
    const replacements = {
      title: ticket.dataset.title || document.querySelector("h1")?.textContent || "IT issue",
      category: ticket.dataset.category || "Support",
      url: location.href,
      severity: ticket.dataset.severity || "",
      owner_team: ticket.dataset.ownerTeam || "",
      symptoms: selectedSymptoms
    };
    ticket.href = Object.entries(replacements).reduce(
      (url, [key, value]) => url.replaceAll(`{${key}}`, encodeURIComponent(value)),
      template
    );
    ticket.target = itsm.openInNewTab === false ? "_self" : "_blank";
    if (ticket.target === "_blank") ticket.rel = "noopener noreferrer";
  }

  function configureAccess() {
    const role = document.body.dataset.requiredRole;
    if (!cfg.access?.enabled) return;
    const currentRole = window.KB_USER?.role || cfg.access.defaultRole || "guest";
    document.querySelectorAll("[data-role]").forEach((element) => {
      const allowed = element.dataset.role.split(",").map((value) => value.trim());
      element.hidden = !allowed.includes(currentRole);
    });
    if (role && role !== "technician" && currentRole !== role) document.body.classList.add("access-limited");
  }

  async function initWizard(root) {
    try {
      const response = await fetch(root.dataset.source, { cache: "no-store" });
      if (!response.ok) throw new Error(`Wizard data returned ${response.status}`);
      const data = await response.json();
      const selected = new Set();
      const openGroups = new Set();
      let query = "";
      let category = "all";
      let filterTimer;
      let stage = 1;
      const context = { impact: "Unknown", scope: "Unknown", evidence: "" };
      const safety = [false, false, false];
      const safetyLabels = ["Confirm the affected scope and capture evidence", "Confirm change authority and least-privilege access", "Review rollback and escalation conditions before execution"];
      const stepNames = ["Impact & scope", "Symptoms & evidence", "Risk & authority", "Procedure match"];
      const desktopQuery = window.matchMedia?.("(min-width: 768px)");

      const visibleSymptoms = () => data.symptoms.filter((symptom) => {
        const matchesCategory = category === "all" || symptom.category === category;
        const haystack = `${symptom.title} ${symptom.description} ${(symptom.tags || []).join(" ")}`.toLowerCase();
        return matchesCategory && (!query || haystack.includes(query.toLowerCase()));
      });

      const groupShouldOpen = (name) => Boolean(query) || openGroups.has(name) || desktopQuery?.matches;

      const selectedTitles = () => data.symptoms
        .filter((symptom) => selected.has(symptom.id))
        .map((symptom) => symptom.title);

      const stepper = () => `<ol class="ot-stepper" aria-label="Triage progress">${stepNames.map((name, index) => `<li ${stage === index + 1 ? 'aria-current="step"' : ''} data-completed="${stage > index + 1}"><span>${stage > index + 1 ? 'DONE' : `0${index + 1}`}</span>${name}</li>`).join('')}</ol>`;
      const back = () => '<button class="btn-secondary" type="button" data-stage-back>← Back</button>';
      const focusStage = () => {
        root.querySelector('[data-stage-heading]')?.focus({ preventScroll: true });
        root.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      };
      const go = (next) => { stage = next; render(); focusStage(); };
      const choices = (values, current) => values.map(value => `<option${value === current ? ' selected' : ''}>${escapeHtml(value)}</option>`).join('');
      const downloadSummary = () => {
        const matches = rank();
        const summary = { createdAt: new Date().toISOString(), type: 'triage-draft', impact: context.impact, scope: context.scope, evidence: context.evidence, selectedSymptoms: selectedTitles(), safetyChecklist: safetyLabels.map((label, index) => ({ label, checked: safety[index] })), recommendedProcedures: matches.map(({ id, title, contentStatus, confidence, url }) => ({ id, title, contentStatus, confidence, url })), notice: 'Local triage draft only. No remediation, authority or incident closure has been verified.' };
        const url = URL.createObjectURL(new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'shiftstart-triage-draft.json'; link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      const updateSelectionState = () => {
        const count = root.querySelector("[data-selected-count]");
        if (count) count.textContent = String(selected.size);

        const selectedRegion = root.querySelector("[data-selected-symptoms]");
        if (selectedRegion) {
          const titles = selectedTitles();
          selectedRegion.hidden = !titles.length;
          selectedRegion.innerHTML = titles.map((title) => `<span class="selected-chip">${escapeHtml(title)}</span>`).join("");
        }

        const matchButton = root.querySelector("[data-match-procedures]");
        if (matchButton) matchButton.disabled = !selected.size;

        root.querySelectorAll(".symptom-option input").forEach((input) => {
          input.checked = selected.has(input.value);
          input.closest(".symptom-option")?.classList.toggle("is-selected", input.checked);
        });
      };

      const render = ({ preserveFocus = false } = {}) => {
        if (stage === 1) {
          root.innerHTML = `${stepper()}<section class="ot-wizard-stage"><p class="ot-label">01 / Context</p><h2 tabindex="-1" data-stage-heading>Confirm impact and scope</h2><p>Start with what you know. These optional details stay in this session and help create a useful handover draft.</p><div class="ot-field-grid"><label>Business impact<select class="wizard-input" data-context="impact">${choices(['Unknown','P0 — Critical','P1 — High','P2 — Medium','P3 — Low','Informational'], context.impact)}</select></label><label>Affected scope<select class="wizard-input" data-context="scope">${choices(['Unknown','One user or endpoint','Multiple users or endpoints','Site or service-wide'], context.scope)}</select></label><label class="ot-wide">Observed error or recent change<textarea class="wizard-input" data-context="evidence" maxlength="2000" placeholder="Record non-sensitive diagnostic observations only">${escapeHtml(context.evidence)}</textarea></label></div><p class="ot-notice">Do not enter passwords, customer information, credentials or other sensitive data.</p><div class="ot-stage-actions"><a class="btn-secondary" href="${base}procedures/">Browse procedures</a><button class="btn" type="button" data-stage-next>Continue to symptoms →</button></div></section>`;
          return;
        }
        if (stage === 3) {
          root.innerHTML = `${stepper()}<section class="ot-wizard-stage"><p class="ot-label">03 / Governance</p><h2 tabindex="-1" data-stage-heading>Review risk and authority</h2><p>${selected.size} symptoms selected · ${escapeHtml(context.impact)} · ${escapeHtml(context.scope)}</p><ul class="ot-checks">${safetyLabels.map((label,index) => `<li><label><input type="checkbox" data-safety="${index}" ${safety[index] ? 'checked' : ''}>${escapeHtml(label)}</label></li>`).join('')}</ul><p class="ot-notice">This checklist records your review only. ShiftStart cannot grant privileges, run commands, confirm rollback or authorise production changes. Unchecked items remain outstanding in the handover.</p><div class="ot-stage-actions">${back()}<button class="btn" type="button" data-stage-next>Review procedure matches →</button></div></section>`;
          return;
        }
        if (stage === 4) {
          root.innerHTML = `${stepper()}<section class="ot-wizard-stage"><p class="ot-label">04 / Recommendation</p><h2 tabindex="-1" data-stage-heading>Procedure match & handover</h2><p class="ot-notice">${safety.filter(Boolean).length} of ${safety.length} review checks recorded. Matches are recommendations, not proof of a resolved incident.</p><div id="wizard-results" aria-live="polite"></div><div class="ot-stage-actions">${back()}<button class="btn" type="button" data-export-triage>Download triage draft (.json)</button></div></section>`;
          showResults(false);
          return;
        }
        const visible = visibleSymptoms();
        const groups = new Map();
        for (const symptom of visible) {
          if (!groups.has(symptom.category)) groups.set(symptom.category, []);
          groups.get(symptom.category).push(symptom);
        }

        root.innerHTML = `${stepper()}
          <div class="wizard-toolbar">
            <div>
              <p class="eyebrow text-sm">Enterprise symptom matcher</p>
              <h3 tabindex="-1" data-stage-heading class="!mt-1">Select every symptom that applies</h3>
              <p class="mt-2 text-sm text-slate-600">Every procedure is evaluated. Verified guidance is prioritised; under-review guidance is clearly labelled and never presented as approved without a warning.</p>
            </div>
            <div class="wizard-count" aria-live="polite"><strong data-selected-count>${selected.size}</strong><span>selected</span></div>
          </div>
          <div class="wizard-controls">
            <label><span>Filter symptoms</span><input id="wizard-filter" class="wizard-input" type="search" inputmode="search" enterkeyhint="search" value="${escapeHtml(query)}" placeholder="Type a symptom, error or device…"></label>
            <label><span>Category</span><select id="wizard-category" class="wizard-input"><option value="all">All categories</option>${data.categories.map((item) => `<option value="${escapeHtml(item)}"${item === category ? " selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>
          </div>
          <div class="wizard-actions"><button class="btn-secondary" type="button" data-select-visible>Select all visible (${visible.length})</button><button class="btn-secondary" type="button" data-clear-selection>Clear selection</button></div>
          <div class="selected-symptoms" data-selected-symptoms aria-live="polite" ${selected.size ? "" : "hidden"}>${selectedTitles().map((title) => `<span class="selected-chip">${escapeHtml(title)}</span>`).join("")}</div>
          <div class="symptom-groups">${[...groups.entries()].map(([name, items]) => `<details class="symptom-group" data-group-name="${escapeHtml(name)}" ${groupShouldOpen(name) ? "open" : ""}><summary><span>${escapeHtml(name)}</span><span>${items.length}</span></summary><div class="symptom-grid">${items.map((symptom) => `<label class="symptom-option ${selected.has(symptom.id) ? "is-selected" : ""}"><input type="checkbox" value="${escapeHtml(symptom.id)}" ${selected.has(symptom.id) ? "checked" : ""}><span><strong>${escapeHtml(symptom.title)}</strong><small>${escapeHtml(symptom.description)}</small></span></label>`).join("")}</div></details>`).join("") || '<p class="card">No symptoms match this filter.</p>'}</div>
          <div class="wizard-submit ot-stage-actions">${back()}<button class="btn" type="button" data-match-procedures ${selected.size ? "" : "disabled"}>Continue to risk &amp; authority →</button><p>${data.counts.symptoms} symptoms · ${data.counts.procedures} procedures indexed · ${data.counts.statuses?.verified || 0} verified</p></div>
          <div id="wizard-results" aria-live="polite"></div>`;

        if (preserveFocus) {
          requestAnimationFrame(() => {
            const filter = root.querySelector("#wizard-filter");
            if (filter) {
              filter.focus({ preventScroll: true });
              const end = filter.value.length;
              filter.setSelectionRange(end, end);
            }
          });
        }
      };

      const rank = () => {
        const chosen = [...selected];
        return data.procedures.map((procedure) => {
          if (procedure.contentStatus === "deprecated") return null;
          const matched = chosen.filter((id) => procedure.symptoms.includes(id));
          if (!matched.length) return null;
          const weighted = matched.reduce((sum, id) => sum + Number(procedure.symptomWeights?.[id] || 5), 0);
          const coverage = chosen.length ? matched.length / chosen.length : 0;
          const precision = procedure.symptoms.length ? matched.length / procedure.symptoms.length : 0;
          const directLinks = chosen.reduce((sum, id) => {
            const symptom = data.symptoms.find((item) => item.id === id);
            return sum + (symptom?.relatedProcedures?.includes(procedure.id) ? 1 : 0);
          }, 0);
          const statusBoost = { verified: 45, under_review: 0, revalidation_required: -10, draft: -60 }[procedure.contentStatus] ?? -10;
          const score = weighted * 10 + coverage * 35 + precision * 20 + directLinks * 8 + statusBoost;
          const confidence = coverage >= 0.75 && (matched.length >= 2 || directLinks >= 1)
            ? "high"
            : coverage >= 0.5 || directLinks >= 1
              ? "medium"
              : "low";
          return { ...procedure, matched, score, coverage, precision, directLinks, confidence };
        }).filter(Boolean).sort((a, b) => b.score - a.score || b.coverage - a.coverage || a.title.localeCompare(b.title));
      };

      const showResults = (scroll = true) => {
        const target = root.querySelector("#wizard-results");
        const ranked = rank();
        if (!ranked.length) {
          target.innerHTML = `<section class="wizard-results"><h3>No exact procedure match</h3><p>Keep all selected symptoms in the ticket and start with general workstation triage or search the complete procedure catalogue.</p><div class="mt-4 grid gap-2 min-[420px]:flex min-[420px]:gap-3"><a class="btn" href="${base}procedures/general-workstation-triage/">Open general triage</a><a class="btn-secondary" href="${base}procedures/">Browse all procedures</a></div></section>`;
          return;
        }

        const chosenMap = Object.fromEntries(data.symptoms.map((symptom) => [symptom.id, symptom.title]));
        const selectedIds = [...selected];
        const selectedText = selectedIds.map((id) => chosenMap[id] || id).join("; ");
        const cards = ranked.map((procedure, index) => {
          const unmatched = selectedIds.filter((id) => !procedure.matched.includes(id));
          const status = statusLabels[procedure.contentStatus] || procedure.contentStatus;
          return `<article class="result-card ${index === 0 ? "primary-result" : ""}" data-result-extra="${index >= 12 ? "true" : "false"}" ${index >= 12 ? "hidden" : ""}>
            <div>
              <div class="flex flex-wrap gap-2">
                <span class="badge">${index === 0 ? "Primary recommendation" : `Alternative ${index}`}</span>
                <span class="badge status-${escapeHtml(procedure.contentStatus)}">${escapeHtml(status)}</span>
                <span class="badge confidence-${escapeHtml(procedure.confidence)}">${escapeHtml(procedure.confidence)} confidence</span>
                <span class="badge">${escapeHtml(procedure.category)}</span>
                <span class="badge">${escapeHtml(procedure.supportTier)}</span>
              </div>
              <h4>${escapeHtml(procedure.title)}</h4>
              <p>${escapeHtml(procedure.description)}</p>
              <p class="matched-label"><strong>Matched:</strong> ${procedure.matched.map((id) => escapeHtml(chosenMap[id] || id)).join("; ")}</p>
              ${unmatched.length ? `<p class="unmatched-label"><strong>Not explained:</strong> ${unmatched.map((id) => escapeHtml(chosenMap[id] || id)).join("; ")}</p>` : ""}
              <p class="text-xs text-slate-500">Owner: ${escapeHtml(procedure.ownerTeam || "Configured resolver group")} · Score: ${Math.round(procedure.score)}</p>
              ${procedure.contentStatus !== "verified" ? '<p class="review-warning">Validate under-review guidance against organisational policy before making a production change.</p>' : ""}
            </div>
            <a class="btn" data-procedure-link data-selected-symptoms="${escapeHtml(selectedText)}" href="${escapeHtml(procedure.url)}">Open procedure</a>
          </article>`;
        }).join("");

        target.innerHTML = `<section class="wizard-results">
          <div class="wizard-results-heading"><div><p class="eyebrow text-sm">Ranked recommendations</p><h3 class="!mt-1">Start with the highest-evidence procedure</h3></div><span class="badge">${ranked.length} matches</span></div>
          ${ranked[0].contentStatus !== "verified" ? '<div class="quality-warning"><strong>No verified procedure fully matched.</strong> The primary result is under review. Use it for structured evidence gathering and obtain technical-owner approval before material production changes.</div>' : ""}
          <div class="mt-5 grid gap-4">${cards}</div>
          ${ranked.length > 12 ? `<button class="btn-secondary mt-5 w-full sm:w-auto" type="button" data-show-all-results>Show all ${ranked.length} matching procedures</button>` : ""}
        </section>`;
        if (scroll) target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      };

      root.addEventListener("input", (event) => {
        if (event.target.dataset.context) context[event.target.dataset.context] = event.target.value;
        if (event.target.dataset.safety !== undefined) safety[Number(event.target.dataset.safety)] = event.target.checked;
        if (event.target.id === "wizard-filter") {
          query = event.target.value;
          window.clearTimeout(filterTimer);
          filterTimer = window.setTimeout(() => render({ preserveFocus: true }), 120);
          return;
        }
        if (event.target.matches(".symptom-option input")) {
          event.target.checked ? selected.add(event.target.value) : selected.delete(event.target.value);
          updateSelectionState();
        }
      });

      root.addEventListener("change", (event) => {
        if (event.target.id === "wizard-category") {
          category = event.target.value;
          render();
        }
      });

      root.addEventListener("toggle", (event) => {
        const details = event.target.closest?.(".symptom-group");
        if (!details) return;
        const name = details.dataset.groupName;
        details.open ? openGroups.add(name) : openGroups.delete(name);
      }, true);

      root.addEventListener("click", (event) => {
        if (event.target.closest('[data-stage-back]')) { go(Math.max(1, stage - 1)); return; }
        if (event.target.closest('[data-stage-next]')) { go(Math.min(4, stage + 1)); return; }
        if (event.target.closest('[data-export-triage]')) { downloadSummary(); return; }
        if (event.target.closest("[data-select-visible]")) {
          visibleSymptoms().forEach((symptom) => selected.add(symptom.id));
          updateSelectionState();
        }
        if (event.target.closest("[data-clear-selection]")) {
          selected.clear();
          updateSelectionState();
          root.querySelector("#wizard-results")?.replaceChildren();
        }
        if (event.target.closest("[data-match-procedures]") && selected.size) { go(3); return; }
        if (event.target.closest("[data-show-all-results]")) {
          root.querySelectorAll("[data-result-extra='true']").forEach((element) => { element.hidden = false; });
          event.target.closest("[data-show-all-results]").remove();
        }
      });

      listenMedia(desktopQuery, () => render());
      render();
    } catch (error) {
      root.innerHTML = '<p class="card">Could not load the symptom matcher. Use search or the complete procedure catalogue.</p>';
      console.error(error);
    }
  }
})();
