#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const MODE = process.argv.includes('--promote') ? 'promote' : process.argv.includes('--apply') ? 'apply' : 'report';
const DIR = '_procedures';
const POLICY_FILE = '_data/verification-policy.yml';
const TODAY = new Date().toISOString().slice(0, 10);
const REQUIRED_HEADINGS = [
  '## Diagnostic Steps',
  '## Remediation Steps',
  '## Rollback Steps',
  '## Verification Steps',
  '## Escalation Path'
];

const policy = yaml.load(fs.readFileSync(POLICY_FILE, 'utf8'));
if (Number(policy.schema_version) !== 2) throw new Error('verification-policy.yml must be schema_version 2');

const priorityDefaults = { critical: 'P0', high: 'P1', medium: 'P2', low: 'P3' };
const priorities = policy.priority_levels || {};
const governanceStates = new Set(Object.keys(policy.governance_states || {}));
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
const nonEmpty = value => typeof value === 'string' && value.trim().length > 1;
const array = value => Array.isArray(value) ? value : [];

function addDays(dateString, days) {
  const d = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

function effectivePriority(data) {
  const risk = String(data.severity || '').toLowerCase();
  const override = String(data.verification_priority_override || '').toUpperCase();
  if (override === 'P4' && risk === 'low') return 'P4';
  const existing = String(data.verification_priority || '').toUpperCase();
  const defaultPriority = priorityDefaults[risk] || 'P3';
  if (existing === 'P4' && risk === 'low') return 'P4';
  return ['P0','P1','P2','P3'].includes(existing) && existing === defaultPriority ? existing : defaultPriority;
}

function reviewerName(value) {
  if (typeof value === 'string') return value.trim();
  return String(value?.name || '').trim();
}
function reviewerFlag(value, flag) {
  return typeof value === 'object' && value !== null && value[flag] === true;
}

function authoritativeSources(data) {
  return array(data.source_provenance).filter(source => {
    if (!source || typeof source !== 'object') return false;
    return source.authoritative === true &&
      nonEmpty(source.publisher) &&
      nonEmpty(source.title) &&
      validDate(source.retrieved_at) &&
      (nonEmpty(source.url) || nonEmpty(source.document_ref));
  });
}

function validTestRecords(data) {
  return array(data.verification_evidence?.test_environments).filter(record => {
    if (!record || typeof record !== 'object') return false;
    return nonEmpty(record.environment) &&
      nonEmpty(record.platform) &&
      String(record.result || '').toLowerCase() === String(policy.test_record_pass_value || 'passed').toLowerCase() &&
      validDate(record.tested_at);
  });
}

function documentationReady(data, content) {
  if (!nonEmpty(data.owner_team) || !nonEmpty(data.support_tier) || !nonEmpty(data.estimated_time)) return false;
  if (data.runbook_template !== policy.enterprise_runbook?.version) return false;
  let previous = -1;
  for (const heading of REQUIRED_HEADINGS) {
    const at = content.indexOf(heading);
    if (at < 0 || at <= previous) return false;
    previous = at;
  }
  return true;
}

function evaluate(data, content) {
  const priority = effectivePriority(data);
  const req = priorities[priority];
  if (!req) throw new Error(`Missing verification policy for ${priority}`);

  const ev = data.verification_evidence || {};
  const executionRequired = data.execution_required !== false;
  const tests = validTestRecords(data);
  const distinctEnvironments = new Set(tests.map(x => String(x.environment).trim().toLowerCase())).size;
  const reviewers = array(ev.peer_reviewers).filter(x => reviewerName(x).length > 1);
  const smeReviewers = reviewers.filter(x => reviewerFlag(x, 'sme'));
  const technicalReviewers = reviewers.filter(x => reviewerFlag(x, 'technical') || reviewerFlag(x, 'sme'));
  const sources = authoritativeSources(data);

  const requiredTestRecords =
    priority === 'P4' && !executionRequired && req.allow_zero_test_records_when_execution_required_false
      ? 0 : Number(req.minimum_test_records || 0);
  const requiredDistinct =
    requiredTestRecords === 0 ? 0 : Number(req.minimum_distinct_environments || 0);

  const rollbackPassed =
    ev.rollback_confirmed === true ||
    (ev.irreversible_change === true && nonEmpty(ev.irreversibility_approved_by) && ev.stop_conditions_confirmed === true);

  const checks = [];
  const check = (id, passed, label) => checks.push({ id, passed: Boolean(passed), label });

  if (!(priority === 'P4' && !executionRequired)) {
    check('diagnostic_tested', ev.diagnostic_tested === true, 'Diagnostic path tested');
    check('remediation_tested', ev.remediation_tested === true, 'Remediation path tested');
    check('rollback_or_irreversibility_confirmed', rollbackPassed, 'Rollback tested or irreversibility formally approved');
    check('escalation_confirmed', ev.escalation_confirmed === true, 'Escalation path confirmed');
    check('time_validated', ev.time_validated === true, 'Execution time validated');
  }

  check('expected_result_confirmed', ev.expected_result_confirmed === true, 'Expected result confirmed');
  check('owner_signoff', nonEmpty(ev.owner_signoff), 'Named owner sign-off recorded');
  check('authoritative_source_provenance', sources.length >= 1, 'Authoritative source provenance recorded');
  check('tested_platforms', priority === 'P4' && !executionRequired ? true : array(data.tested_platforms).length > 0, 'Tested platforms recorded');
  check('last_tested', priority === 'P4' && !executionRequired ? validDate(data.last_tested) || validDate(data.last_reviewed) : validDate(data.last_tested), 'Last tested/reviewed date recorded');
  check('minimum_peer_reviewers', reviewers.length >= Number(req.minimum_peer_reviewers || 0), `Minimum ${req.minimum_peer_reviewers || 0} peer reviewer(s)`);
  if (Number(req.minimum_sme_reviewers || 0) > 0) {
    check('minimum_sme_reviewers', smeReviewers.length >= Number(req.minimum_sme_reviewers), `Minimum ${req.minimum_sme_reviewers} SME reviewer(s)`);
  }
  if (Number(req.minimum_technical_reviewers || 0) > 0) {
    check('minimum_technical_reviewers', technicalReviewers.length >= Number(req.minimum_technical_reviewers), `Minimum ${req.minimum_technical_reviewers} technical reviewer(s)`);
  }
  check('minimum_test_records', tests.length >= requiredTestRecords, `Minimum ${requiredTestRecords} passing test record(s)`);
  check('minimum_distinct_environments', distinctEnvironments >= requiredDistinct, `Minimum ${requiredDistinct} distinct environment(s)`);
  if (req.negative_path_required === true) {
    check('negative_path_tested', ev.negative_path_tested === true, 'Negative/failure path tested');
  }
  check('owner_team', nonEmpty(data.owner_team), 'Owner team recorded');
  check('support_tier', nonEmpty(data.support_tier), 'Support tier recorded');
  check('estimated_time', nonEmpty(data.estimated_time), 'Estimated time recorded');

  const missing = checks.filter(x => !x.passed).map(x => x.id);
  const complete = missing.length === 0;
  const score = checks.length ? Math.round((checks.filter(x => x.passed).length / checks.length) * 100) : 0;

  const evidenceDate = validDate(data.last_tested) ? data.last_tested : validDate(data.last_reviewed) ? data.last_reviewed : '';
  const calculatedDue = evidenceDate ? addDays(evidenceDate, req.review_sla_days) : '';
  const nextReviewDue = calculatedDue || (validDate(data.next_review_due) ? data.next_review_due : '');
  const expired = complete && nextReviewDue && nextReviewDue < TODAY;

  const rawStatus = String(data.content_status || 'under_review');
  const docsReady = documentationReady(data, content);
  let governanceState;
  if (rawStatus === 'deprecated') governanceState = 'deprecated';
  else if (rawStatus === 'draft') governanceState = 'draft';
  else if (rawStatus === 'verified') governanceState = complete && !expired ? 'verified' : 'revalidation_required';
  else if (rawStatus === 'under_review') governanceState = docsReady ? 'live_validation_pending' : 'under_review';
  else governanceState = 'under_review';

  if (!governanceStates.has(governanceState)) throw new Error(`Invalid governance state ${governanceState}`);

  return {
    priority,
    checks,
    missing,
    complete,
    score,
    tests: tests.length,
    distinctEnvironments,
    reviewers: reviewers.length,
    smeReviewers: smeReviewers.length,
    technicalReviewers: technicalReviewers.length,
    authoritativeSources: sources.length,
    docsReady,
    nextReviewDue,
    expired,
    governanceState,
    promotionReady: rawStatus === 'under_review' && complete && !expired
  };
}

function serialize(data, content) {
  const front = yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false }).trim();
  return `---\n${front}\n---\n${content.replace(/^\n+/, '')}`;
}

