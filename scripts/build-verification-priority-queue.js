#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const PROCEDURE_DIR = '_procedures';
const PRIORITY_POLICY = '_data/verification-priority-policy.yml';
const DEMAND_FILE = '_data/verification-demand.yml';
const BATCH_POLICY_FILE = '_data/verification-batch-policy.yml';

const policy = yaml.load(fs.readFileSync(PRIORITY_POLICY, 'utf8'));
const demand = yaml.load(fs.readFileSync(DEMAND_FILE, 'utf8')) || {};
const batchPolicy = fs.existsSync(BATCH_POLICY_FILE) ? yaml.load(fs.readFileSync(BATCH_POLICY_FILE,'utf8')) : {};

if (Number(policy.schema_version) !== 1) throw new Error('verification-priority-policy.yml schema_version must be 1');

const riskWeights = policy.components?.risk?.weights || {};
const demandTiers = policy.components?.search_demand?.tiers || {};
const escalationTiers = policy.components?.escalation_frequency?.tiers || {};
const criticalityTiers = policy.components?.business_criticality?.tiers || {};
const readinessRules = [...(policy.components?.evidence_readiness?.rules || [])]
  .sort((a,b) => Number(b.minimum_score_percent) - Number(a.minimum_score_percent));

const normaliseTier = (value, allowed) => {
  const key = String(value || 'none').toLowerCase();
  return Object.prototype.hasOwnProperty.call(allowed, key) ? key : 'none';
};
const normalise = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

function containsTerm(haystack, term) {
  const h = ` ${normalise(haystack)} `;
  const t = normalise(term);
  return t ? h.includes(` ${t} `) : false;
}

function temporaryDemandProxy(data) {
  if (policy.temporary_topic_proxy?.enabled !== true) return { tier:'none', source:'none', match:'', sourceField:'none' };

  // IMPORTANT: metadata only. Procedure body text is intentionally excluded.
  const metadata = [
    data.title,
    data.description,
    data.category,
    data.slug,
    ...(Array.isArray(data.tags) ? data.tags : [])
  ].filter(Boolean).join(' ');

  for (const tier of ['very_high','high','medium']) {
    for (const term of policy.temporary_topic_proxy?.[tier] || []) {
      if (containsTerm(metadata, term)) {
        return { tier, source:'temporary_topic_proxy', match:term, sourceField:'metadata_only' };
      }
    }
  }
  return { tier:'none', source:'none', match:'', sourceField:'none' };
}

function resolveDemand(slug, data) {
  const proc = demand.procedures?.[slug] || {};
  const category = demand.categories?.[String(data.category || '')] || {};

  if (data.search_demand_tier) {
    return { tier: normaliseTier(data.search_demand_tier, demandTiers), source:'procedure_front_matter', match:'', sourceField:'front_matter' };
  }
  if (proc.search_demand) {
    return { tier: normaliseTier(proc.search_demand, demandTiers), source: proc.source || 'verification-demand.yml:procedure', match:'', sourceField:'manual_or_telemetry' };
  }
  if (category.search_demand) {
    return { tier: normaliseTier(category.search_demand, demandTiers), source: category.source || 'verification-demand.yml:category', match:'', sourceField:'manual_or_telemetry' };
  }
  return temporaryDemandProxy(data);
}

function resolveTierSignal(slug, data, key, tierMap) {
  const proc = demand.procedures?.[slug] || {};
  const category = demand.categories?.[String(data.category || '')] || {};
  const fmKey = key === 'escalation_frequency' ? 'escalation_frequency_tier' : 'business_criticality_tier';

  if (data[fmKey]) return { tier: normaliseTier(data[fmKey], tierMap), source:'procedure_front_matter' };
  if (proc[key]) return { tier: normaliseTier(proc[key], tierMap), source:proc.source || 'verification-demand.yml:procedure' };
  if (category[key]) return { tier: normaliseTier(category[key], tierMap), source:category.source || 'verification-demand.yml:category' };
  return { tier:'none', source:'none' };
}

function readinessPoints(score) {
  const n = Number(score || 0);
  const rule = readinessRules.find(r => n >= Number(r.minimum_score_percent || 0));
  return Number(rule?.points || 0);
}

function queueBand(score) {
  const bands = Object.entries(policy.queue_bands || {})
    .sort((a,b) => Number(b[1].minimum_score) - Number(a[1].minimum_score));
  for (const [id, item] of bands) {
    if (score >= Number(item.minimum_score || 0)) return { id, label:item.label || id };
  }
  return { id:'backlog', label:'Backlog' };
}

function applyPriorityFloor(priority, score) {
  const floor = batchPolicy.priority_floors?.[priority];
  return floor ? Math.max(score, Number(floor.minimum_score || 0)) : score;
}

const files = fs.readdirSync(PROCEDURE_DIR).filter(x => x.endsWith('.md')).sort();
const rows = [];

