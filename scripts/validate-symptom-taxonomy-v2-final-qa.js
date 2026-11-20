const fs = require("fs");
const path = require("path");

const REPORT = path.join("reports", "symptom-taxonomy-v2.json");
const OVERRIDES = path.join("_data", "symptom-taxonomy-v2-overrides.json");
const EXPECTED_SYMPTOMS = 446;
const EXPECTED_PROCEDURES = 421;
const EXPECTED_COUNTS = {
  observable_symptom: 204,
  service_request: 119,
  known_condition: 60,
  context: 40,
  incident_event: 23
};
const REQUIRED_CORRECTIONS = {
  "a-default-gateway-failure": "known_condition",
  "memory-hardware-errors": "known_condition",
  "reported-an-expiring-tls-certificate": "known_condition",
  "vpn-certificate-failure": "known_condition"
};

function fail(message) {
  console.error(`Phase 1A final QA validation FAILED: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(REPORT)) fail(`${REPORT} is missing; run npm run taxonomy:v2:build`);
if (!fs.existsSync(OVERRIDES)) fail(`${OVERRIDES} is missing`);

const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
const overrides = JSON.parse(fs.readFileSync(OVERRIDES, "utf8"));
const records = report.records || {};
const overrideRecords = overrides.records || {};
const symptomFiles = fs.readdirSync("_symptoms").filter((name) => name.endsWith(".md"));
const procedureFiles = fs.readdirSync("_procedures").filter((name) => name.endsWith(".md"));

if (symptomFiles.length !== EXPECTED_SYMPTOMS) fail(`expected ${EXPECTED_SYMPTOMS} symptom files, found ${symptomFiles.length}`);
if (procedureFiles.length !== EXPECTED_PROCEDURES) fail(`expected ${EXPECTED_PROCEDURES} procedures, found ${procedureFiles.length}`);
if (Object.keys(records).length !== EXPECTED_SYMPTOMS) fail(`expected ${EXPECTED_SYMPTOMS} taxonomy records, found ${Object.keys(records).length}`);
if (Object.keys(overrideRecords).length !== EXPECTED_SYMPTOMS) fail(`expected ${EXPECTED_SYMPTOMS} explicit overrides, found ${Object.keys(overrideRecords).length}`);

for (const [slug, record] of Object.entries(records)) {
  if (record.reviewRequired !== false) fail(`${slug}: reviewRequired must be false`);
  if (record.classificationOrigin !== "review_override") fail(`${slug}: expected review_override origin, found ${record.classificationOrigin}`);
  if (!String(record.reviewSource || "").trim()) fail(`${slug}: reviewSource is empty`);
  const override = overrideRecords[slug];
  if (!override) fail(`${slug}: override ledger entry is missing`);
  if (override.reviewed !== true) fail(`${slug}: override reviewed flag is not true`);
  if (override.object_type !== record.objectType) fail(`${slug}: override/report object type mismatch`);
}

for (const [type, expected] of Object.entries(EXPECTED_COUNTS)) {
  const actual = Number((report.counts || {})[type] || 0);
  if (actual !== expected) fail(`${type}: expected ${expected}, found ${actual}`);
}
const total = Object.values(report.counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
if (total !== EXPECTED_SYMPTOMS) fail(`object-type counts total ${total}, expected ${EXPECTED_SYMPTOMS}`);

for (const [slug, expectedType] of Object.entries(REQUIRED_CORRECTIONS)) {
  if (!records[slug]) fail(`required QA correction ${slug} is missing`);
  if (records[slug].objectType !== expectedType) fail(`${slug}: expected ${expectedType}, found ${records[slug].objectType}`);
}

const review = report.review || {};
if (review.reviewed !== EXPECTED_SYMPTOMS || review.reviewRequired !== 0) fail(`review queue must be 446/0; got ${review.reviewed}/${review.reviewRequired}`);
if (review.explicitReviewed !== EXPECTED_SYMPTOMS || review.explicitReviewRequired !== 0) fail(`explicit review must be 446/0; got ${review.explicitReviewed}/${review.explicitReviewRequired}`);
if (review.explicitCompletionPercent !== 100) fail(`explicitCompletionPercent must be 100, found ${review.explicitCompletionPercent}`);

console.log("Phase 1A final QA validation passed.");
console.log("Explicit taxonomy review: 446/446 records; deterministic-only classifications: 0.");
console.log(`Final object types: ${JSON.stringify(report.counts)}.`);
console.log("Procedures preserved: 421; legacy symptom records/URLs preserved: 446.");
