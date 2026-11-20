const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SYMPTOM_DIR = "_symptoms";
const OVERRIDES_PATH = path.join("_data", "symptom-taxonomy-v2-overrides.json");
const REPORT_JSON = path.join("reports", "symptom-taxonomy-v2.json");
const REPORT_CSV = path.join("reports", "symptom-taxonomy-v2.csv");

const VALID_TYPES = new Set([
  "observable_symptom",
  "service_request",
  "known_condition",
  "context",
  "incident_event"
]);

const ACTION_PREFIXES = [
  "add ", "apply ", "assign ", "audit ", "check ", "classify ", "collect ",
  "complete ", "configure ", "coordinate ", "correct ", "create ", "deprovision ",
  "dispose ", "document ", "engage ", "enrol ", "escalate ", "grant ", "handle ",
  "install ", "issue ", "join ", "link ", "manage ", "migrate ", "offboard ",
  "onboard ", "perform ", "prepare ", "process ", "provide ", "provision ",
  "record ", "release ", "remove ", "rename ", "replace ", "reset ", "restore ",
  "review ", "securely ", "set ", "support ", "update ", "validate ", "verify "
];

const KNOWN_CONDITION_PATTERNS = [
  /\bdefault gateway failure\b/,
  /\bexpiring tls certificate\b/,
  /\bmemory hardware errors?\b/,
  /\bvpn certificate failure\b/,
  /\bduplicate ip\b/,
  /\bapipa\b/,
  /\bconditional access block\b/,
  /\bdomain trust relationship failure\b/,
  /\bexpired (user )?certificate\b/,
  /\bexhausted dhcp scope\b/,
  /\bcompliance failure\b/,
  /\bpatch compliance failure\b/,
  /\bstorage quota issue\b/,
  /\blow (disk|virtualisation datastore) (space|capacity)\b/,
  /\bhigh (cpu|memory) utilisation\b/,
  /\bserver high (cpu|memory)\b/,
  /\bpacket loss\b/,
  /\bincorrect system time\b/,
  /\bmissing dll\b/,
  /\btemporary windows profile\b/,
  /\bblocked office macros\b/,
  /\bnetwork access control block\b/
];

const INCIDENT_EVENT_PATTERNS = [
  /\bransomware\b/,
  /\bsuspected data leakage\b/,
  /\bsuspected compromised account\b/,
  /\bsuspicious account activity\b/,
  /\bimpossible travel alert\b/,
  /\bmalicious or unknown usb\b/,
  /\bsuspected phishing\b/,
  /\bsuspected malware\b/,
  /\bsocial engineering call\b/,
  /\blost or stolen (computer|mobile device)\b/,
  /\bsite-wide lan outage\b/,
  /\bsite internet outage\b/,
  /\boffice or site-wide outage\b/,
  /\bcloud service outage\b/,
  /\bwireless access point outage\b/
];

const OBSERVABLE_TOKENS = [
  "cannot ", "can't ", "will not ", "won't ", "not working", "not detected",
  "not open", "not start", "not charging", "not connecting", "not available",
  "fails", "failed ", "failure", "offline", "unreachable", "slow", "crashes",
  "crash", "flicker", "no power", "no signal", "no wi-fi", "no ethernet",
  "no dial tone", "black screen", "boot loop", "sign-in loop", "credential prompts",
  "battery drain", "poor call quality", "one-way audio", "search", "synchronisation",
  "sync", "timeout", "access denied", "warning", "error"
];

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function readSymptoms() {
  return fs.readdirSync(SYMPTOM_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const file = path.join(SYMPTOM_DIR, name);
      const parsed = matter(fs.readFileSync(file, "utf8"));
      const slug = parsed.data.slug || path.basename(name, ".md");
      return { file, slug, data: parsed.data };
    });
}

function readOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return {};
  const parsed = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"));
  return parsed.records || {};
}

function classification(objectType, confidence, reason, reviewRequired = confidence !== "high") {
  return { objectType, confidence, reason, reviewRequired };
}

