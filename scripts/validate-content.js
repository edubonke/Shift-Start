const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");

const governance = JSON.parse(fs.readFileSync("_data/content-governance.json", "utf8"));
const collections = ["procedures", "symptoms", "causes", "commands"];
const required = {
  procedure: ["title", "description", "content_type", "category", "severity", "tags", "tldr", "escalation", "permalink", "content_status"],
  symptom: ["title", "description", "content_type", "category", "severity", "tags", "related_procedures", "permalink"],
  cause: ["title", "description", "content_type", "probability", "related_symptoms", "permalink"],
  command: ["title", "description", "content_type", "platform", "permalink"]
};
const statuses = new Set(Object.keys(governance.statuses));
const errors = [];
const warnings = [];
const records = {};
const commandUse = new Map();

const malformedTitle = /^(?:Need to (?:a|an) |Request to (?:a|an) |And rebuild\b|Need to initial\b|Need to shift handover\b|A paper jam safely$)|\brequest requested$/i;
const duplicateCategories = new Set(Object.keys(governance.canonicalCategories));
const genericDescriptions = /^Enterprise runbook to\b/i;

const effectiveProcedureStatus = (data) => {
  const governanceStatus =
    data.verification_governance_state ||
    data.content_status ||
    "under_review";

  if (governanceStatus === "verified") {
    return (
      data.verification_v2_complete === true &&
      data.verification_promotion_ready === true
    )
      ? "verified"
      : "revalidation_required";
  }

  return governanceStatus;
};


for (const collection of collections) {
  const dir = `_${collection}`;
  records[collection] = new Map();
  if (!fs.existsSync(dir)) {
    errors.push(`Missing collection directory: ${dir}`);
    continue;
  }

  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".md")).sort()) {
    const file = path.join(dir, name);
    const parsed = matter(fs.readFileSync(file, "utf8"));
    const data = parsed.data;
    const slug = data.slug || path.basename(name, ".md");
    records[collection].set(slug, { file, data, content: parsed.content });

    for (const key of required[data.content_type] || []) {
      if (data[key] === undefined || data[key] === "") errors.push(`${file}: missing ${key}`);
    }

    if (parsed.content.includes("{% command")) errors.push(`${file}: legacy Eleventy shortcode remains`);
    if (data.category && duplicateCategories.has(data.category)) errors.push(`${file}: duplicate taxonomy category '${data.category}' must be canonicalised`);
    if (data.title && malformedTitle.test(data.title)) errors.push(`${file}: malformed generated title '${data.title}'`);

    if (data.content_type === "procedure") {
      if (!statuses.has(data.content_status)) errors.push(`${file}: invalid content_status '${data.content_status}'`);
      if (!data.related_symptoms?.length) errors.push(`${file}: procedure is absent from symptom matching`);
      const effectiveStatus = effectiveProcedureStatus(data);
      const isDeprecatedCompatibility =
        effectiveStatus === "deprecated" ||
        data.content_status === "deprecated";

      if (data.owner_team && !isDeprecatedCompatibility && parsed.content.length < 1200) {
        errors.push(
          `${file}: procedure content is too short for enterprise use`
        );
      }

      const generated = data.generated_baseline === true || genericDescriptions.test(String(data.description || ""));
      if (effectiveStatus === "verified") {
        if (!data.reviewed_by) {
          errors.push(`${file}: verified procedure requires reviewed_by`);
        }

        if (generated) {
          errors.push(`${file}: generated baseline cannot be marked verified`);
        }

        if (data.quality_gate !== "passed") {
          errors.push(
            `${file}: verified procedure requires quality_gate: passed`
          );
        }

        if (
          data.verification_v2_complete !== true ||
          data.verification_promotion_ready !== true
        ) {
          errors.push(
            `${file}: governance verified requires verification-v2 completion and promotion readiness`
          );
        }
      } else if (data.content_status === "verified") {
        warnings.push(
          `${file}: legacy content_status verified is non-authoritative; effective status is '${effectiveStatus}'`
        );
      }

      const captures = [...parsed.content.matchAll(/\{% capture [^%]+ %\}\n([\s\S]*?)\n\{% endcapture %\}/g)].map((match) => match[1].trim());
      for (const command of captures) {
        const key = command.replace(/\s+/g, " ").trim();
        if (!commandUse.has(key)) commandUse.set(key, []);
        commandUse.get(key).push({ file, status: effectiveStatus, category: data.category });
      }
    }
  }
}