const files = fs.readdirSync(DIR).filter(x => x.endsWith('.md')).sort();
const rows = [];
const stateCounts = {};
let promoted = 0;
let evidenceCompleteVerified = 0;
let rawVerified = 0;

for (const name of files) {
  const file = path.join(DIR, name);
  const parsed = matter(fs.readFileSync(file, 'utf8'));
  const data = parsed.data;
  const result = evaluate(data, parsed.content);

  data.verification_schema_version = 2;
  data.verification_priority = result.priority;
  data.verification_governance_state = result.governanceState;
  data.verification_v2_complete = result.complete && !result.expired;
  data.verification_v2_score_percent = result.score;
  data.verification_v2_missing = result.missing;
  data.verification_promotion_ready = result.promotionReady;

  if (result.nextReviewDue && result.complete) data.next_review_due = result.nextReviewDue;

  if (data.content_status === 'verified') {
    rawVerified++;
    if (result.governanceState === 'verified') {
      data.verification_evidence_state = 'complete';
      evidenceCompleteVerified++;
    } else {
      data.verification_evidence_state = 'legacy_verified_pending_revalidation';
    }
  }

  if (data.content_status === 'under_review') {
    data.verification_state = result.promotionReady ? 'evidence_complete_pending_promotion' : 'awaiting_live_validation';
  }

  if (MODE === 'promote' && result.promotionReady) {
    data.content_status = 'verified';
    data.quality_gate = 'passed';
    data.generated_baseline = false;
    data.verification_evidence_state = 'complete';
    data.verification_state = 'verified';
    data.verification_governance_state = 'verified';
    data.verification_v2_complete = true;
    data.verification_promotion_ready = false;
    data.reviewed_by = data.verification_evidence.owner_signoff;
    data.last_reviewed = TODAY;
    data.last_verified = TODAY;
    promoted++;
    evidenceCompleteVerified++;
  }

  stateCounts[data.verification_governance_state] = (stateCounts[data.verification_governance_state] || 0) + 1;

  rows.push({
    priority: data.verification_priority,
    slug: data.slug || path.basename(name, '.md'),
    title: data.title || '',
    category: data.category || '',
    content_status: data.content_status || '',
    governance_state: data.verification_governance_state,
    evidence_complete_v2: data.verification_v2_complete === true,
    evidence_score_percent: data.verification_v2_score_percent,
    promotion_ready: data.verification_promotion_ready === true,
    next_review_due: data.next_review_due || '',
    missing_requirements: array(data.verification_v2_missing).join('|')
  });

  if (MODE === 'apply' || MODE === 'promote') {
    fs.writeFileSync(file, serialize(data, parsed.content));
  }
}

