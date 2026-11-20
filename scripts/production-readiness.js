const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");

const MODE = process.argv.includes("--apply") ? "apply" : process.argv.includes("--promote") ? "promote" : "report";
const DIR = "_procedures";
const VALID_RISKS = new Set(["critical", "high", "medium", "low"]);
const PRIORITY = { critical: "P0", high: "P1", medium: "P2", low: "P3" };
const TODAY = new Date().toISOString().slice(0, 10);

const verifiedOverrides = {
  "bsod-0x0000007b": ["critical", "Critical impact - the endpoint is unable to boot and storage or data integrity may be at risk."],
  "general-workstation-triage": ["medium", "Medium impact - the scope is initially unclear and a workaround may exist while the failing layer is isolated."],
  "mapped-drive-missing": ["high", "High impact - loss of an approved file share can prevent a user from completing core work and may involve access-control issues."],
  "mfa-setup-fails": ["high", "High impact - failed MFA can block all user access and changes to authentication methods affect account security."],
  "no-network-docking-station": ["medium", "Medium impact - wired docking connectivity is degraded but another network path may provide a temporary workaround."],
  "outlook-crashes": ["medium", "Medium impact - the desktop client is degraded while an approved alternative mail-access path may exist."],
  "password-reset": ["high", "High impact - the user may be unable to work and password or lockout remediation affects account security."],
  "printer-offline": ["low", "Low impact - a single printer outage is normally a minor inconvenience when alternate printing or digital workflow is available."],
  "slow-windows-pc": ["medium", "Medium impact - performance is degraded rather than fully unavailable and a temporary workaround may exist."],
  "teams-microphone-not-working": ["medium", "Medium impact - meeting audio is degraded while chat, phone audio or another approved device may provide a workaround."],
  "vpn-not-connecting": ["high", "High impact - a remote user can be unable to perform core work and a gateway issue may represent wider service degradation."]
};

const criticalPatterns = [
  /ransomware|security breach|breach response|compromised (?:admin|administrator|privileged|domain)|suspected compromised/i,
  /data loss|data corruption|corrupt(?:ed)? data|disaster recovery|business continuity/i,
  /system down|server down|service outage|site outage|tenant[- ]wide|organisation[- ]wide|organization[- ]wide|widespread outage|mass outage/i,
  /domain controller.*(?:down|unavailable|failure)|core (?:switch|router|firewall).*(?:down|failure|unavailable)/i,
  /will not boot|won't boot|boot loop|boot failure|inaccessible_boot_device|bsod|stop error|disk failure|storage failure/i
];

const highSecurityPatterns = [
  /remote wipe|secure wipe|deprovision|privileged access|administrator access|admin rights/i,
  /security group|conditional access|smart card|certificate|encryption|bitlocker|security key/i,
  /malware|antivirus|endpoint protection|firewall|service account|directory synchroni[sz]ation/i,
  /permission|access denied|unauthori[sz]ed|sensitive data|data exposure|credential/i
];

const highWorkStopPatterns = [
  /\bcannot\b|\bcan't\b|\bunable\b|fails?|failure|not working|not connecting|won't open|will not open/i,
  /unavailable|locked out|account locked|password expired|offline|crash(?:es|ed)?|no network|no internet|no access/i,
  /sign[- ]?in|log[- ]?in|password|mfa|vpn|authentication/i
];

const mediumPatterns = [
  /intermittent|slow|degrad(?:ed|ation)|latency|performance|workaround|sporadic/i,
  /dock|microphone|camera|bluetooth|audio|display|monitor|printer|printing|scanner|browser|cache|sync delay/i
];

const lowPatterns = [
  /cosmetic|wallpaper|default app|shortcut|rename|minor inconvenience|self[- ]service/i,
  /keyboard layout|screen brightness|theme|appearance|standard request|hardware request|software installation request/i
];

const highRiskCategories = new Set([
  "Identity & Access Management",
  "Security & Compliance",
  "Data Protection, Backup & Recovery",
  "Servers & Core Infrastructure",
  "Cloud & Virtualisation"
]);