for (const name of files) {
  const file = path.join(PROCEDURE_DIR, name);
  const parsed = matter(fs.readFileSync(file, 'utf8'));
  const d = parsed.data;
  const slug = d.slug || path.basename(name, '.md');
  const priority = String(d.verification_priority || 'P3').toUpperCase();
  const governanceState = String(d.verification_governance_state || 'under_review');

  const risk = Number(riskWeights[priority] || 0);
  const demandSignal = resolveDemand(slug, d);
  const searchDemand = Number(demandTiers[demandSignal.tier] || 0);

  const escalationSignal = resolveTierSignal(slug, d, 'escalation_frequency', escalationTiers);
  const escalationFrequency = Number(escalationTiers[escalationSignal.tier] || 0);

  const criticalitySignal = resolveTierSignal(slug, d, 'business_criticality', criticalityTiers);
  const businessCriticality = Number(criticalityTiers[criticalitySignal.tier] || 0);

  const readiness = readinessPoints(d.verification_v2_score_percent);
  const rawScore = risk + searchDemand + escalationFrequency + businessCriticality + readiness;
  const uncapped = Math.min(100, rawScore);
  const score = Math.min(100, applyPriorityFloor(priority, uncapped));
  const band = queueBand(score);

  const blocked = ['verified','deprecated'].includes(governanceState);
  const promotionReady = d.verification_promotion_ready === true;

  rows.push({
    rank: 0,
    slug,
    title: d.title || '',
    category: d.category || '',
    priority,
    governance_state: governanceState,
    verification_score_percent: Number(d.verification_v2_score_percent || 0),
    priority_score: score,
    score_before_priority_floor: uncapped,
    priority_floor_applied: score > uncapped,
    queue_band: blocked ? 'not_actionable' : band.id,
    queue_label: blocked ? (governanceState === 'verified' ? 'Already Verified' : 'Deprecated') : band.label,
    risk_points: risk,
    search_demand_tier: demandSignal.tier,
    search_demand_points: searchDemand,
    search_demand_source: demandSignal.source,
    search_demand_source_field: demandSignal.sourceField || '',
    temporary_proxy_match: demandSignal.match || '',
    escalation_frequency_tier: escalationSignal.tier,
    escalation_frequency_points: escalationFrequency,
    escalation_frequency_source: escalationSignal.source,
    business_criticality_tier: criticalitySignal.tier,
    business_criticality_points: businessCriticality,
    business_criticality_source: criticalitySignal.source,
    evidence_readiness_points: readiness,
    promotion_ready: promotionReady,
    missing_requirements: Array.isArray(d.verification_v2_missing) ? d.verification_v2_missing.join('|') : ''
  });
}

const actionable = rows.filter(r => !['verified','deprecated'].includes(r.governance_state));
actionable.sort((a,b) =>
  Number(b.promotion_ready) - Number(a.promotion_ready) ||
  b.priority_score - a.priority_score ||
  b.verification_score_percent - a.verification_score_percent ||
  a.title.localeCompare(b.title)
);
actionable.forEach((row, index) => row.rank = index + 1);

const completed = rows.filter(r => ['verified','deprecated'].includes(r.governance_state));
completed.sort((a,b) => a.title.localeCompare(b.title));
const ordered = [...actionable, ...completed];

const bandCounts = {};
for (const row of actionable) bandCounts[row.queue_band] = (bandCounts[row.queue_band] || 0) + 1;
const sourceCounts = {};
for (const row of actionable) sourceCounts[row.search_demand_source] = (sourceCounts[row.search_demand_source] || 0) + 1;

const top = actionable.slice(0, 50);
const report = {
  schemaVersion: 2,
  model: policy.model,
  rankingRevision: 'metadata-proxy-and-risk-floor-v2',
  generatedAt: new Date().toISOString(),
  totalProcedures: files.length,
  actionableProcedures: actionable.length,
  queueBandCounts: bandCounts,
  searchDemandSourceCounts: sourceCounts,
  telemetryAvailable: Object.keys(demand.procedures || {}).length > 0 || Object.keys(demand.categories || {}).length > 0,
  temporaryProxyEnabled: policy.temporary_topic_proxy?.enabled === true,
  warning: 'temporary_topic_proxy is metadata-only planning input, not observed user-search telemetry.',
  top50: top
};

fs.mkdirSync('reports', { recursive:true });
fs.mkdirSync('_data', { recursive:true });

fs.writeFileSync('reports/verification-priority-queue.json', JSON.stringify({ ...report, procedures: ordered }, null, 2));
fs.writeFileSync('_data/verification-priority-dashboard.json', JSON.stringify({
  schemaVersion: report.schemaVersion,
  model: report.model,
  rankingRevision: report.rankingRevision,
  generatedAt: report.generatedAt,
  actionableProcedures: report.actionableProcedures,
  queueBandCounts: report.queueBandCounts,
  telemetryAvailable: report.telemetryAvailable,
  temporaryProxyEnabled: report.temporaryProxyEnabled,
  top10: top.slice(0,10)
}, null, 2));

const headers = Object.keys(ordered[0] || {});
const csv = value => /[",\n|]/.test(String(value ?? ''))
  ? `"${String(value ?? '').replace(/"/g,'""')}"`
  : String(value ?? '');
fs.writeFileSync(
  'reports/verification-priority-queue.csv',
  [headers.join(','), ...ordered.map(row => headers.map(h => csv(row[h])).join(','))].join('\n') + '\n'
);

console.log(`Verification priority queue built: ${actionable.length} actionable of ${files.length} total procedures.`);
console.log(`Ranking revision: ${report.rankingRevision}.`);
console.log(`Queue bands: ${JSON.stringify(bandCounts)}.`);
console.log(`Observed/manual demand telemetry present: ${report.telemetryAvailable ? 'yes' : 'no'}.`);
if (!report.telemetryAvailable && report.temporaryProxyEnabled) {
  console.log('Temporary demand proxy is metadata-only and explicitly not user-search telemetry.');
}
console.log('Top 10 verification candidates:');
for (const row of top.slice(0,10)) {
  console.log(`${String(row.rank).padStart(2,' ')}. ${row.priority} score=${row.priority_score} ${row.slug} [${row.queue_label}]`);
}
