const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const files = fs.readdirSync("_procedures").filter((name) => name.endsWith(".md")).sort();
const validRisks = new Set(["critical", "high", "medium", "low"]);
const priority = { critical: "P0", high: "P1", medium: "P2", low: "P3" };
const errors = [];
const warnings = [];
const statusCounts = {};
const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
let legacyVerified = 0;
let evidenceCompleteVerified = 0;

const requiredEnterpriseHeadings = [
  "## Diagnostic Steps",
  "## Remediation Steps",
  "## Rollback Steps",
  "## Verification Steps",
  "## Escalation Path"
];

for (const name of files) {
  const file = path.join("_procedures", name);
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const d = parsed.data;
  const risk = String(d.severity || "").toLowerCase();

  if (!validRisks.has(risk)) errors.push(`${file}: missing or invalid explicit severity`);
  else riskCounts[risk]++;

  if (d.risk_model !== "impact-v1") errors.push(`${file}: risk_model must be impact-v1`);
  if (!String(d.risk_basis || "").trim()) errors.push(`${file}: missing risk_basis`);
  if (d.verification_priority !== priority[risk]) errors.push(`${file}: verification_priority does not match severity`);

  const status = d.content_status || "missing";
  statusCounts[status] = (statusCounts[status] || 0) + 1;

  if (status === "under_review" && !["awaiting_live_validation", "evidence_complete_pending_promotion"].includes(d.verification_state)) {
    errors.push(`${file}: under_review procedure requires explicit verification_state`);
  }

  if (status === "verified") {
    for (const key of ["support_tier", "estimated_time", "owner_team", "runbook_template"]) {
      if (!String(d[key] || "").trim()) errors.push(`${file}: verified procedure missing ${key}`);
    }

    if (d.runbook_template !== "enterprise-v1") errors.push(`${file}: verified procedure must use enterprise-v1`);

    let previous = -1;
    for (const heading of requiredEnterpriseHeadings) {
      const at = parsed.content.indexOf(heading);
      if (at < 0) errors.push(`${file}: missing enterprise section '${heading}'`);
      else if (at <= previous) errors.push(`${file}: enterprise sections are not in the required order`);
      previous = Math.max(previous, at);
    }

    if (d.verification_evidence_state === "complete") {
      evidenceCompleteVerified++;
    } else {
      legacyVerified++;
      warnings.push(`${file}: verified status is inherited but recorded live-test/owner-signoff evidence is incomplete`);
    }
  }
}

if (files.length !== 421) errors.push(`Expected 421 procedures; found ${files.length}`);

if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Production readiness validation passed: ${files.length} procedures; risks ${JSON.stringify(riskCounts)}; statuses ${JSON.stringify(statusCounts)}.`);
console.log(`Verified evidence states: complete=${evidenceCompleteVerified}, inherited-pending-revalidation=${legacyVerified}.`);
