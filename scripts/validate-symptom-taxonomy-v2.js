const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const reportPath = path.join("reports", "symptom-taxonomy-v2.json");
const expectedCount = 446;
const validTypes = new Set([
  "observable_symptom",
  "service_request",
  "known_condition",
  "context",
  "incident_event"
]);
const validConfidence = new Set(["high", "medium", "low"]);

function fail(message) {
  console.error(`Phase 1A taxonomy validation FAILED: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(reportPath)) fail(`${reportPath} is missing; run npm run taxonomy:v2:build`);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const symptomFiles = fs.readdirSync("_symptoms").filter((name) => name.endsWith(".md")).sort();
if (symptomFiles.length !== expectedCount) fail(`expected ${expectedCount} symptom source files, found ${symptomFiles.length}`);

const sourceSlugs = new Set();
for (const name of symptomFiles) {
  const parsed = matter(fs.readFileSync(path.join("_symptoms", name), "utf8"));
  sourceSlugs.add(parsed.data.slug || path.basename(name, ".md"));
}

const records = report.records || {};
const recordSlugs = Object.keys(records);
if (recordSlugs.length !== expectedCount) fail(`expected ${expectedCount} taxonomy records, found ${recordSlugs.length}`);

for (const slug of sourceSlugs) {
  if (!records[slug]) fail(`missing taxonomy record for ${slug}`);
}
for (const slug of recordSlugs) {
  if (!sourceSlugs.has(slug)) fail(`taxonomy contains stale/unknown slug ${slug}`);
  const record = records[slug];
  if (!validTypes.has(record.objectType)) fail(`${slug}: invalid objectType ${record.objectType}`);
  if (!validConfidence.has(record.confidence)) fail(`${slug}: invalid confidence ${record.confidence}`);
  if (typeof record.reviewRequired !== "boolean") fail(`${slug}: reviewRequired must be boolean`);
  if (record.legacyContentType !== "symptom") fail(`${slug}: legacyContentType changed unexpectedly`);
}

const requiredExamples = {
  "enrol-an-iphone-or-ipad-into-mdm": "service_request",
  "reported-a-ransomware-alert": "incident_event",
  "a-failed-keyboard": "observable_symptom",
  "a-duplicate-ip-address": "known_condition",
  "support-a-vip-or-executive-user": "context"
};
for (const [slug, expectedType] of Object.entries(requiredExamples)) {
  if (!records[slug]) fail(`required exemplar ${slug} is missing`);
  if (records[slug].objectType !== expectedType) {
    fail(`${slug}: expected ${expectedType}, found ${records[slug].objectType}`);
  }
}

const totalByType = Object.values(report.counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
if (totalByType !== expectedCount) fail(`object-type counts total ${totalByType}, expected ${expectedCount}`);

console.log("Phase 1A taxonomy validation passed.");
console.log(`Coverage: ${recordSlugs.length}/${expectedCount} records classified; URLs/source records preserved.`);
console.log(`Object types: ${JSON.stringify(report.counts)}.`);
console.log(`Review progress: ${report.review.reviewed} accepted; ${report.review.reviewRequired} require review.`);
