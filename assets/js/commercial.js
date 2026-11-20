(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initOfferSelection();
    initEnquiryForm();
  });

  function initOfferSelection() {
    const select = document.querySelector("[data-org-service]");
    if (!select) return;

    document.querySelectorAll("[data-select-offer]").forEach((link) => {
      link.addEventListener("click", () => {
        const value = link.dataset.selectOffer || "";
        if (value) select.value = value;
      });
    });
  }

  function initEnquiryForm() {
    const form = document.querySelector("[data-org-enquiry-form]");
    if (!form) return;

    const status = form.querySelector("[data-org-enquiry-status]");
    const copyButton = form.querySelector("[data-copy-org-enquiry]");
    const enquiryEmail =
      window.KB_CONFIG?.commercial?.enquiryEmail?.trim?.() || "";

    function buildBrief() {
      const data = new FormData(form);
      const lines = [
        "ShiftStart organisation enquiry",
        "",
        `Organisation: ${data.get("organisation") || ""}`,
        `Contact: ${data.get("name") || ""}`,
        `Work email: ${data.get("email") || ""}`,
        `Service: ${data.get("service") || ""}`,
        `IT/support team size: ${data.get("team_size") || "Not specified"}`,
        `Current knowledge source: ${data.get("current_kb") || "Not specified"}`,
        "",
        "What we would like to improve:",
        String(data.get("message") || "").trim()
      ];
      return lines.join("\n");
    }

    function subject() {
      const data = new FormData(form);
      const organisation = String(data.get("organisation") || "Organisation").trim();
      const service = String(data.get("service") || "ShiftStart enquiry").trim();
      return `ShiftStart enquiry — ${service} — ${organisation}`;
    }

    async function copyBrief() {
      if (!form.reportValidity()) return;

      const brief = buildBrief();
      try {
        await navigator.clipboard.writeText(brief);
        setStatus("Enquiry brief copied.");
      } catch (_) {
        fallbackCopy(brief);
        setStatus("Enquiry brief copied.");
      }
    }

    function fallbackCopy(text) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }

    function setStatus(message) {
      if (!status) return;
      status.textContent = message;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const brief = buildBrief();

      if (enquiryEmail) {
        const mailto =
          `mailto:${encodeURIComponent(enquiryEmail)}` +
          `?subject=${encodeURIComponent(subject())}` +
          `&body=${encodeURIComponent(brief)}`;
        setStatus("Opening your email application…");
        window.location.href = mailto;
        return;
      }

      try {
        await navigator.clipboard.writeText(brief);
      } catch (_) {
        fallbackCopy(brief);
      }
      setStatus("Direct email is not configured yet. Your enquiry brief has been copied.");
    });

    copyButton?.addEventListener("click", copyBrief);
  }
})();