for (const [, procedure] of records.procedures) {
  for (const symptom of procedure.data.related_symptoms || []) {
    if (!records.symptoms.has(symptom)) errors.push(`${procedure.file}: missing related symptom ${symptom}`);
  }
}

for (const [, symptom] of records.symptoms) {
  if (!(symptom.data.related_procedures || []).length) errors.push(`${symptom.file}: symptom has no related procedure`);
  for (const procedure of symptom.data.related_procedures || []) {
    if (!records.procedures.has(procedure)) errors.push(`${symptom.file}: missing related procedure ${procedure}`);
  }
}

const groupMembership = records.procedures.get("add-or-remove-security-group-membership");
if (groupMembership) {
  const body = groupMembership.content;
  for (const requiredCommand of ["Get-ADGroupMember", "Add-ADGroupMember", "Remove-ADGroupMember", "Get-MgGroupMember"]) {
    if (!body.includes(requiredCommand)) errors.push(`${groupMembership.file}: missing group-specific command ${requiredCommand}`);
  }
  if (/Get-ADUser[^\n]+LockedOut,PasswordExpired/.test(body)) errors.push(`${groupMembership.file}: unrelated account-lockout command remains`);
}

for (const [command, uses] of commandUse) {
  if (uses.length < 10) continue;
  const verifiedUses = uses.filter((use) => use.status === "verified");
  if (verifiedUses.length) {
    errors.push(`A repeated generic command block is used by ${uses.length} procedures including verified content: ${verifiedUses.map((use) => use.file).join(", ")}`);
  } else {
    warnings.push(`Generic command block reused by ${uses.length} under-review procedures: ${command.slice(0, 120)}...`);
  }
}

const listLayout = fs.readFileSync("_layouts/list.html", "utf8");
if (/for\s+item\s+in\s+\w+\s+limit:/i.test(listLayout)) errors.push("_layouts/list.html: catalogue must not limit or truncate items");
const articleLayout = fs.readFileSync("_layouts/article.html", "utf8");
if (/data-ticket-link[^>]+href=["']#["']/.test(articleLayout)) errors.push("_layouts/article.html: ITSM button must not use href='#'");

const kb = yaml.load(fs.readFileSync("_data/kb.yml", "utf8"));
if (String(kb?.itsm?.ticketUrlTemplate || kb?.ticketUrlTemplate || "").includes("example.com")) {
  errors.push("_data/kb.yml: example ITSM URL must not be presented as configured integration");
}

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  counts: Object.fromEntries(Object.entries(records).map(([name, collection]) => [name, collection.size])),
  statusCounts: [...records.procedures.values()].reduce((acc, item) => {
    const status = effectiveProcedureStatus(item.data);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}),
  legacyStatusCounts: [...records.procedures.values()].reduce((acc, item) => {
    const status = item.data.content_status || "missing";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}),
  errors,
  warnings,
  checks: {
    malformedTitles: { detected: errors.filter((entry) => entry.includes("malformed generated title")).length, passed: !errors.some((entry) => entry.includes("malformed generated title")) },
    duplicateTaxonomy: { detected: errors.filter((entry) => entry.includes("duplicate taxonomy category")).length, passed: !errors.some((entry) => entry.includes("duplicate taxonomy category")) },
    reusedGenericCommands: { detected: warnings.filter((entry) => entry.includes("Generic command block reused")).length, passed: !warnings.some((entry) => entry.includes("Generic command block reused")) },
    procedureAssuranceBanner: { passed: articleLayout.includes("assurance-banner") },
    globalQualityNavigation: { passed: fs.readFileSync("_includes/header.html", "utf8").includes("/content-quality/") }
  }
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/content-audit.json", JSON.stringify(report, null, 2));

if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Enterprise validation passed: ${records.procedures.size} procedures, ${records.symptoms.size} symptoms, ${records.causes.size} causes, ${records.commands.size} command articles. Statuses: ${JSON.stringify(report.statusCounts)}.`);
