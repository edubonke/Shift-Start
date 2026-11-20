const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const baseurl = (process.env.BASEURL || "").replace(/\/$/, "");
const readCollection = (dir) => fs.readdirSync(dir).filter((name) => name.endsWith(".md")).map((name) => {
  const file = path.join(dir, name);
  const parsed = matter(fs.readFileSync(file, "utf8"));
  return { file, slug: parsed.data.slug || path.basename(name, ".md"), data: parsed.data };
});

const effectiveProcedureStatus = (data) => {
  const governance = data.verification_governance_state || data.content_status || "under_review";
  if (governance === "verified") {
    return data.verification_v2_complete === true && data.verification_promotion_ready === true
      ? "verified"
      : "revalidation_required";
  }
  return governance;
};

const symptoms = readCollection("_symptoms");
const procedures = readCollection("_procedures");

const taxonomyPath = path.join("reports", "symptom-taxonomy-v2.json");
if (!fs.existsSync(taxonomyPath)) {
  throw new Error("Phase 1A taxonomy report missing. Run npm run taxonomy:v2:build first.");
}
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));
const taxonomyRecords = taxonomy.records || {};
for (const symptom of symptoms) {
  if (!taxonomyRecords[symptom.slug]) {
    throw new Error(`Missing Phase 1A taxonomy record for ${symptom.slug}`);
  }
}
const inferred = new Map(symptoms.map((symptom) => [symptom.slug, new Set(symptom.data.related_procedures || [])]));
for (const procedure of procedures) {
  for (const symptom of procedure.data.related_symptoms || []) {
    if (!inferred.has(symptom)) inferred.set(symptom, new Set());
    inferred.get(symptom).add(procedure.slug);
  }
}

const statusCounts = procedures.reduce((acc, procedure) => {
  const status = effectiveProcedureStatus(procedure.data);
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

const objectTypeCounts = symptoms.reduce((acc, symptom) => {
  const type = taxonomyRecords[symptom.slug].objectType;
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

const payload = {
  schemaVersion: 5,
  generatedAt: new Date().toISOString(),
  counts: { symptoms: symptoms.length, procedures: procedures.length, statuses: statusCounts, objectTypes: objectTypeCounts },
  objectTypes: taxonomy.objectTypes || [],
  categories: [...new Set(symptoms.map((symptom) => symptom.data.category || "Other"))].sort(),
  symptoms: symptoms.map((symptom) => ({
    id: symptom.slug,
    title: symptom.data.title,
    description: symptom.data.description || "",
    category: symptom.data.category || "Other",
    severity: symptom.data.severity || "medium",
    legacySeverity: symptom.data.severity || "medium",
    objectType: taxonomyRecords[symptom.slug].objectType,
    taxonomyConfidence: taxonomyRecords[symptom.slug].confidence,
    taxonomyReviewRequired: taxonomyRecords[symptom.slug].reviewRequired,
    tags: symptom.data.tags || [],
    relatedProcedures: [...(inferred.get(symptom.slug) || [])].sort()
  })).sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title)),
  procedures: procedures.map((procedure) => ({
    id: procedure.slug,
    title: procedure.data.title,
    description: procedure.data.description || "",
    category: procedure.data.category || "Other",
    severity: procedure.data.severity || "medium",
    supportTier: procedure.data.support_tier || "",
    ownerTeam: procedure.data.owner_team || "",
    platforms: procedure.data.platforms || [],
    symptoms: procedure.data.related_symptoms || [],
    symptomWeights: procedure.data.symptom_weights || {},
    contentStatus: effectiveProcedureStatus(procedure.data),
    legacyContentStatus: procedure.data.content_status || "under_review",
    verificationGovernanceState: procedure.data.verification_governance_state || "",
    verificationV2Complete: procedure.data.verification_v2_complete === true,
    verificationPromotionReady: procedure.data.verification_promotion_ready === true,
    reviewedBy: procedure.data.reviewed_by || "",
    lastTested: procedure.data.last_tested || "",
    qualityGate: procedure.data.quality_gate || "pending",
    generatedBaseline: procedure.data.generated_baseline === true,
    url: `${baseurl}/procedures/${procedure.slug}/`.replace(/\/{2,}/g, "/")
  })).sort((a, b) => a.title.localeCompare(b.title))
};

const output = path.join("assets", "data", "wizard-data.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(payload, null, 2));
console.log(`Generated governed multi-select wizard with ${payload.counts.symptoms} symptoms and ${payload.counts.procedures} procedures: ${JSON.stringify(statusCounts)}`);
