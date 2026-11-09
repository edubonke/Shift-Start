(() => {
  const cfg = window.KB_CONFIG || {};
  const base = window.KB_BASE || "/";

  document.addEventListener("click", async (event) => {
    const copy = event.target.closest(".copy-command");
    if (copy) {
      const code = copy.closest(".command-block").querySelector("code").innerText;
      await navigator.clipboard.writeText(code);
      copy.textContent = "Copied";
      setTimeout(() => copy.textContent = "Copy", 1400);
    }

    const diagnostic = event.target.closest("[data-diagnostic-action]");
    if (diagnostic) {
      const block = diagnostic.closest(".command-block");
      const command = block?.querySelector("code")?.innerText || "";
      const id = diagnostic.dataset.diagnosticAction;
      if (!cfg.diagnostics?.enabled || !cfg.diagnostics?.endpoint) {
        await navigator.clipboard.writeText(command);
        diagnostic.textContent = "Copied (service off)";
        setTimeout(() => diagnostic.textContent = "Run diagnostic", 1800);
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
          setTimeout(() => diagnostic.textContent = "Run diagnostic", 2200);
        }
      }
    }

    const feedback = event.target.closest("[data-feedback]");
    if (feedback) {
      const payload = { vote: feedback.dataset.feedback, url: location.href, title: document.title, at: new Date().toISOString() };
      localStorage.setItem(`kb-feedback:${location.pathname}`, JSON.stringify(payload));
      document.querySelector("#feedback-status").textContent = "Feedback recorded. Thank you.";
      if (cfg.feedbackEndpoint) fetch(cfg.feedbackEndpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).catch(console.warn);
    }
  });

  const ticket = document.querySelector("[data-ticket-link]");
  if (ticket) {
    const template = cfg.ticketUrlTemplate || "#";
    ticket.href = template
      .replace("{title}", encodeURIComponent(document.querySelector("h1")?.textContent || "IT issue"))
      .replace("{category}", encodeURIComponent(document.querySelector(".badge:nth-child(2)")?.textContent || "Support"))
      .replace("{url}", encodeURIComponent(location.href));
  }

  const role = document.body.dataset.requiredRole;
  if (cfg.access?.enabled) {
    const currentRole = window.KB_USER?.role || cfg.access.defaultRole || "guest";
    document.querySelectorAll("[data-role]").forEach(el => {
      const allowed = el.dataset.role.split(",").map(x => x.trim());
      el.hidden = !allowed.includes(currentRole);
    });
    if (role && role !== "technician" && currentRole !== role) document.body.classList.add("access-limited");
  }

  const wizard = document.querySelector("#wizard-root");
  if (wizard) initWizard(wizard);

  async function initWizard(root) {
    try {
      const data = await fetch(root.dataset.source).then(r => r.json());
      let current = data.start;
      const history = [];
      const render = () => {
        const node = data.nodes[current];
        if (!node) return root.innerHTML = "<p>Wizard data is incomplete.</p>";
        if (node.procedure) {
          root.innerHTML = `<p class="text-sm font-semibold text-emerald-700">Recommended procedure</p><h3 class="!mt-2">${node.title}</h3><p class="mt-3 text-slate-600">${node.summary || "Open the procedure and follow the verification steps."}</p><div class="mt-5 flex gap-3"><a class="btn" href="${base}${node.procedure.replace(/^\//, "")}">Open procedure</a><button class="btn-secondary" data-wizard-reset>Start over</button></div>`;
        } else {
          root.innerHTML = `<p class="text-sm font-semibold text-blue-700">Question ${history.length + 1}</p><h3 class="!mt-2">${node.question}</h3><div class="mt-5 grid gap-3 sm:grid-cols-2"><button class="btn" data-answer="yes">Yes</button><button class="btn-secondary" data-answer="no">No</button></div>${history.length ? '<button class="mt-4 text-sm font-semibold text-blue-700" data-wizard-back>← Previous question</button>' : ''}`;
        }
      };
      root.addEventListener("click", (e) => {
        const answer = e.target.dataset.answer;
        if (answer) { history.push(current); current = data.nodes[current][answer]; render(); }
        if (e.target.hasAttribute("data-wizard-back")) { current = history.pop(); render(); }
        if (e.target.hasAttribute("data-wizard-reset")) { history.length = 0; current = data.start; render(); }
      });
      render();
    } catch (error) { root.innerHTML = `<p>Could not load the wizard. Use search above.</p>`; console.error(error); }
  }
})();