function classify(symptom) {
  const title = normalize(symptom.data.title);
  const description = normalize(symptom.data.description);
  const combined = `${title} ${description}`;

  if (
    /\bvip\b/.test(combined) ||
    /\bexecutive user\b/.test(combined) ||
    /\bcritical (business )?deadline\b/.test(combined) ||
    /\bmultiple users or services may be affected\b/.test(combined)
  ) {
    return classification("context", "high", "Explicit scope/business-context language.");
  }

  // Known technical conditions outrank generic reported/event wording.
  if (KNOWN_CONDITION_PATTERNS.some((pattern) => pattern.test(title))) {
    return classification("known_condition", "high", "Title states a technical condition/diagnosis rather than an initial observation.");
  }

  if (
    title.startsWith("reported ") ||
    INCIDENT_EVENT_PATTERNS.some((pattern) => pattern.test(title))
  ) {
    return classification("incident_event", "high", "Explicit incident/security/outage event language.");
  }

  if (
    title.startsWith("need to ") ||
    title.startsWith("need ") ||
    title.startsWith("request to ") ||
    /\bservice request\b/.test(title)
  ) {
    return classification("service_request", "high", "Explicit request/need wording.");
  }

  if (ACTION_PREFIXES.some((prefix) => title.startsWith(prefix))) {
    return classification("service_request", "medium", "Imperative action wording; review to confirm request versus event.");
  }

  if (OBSERVABLE_TOKENS.some((token) => title.includes(token))) {
    return classification("observable_symptom", "high", "Title directly describes observable behaviour/failure.");
  }

  if (/^(a|an|the)\s+/.test(title)) {
    return classification(
      "context",
      "low",
      "Generic noun/resource phrase with no observable-failure wording; likely environment/context but requires review.",
      true
    );
  }

  return classification(
    "observable_symptom",
    "low",
    "No decisive taxonomy signal; retained as provisional observable symptom pending review.",
    true
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const symptoms = readSymptoms();
const overrides = readOverrides();

const records = {};
for (const symptom of symptoms) {
  const auto = classify(symptom);
  const override = overrides[symptom.slug] || {};
  const objectType = override.object_type || auto.objectType;
  if (!VALID_TYPES.has(objectType)) {
    throw new Error(`${symptom.slug}: invalid object_type '${objectType}'`);
  }

  const accepted = override.reviewed === true;
  records[symptom.slug] = {
    title: symptom.data.title || symptom.slug,
    sourcePath: symptom.file,
    legacyContentType: symptom.data.content_type || "symptom",
    legacySeverity: symptom.data.severity || "medium",
    category: symptom.data.category || "Other",
    objectType,
    confidence: override.confidence || (accepted ? "high" : auto.confidence),
    reviewRequired: accepted ? false : (override.review_required ?? auto.reviewRequired),
    classificationOrigin: override.object_type ? "review_override" : "deterministic_v2",
    reason: override.reason || auto.reason,
    reviewSource: override.review_source || "",
    relatedProcedures: symptom.data.related_procedures || []
  };
}

const counts = {};
let reviewRequired = 0;
let explicitReviewed = 0;
for (const record of Object.values(records)) {
  counts[record.objectType] = (counts[record.objectType] || 0) + 1;
  if (record.reviewRequired) reviewRequired += 1;
  if (record.classificationOrigin === "review_override") explicitReviewed += 1;
}

const payload = {
  schemaVersion: 1,
  model: "ShiftStart Knowledge Model v2 / Phase 1A",
  generatedAt: new Date().toISOString(),
  sourceCollection: "_symptoms",
  sourceCount: symptoms.length,
  objectTypes: [
    { id: "observable_symptom", label: "Observable symptom", definition: "What can be observed before the cause is known." },
    { id: "service_request", label: "Service request", definition: "A request to provision, configure, change, restore or perform an approved service." },
    { id: "known_condition", label: "Known condition / diagnosis", definition: "A technical condition already identified or diagnosed." },
    { id: "context", label: "Context", definition: "Scope, user, business or environment context that changes ranking or urgency." },
    { id: "incident_event", label: "Incident / event", definition: "A security, outage or other event requiring incident-response handling." }
  ],
  counts,
  review: {
    reviewed: symptoms.length - reviewRequired,
    reviewRequired,
    completionPercent: symptoms.length ? Math.round(((symptoms.length - reviewRequired) / symptoms.length) * 1000) / 10 : 0,
    explicitReviewed,
    explicitReviewRequired: symptoms.length - explicitReviewed,
    explicitCompletionPercent: symptoms.length ? Math.round((explicitReviewed / symptoms.length) * 1000) / 10 : 0
  },
  records
};

fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
fs.writeFileSync(REPORT_JSON, JSON.stringify(payload, null, 2) + "\n");

const csvRows = [
  ["slug", "title", "object_type", "confidence", "review_required", "classification_origin", "reason", "legacy_severity", "category"]
];
for (const [slug, record] of Object.entries(records).sort(([a], [b]) => a.localeCompare(b))) {
  csvRows.push([
    slug, record.title, record.objectType, record.confidence, record.reviewRequired,
    record.classificationOrigin, record.reason, record.legacySeverity, record.category
  ]);
}
fs.writeFileSync(
  REPORT_CSV,
  csvRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n"
);

console.log(`Phase 1A taxonomy built for ${symptoms.length} records.`);
console.log(`Object types: ${JSON.stringify(counts)}.`);
console.log(`Reviewed/accepted: ${payload.review.reviewed}; review required: ${reviewRequired}.`);
console.log(`Explicit review overrides: ${payload.review.explicitReviewed}; deterministic-only: ${payload.review.explicitReviewRequired}.`);
