const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const governance = JSON.parse(fs.readFileSync("_data/content-governance.json", "utf8"));
const apply = process.argv.includes("--apply");
const checkOnly = process.argv.includes("--check") || !apply;
const changes = [];
const audit = {
  generatedAt: new Date().toISOString(),
  applied: apply,
  procedures: { total: 0, verified: 0, under_review: 0, draft: 0, deprecated: 0 },
  symptoms: { total: 0, titlesCorrected: 0 },
  categoriesCanonicalised: 0,
  filesChanged: 0,
  notes: []
};

const sentenceCase = (value) => {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const normaliseSymptomTitle = (title) => {
  const original = String(title || "").trim();
  const exact = new Map([
    ["And rebuild the Teams cache", "Teams cache needs to be rebuilt"],
    ["Need to initial incident triage", "Initial incident triage required"],
    ["Need to shift handover for open incidents", "Shift handover required for open incidents"]
  ]);
  if (exact.has(original)) return exact.get(original);

  let match = original.match(/^Need to (?:a|an) (.+)$/i);
  if (match) return `${sentenceCase(match[1])} required`;

  match = original.match(/^Request to (?:a|an) (.+)$/i);
  if (match) return `${sentenceCase(match[1])} requested`;

  return original;
};

const isGeneratedBaseline = (data, content) =>
  /^Enterprise runbook to\b/i.test(String(data.description || "")) ||
  /Use this runbook for \*\*/.test(content) ||
  /## Scenario-specific diagnostic and remediation plan/.test(content);

const canonicalCategory = (category) => governance.canonicalCategories[category] || category;

function writeIfChanged(file, parsed, original) {
  const output = matter.stringify(parsed.content, parsed.data, { lineWidth: 1000 });
  if (output === original) return;
  changes.push(file);
  if (apply) fs.writeFileSync(file, output);
}

function processCollection(dir, type) {
  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".md")).sort()) {
    const file = path.join(dir, name);
    const original = fs.readFileSync(file, "utf8");
    const parsed = matter(original);
    const data = parsed.data;
    const slug = data.slug || path.basename(name, ".md");

    if (data.category) {
      const nextCategory = canonicalCategory(data.category);
      if (nextCategory !== data.category) {
        data.category = nextCategory;
        audit.categoriesCanonicalised += 1;
      }
    }

    if (type === "procedure") {
      audit.procedures.total += 1;
      const generated = isGeneratedBaseline(data, parsed.content);
      const isVerified = governance.verifiedProcedures.includes(slug) && !generated;
      const status = data.content_status || (isVerified ? "verified" : "under_review");
      data.content_status = status;
      data.generated_baseline = generated;
      data.reviewed_by = data.reviewed_by || (isVerified ? "ShiftStart technical review" : "");
      data.last_tested = data.last_tested || "";
      data.tested_platforms = data.tested_platforms || data.platforms || [];
      data.source_references = data.source_references || [];
      data.change_record = data.change_record || (isVerified
        ? "Original procedure retained and placed under content-governance controls."
        : "Enterprise baseline retained in full; technical-owner validation is required before production changes.");
      data.quality_gate = data.quality_gate || (isVerified ? "passed" : "pending");
      audit.procedures[status] = (audit.procedures[status] || 0) + 1;
    }

    if (type === "symptom") {
      audit.symptoms.total += 1;
      const corrected = normaliseSymptomTitle(data.title);
      if (corrected !== data.title) {
        data.title = corrected;
        data.description = `Observable report: ${corrected}. Select it with any other symptoms to receive ranked procedures.`;
        audit.symptoms.titlesCorrected += 1;
      }
    }

    writeIfChanged(file, parsed, original);
  }
}

processCollection("_procedures", "procedure");
processCollection("_symptoms", "symptom");
processCollection("_causes", "cause");
processCollection("_commands", "command");

audit.filesChanged = changes.length;
audit.notes.push("All procedures remain present; remediation changes metadata, taxonomy and trust signalling without deleting or truncating content.");
audit.notes.push("Generated baseline procedures are marked under_review until a named technical owner validates commands and expected results in the target environment.");

fs.mkdirSync("reports", { recursive: true });
if (apply) fs.writeFileSync("reports/content-remediation.json", JSON.stringify(audit, null, 2));

if (checkOnly && changes.length) {
  console.error(`Content remediation is required in ${changes.length} files.`);
  console.error(changes.slice(0, 30).join("\n"));
  if (changes.length > 30) console.error(`...and ${changes.length - 30} more files.`);
  process.exit(1);
}

console.log(`${apply ? "Applied" : "Checked"} content remediation: ${audit.procedures.total} procedures, ${audit.symptoms.total} symptoms, ${audit.symptoms.titlesCorrected} title corrections, ${audit.categoriesCanonicalised} category updates, ${changes.length} files changed.`);