const order = { P0:0, P1:1, P2:2, P3:3, P4:4 };
rows.sort((a,b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9) ||
  Number(b.promotion_ready) - Number(a.promotion_ready) ||
  a.title.localeCompare(b.title));

fs.mkdirSync('reports', { recursive:true });
fs.mkdirSync('_data', { recursive:true });

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  policyVersion: policy.schema_version,
  totalProcedures: files.length,
  rawVerified,
  evidenceCompleteVerified,
  targetEvidenceComplete: Number(policy.verified_target_count || Math.ceil(files.length * 0.8)),
  remainingToTarget: Math.max(0, Number(policy.verified_target_count || Math.ceil(files.length * 0.8)) - evidenceCompleteVerified),
  governanceStateCounts: stateCounts,
  newlyPromotedThisRun: promoted,
  note: 'verification_governance_state is the authoritative public state. A raw content_status of verified is not sufficient.'
};

fs.writeFileSync('reports/verification-v2.json', JSON.stringify({ ...report, procedures: rows }, null, 2));
fs.writeFileSync('_data/verification-v2-dashboard.json', JSON.stringify(report, null, 2));

const headers = Object.keys(rows[0] || {});
const csv = v => /[",\n|]/.test(String(v ?? '')) ? `"${String(v ?? '').replace(/"/g,'""')}"` : String(v ?? '');
fs.writeFileSync('reports/verification-v2.csv',
  [headers.join(','), ...rows.map(row => headers.map(h => csv(row[h])).join(','))].join('\n') + '\n');

console.log(`Verification v2 ${MODE}: ${files.length} procedures.`);
console.log(`Governance states: ${JSON.stringify(stateCounts)}.`);
console.log(`Evidence-complete verified: ${evidenceCompleteVerified}/${report.targetEvidenceComplete}; remaining ${report.remainingToTarget}.`);
if (MODE === 'promote') console.log(`Promoted ${promoted} procedures through the verification-v2 gate.`);