function joined(data, content) {
  return [
    data.title, data.description, data.category, data.tldr, data.escalation,
    ...(data.tags || []), ...(data.error_codes || []), content.slice(0, 2400)
  ].filter(Boolean).join(" ");
}

function classify(slug, data, content) {
  if (verifiedOverrides[slug]) {
    return { risk: verifiedOverrides[slug][0], basis: verifiedOverrides[slug][1], rule: "verified-explicit-override" };
  }

  const current = String(data.severity || "").toLowerCase();
  const text = joined(data, content);

  if (criticalPatterns.some((r) => r.test(text))) {
    return { risk: "critical", basis: "Critical impact indicators detected: system/boot outage, data-integrity risk, security breach, or broad service outage.", rule: "critical-impact" };
  }

  if (VALID_RISKS.has(current) && current !== "medium") {
    return { risk: current, basis: `Existing explicit ${current} classification retained after impact-model review; no stronger critical indicator was detected.`, rule: "existing-explicit" };
  }

  if (highSecurityPatterns.some((r) => r.test(text))) {
    return { risk: "high", basis: "High impact indicators detected: privileged, security-sensitive, access-control, credential, encryption or data-exposure operation.", rule: "high-security" };
  }

  if (lowPatterns.some((r) => r.test(text)) && !highWorkStopPatterns.some((r) => r.test(text))) {
    return { risk: "low", basis: "Low impact indicators detected: routine request, cosmetic issue or simple self-service correction with limited operational effect.", rule: "low-minor" };
  }

  if (mediumPatterns.some((r) => r.test(text)) && !/no network|no internet|cannot|unable|unavailable/i.test(text)) {
    return { risk: "medium", basis: "Medium impact indicators detected: degraded/intermittent service, peripheral issue or an available workaround.", rule: "medium-degraded" };
  }

  if (highWorkStopPatterns.some((r) => r.test(text))) {
    return { risk: "high", basis: "High impact indicators detected: the procedure addresses loss of access, inability to perform core work, or material service failure.", rule: "high-work-stop" };
  }

  if (highRiskCategories.has(String(data.category || ""))) {
    return { risk: "high", basis: `High impact by domain: ${data.category} procedures can affect security, identity, data protection or core service availability.`, rule: "high-domain" };
  }

  if (String(data.category || "") === "Printing & Scanning") {
    return { risk: "low", basis: "Low impact by default for isolated printing/scanning issues where alternate workflow is normally available.", rule: "low-printing" };
  }

  return { risk: "medium", basis: "Medium impact after semantic review: limited-scope operational issue with no critical, security-sensitive or full work-stoppage indicator detected.", rule: "medium-reviewed" };
}

function hasCompleteEvidence(data) {
  const e = data.verification_evidence || {};
  const booleans = ["diagnostic_tested", "remediation_tested", "rollback_confirmed", "escalation_confirmed", "time_validated"];
  return booleans.every((key) => e[key] === true) &&
    typeof e.owner_signoff === "string" &&
    e.owner_signoff.trim().length > 1 &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(data.last_tested || "")) &&
    Array.isArray(data.tested_platforms) &&
    data.tested_platforms.length > 0 &&
    data.owner_team &&
    data.support_tier &&
    data.estimated_time;
}

function serialize(data, content) {
  const front = yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false }).trim();
  return `---\n${front}\n---\n${content.replace(/^\n+/, "")}`;
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".md")).sort();
const rows = [];
const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
const statusCounts = {};
let evidenceCompleteVerified = 0;
let promoted = 0;

for (const name of files) {
  const file = path.join(DIR, name);
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = parsed.data;
  const slug = data.slug || path.basename(name, ".md");
  const classification = classify(slug, data, parsed.content);

  data.severity = classification.risk;
  data.risk_model = "impact-v1";
  data.risk_basis = classification.basis;
  data.verification_priority = PRIORITY[classification.risk];

  if (data.content_status === "under_review") {
    data.verification_state = hasCompleteEvidence(data) ? "evidence_complete_pending_promotion" : "awaiting_live_validation";
  }

  if (data.content_status === "verified" && !data.verification_evidence_state) {
    data.verification_evidence_state = hasCompleteEvidence(data) ? "complete" : "legacy_verified_pending_revalidation";
  }

  if (MODE === "promote" && data.content_status === "under_review" && hasCompleteEvidence(data)) {
    data.content_status = "verified";
    data.quality_gate = "passed";
    data.generated_baseline = false;
    data.verification_evidence_state = "complete";
    data.verification_state = "verified";
    data.reviewed_by = data.verification_evidence.owner_signoff;
    data.last_reviewed = TODAY;
    promoted++;
  }

  if (data.content_status === "verified" && hasCompleteEvidence(data)) {
    data.verification_evidence_state = "complete";
    evidenceCompleteVerified++;
  }

  riskCounts[data.severity]++;
  statusCounts[data.content_status || "missing"] = (statusCounts[data.content_status || "missing"] || 0) + 1;

  const e = data.verification_evidence || {};
  rows.push({
    priority: data.verification_priority,
    slug,
    title: data.title || "",
    category: data.category || "",
    risk: data.severity,
    risk_rule: classification.rule,
    status: data.content_status || "",
    verification_state: data.verification_state || data.verification_evidence_state || "",
    support_tier: data.support_tier || "",
    estimated_time: data.estimated_time || "",
    owner_team: data.owner_team || "",
    diagnostic_tested: e.diagnostic_tested === true,
    remediation_tested: e.remediation_tested === true,
    rollback_confirmed: e.rollback_confirmed === true,
    escalation_confirmed: e.escalation_confirmed === true,
    time_validated: e.time_validated === true,
    owner_signoff: e.owner_signoff || "",
    last_tested: data.last_tested || ""
  });

  if (MODE === "apply" || MODE === "promote") {
    fs.writeFileSync(file, serialize(data, parsed.content));
  }
}

rows.sort((a, b) => {
  const p = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return p[a.priority] - p[b.priority] || a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
});

fs.mkdirSync("reports", { recursive: true });
fs.mkdirSync("_data", { recursive: true });

const csvHeaders = Object.keys(rows[0] || {});
const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

fs.writeFileSync(
  "reports/verification-queue.csv",
  [csvHeaders.join(","), ...rows.map((row) => csvHeaders.map((h) => csvEscape(row[h])).join(","))].join("\n") + "\n"
);

const queueByPriority = {
  P0: rows.filter((r) => r.priority === "P0" && r.status !== "verified"),
  P1: rows.filter((r) => r.priority === "P1" && r.status !== "verified"),
  P2: rows.filter((r) => r.priority === "P2" && r.status !== "verified"),
  P3: rows.filter((r) => r.priority === "P3" && r.status !== "verified")
};

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  totalProcedures: files.length,
  riskModel: "impact-v1",
  riskCounts,
  statusCounts,
  verificationQueueCounts: Object.fromEntries(Object.entries(queueByPriority).map(([k, v]) => [k, v.length])),
  evidenceCompleteVerified,
  targetVerified80Percent: Math.ceil(files.length * 0.8),
  newlyPromotedThisRun: promoted,
  note: "Under-review procedures are never promoted unless all live-test, rollback, escalation, time-validation and owner-signoff evidence fields are complete."
};

fs.writeFileSync("reports/risk-classification.json", JSON.stringify({ ...report, procedures: rows }, null, 2));
fs.writeFileSync("reports/verification-queue.json", JSON.stringify({ ...report, batches: queueByPriority }, null, 2));
fs.writeFileSync("_data/verification-dashboard.json", JSON.stringify(report, null, 2));

console.log(`Production-readiness ${MODE}: ${files.length} procedures.`);
console.log(`Risk counts: ${JSON.stringify(riskCounts)}.`);
console.log(`Statuses: ${JSON.stringify(statusCounts)}.`);
console.log(`Verification queue: ${JSON.stringify(report.verificationQueueCounts)}.`);
console.log(`Evidence-complete verified: ${evidenceCompleteVerified}; 80% target: ${report.targetVerified80Percent}.`);
if (MODE === "promote") console.log(`Promoted ${promoted} procedures with complete evidence.`);
