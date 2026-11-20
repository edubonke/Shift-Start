#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const dirs = [
  path.join('verification','evidence','pending'),
  path.join('verification','evidence','completed')
];
const policy = yaml.load(fs.readFileSync('_data/verification-policy.yml','utf8'));
const batchPolicy = yaml.load(fs.readFileSync('_data/verification-batch-policy.yml','utf8'));
const allowedStatuses = new Set(batchPolicy.evidence_work_item?.statuses || []);
const errors = [];
const warnings = [];
let total=0, completed=0;

const validDateTime = v => {
  if (!v) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
};
const nonEmpty = v => typeof v === 'string' && v.trim().length > 1;
const arr = v => Array.isArray(v) ? v : [];

function reviewerFlag(v, flag) {
  return typeof v === 'object' && v !== null && v[flag] === true;
}
function reviewerName(v) {
  return typeof v === 'string' ? v.trim() : String(v?.name || '').trim();
}

function completeRequirements(work) {
  const p = String(work.procedure?.priority || '');
  const req = policy.priority_levels?.[p];
  if (!req) return [`unknown_priority_${p}`];
  const ev = work.verification_evidence || {};
  const missing = [];

  const irreversibleOk = ev.irreversible_change === true &&
    nonEmpty(ev.irreversibility_approved_by) &&
    ev.stop_conditions_confirmed === true;
  const rollbackOk = ev.rollback_confirmed === true || irreversibleOk;

  const requiredTests = Number(req.minimum_test_records || 0);
  const tests = arr(ev.test_environments).filter(x =>
    nonEmpty(x?.environment) && nonEmpty(x?.platform) &&
    String(x?.result || '').toLowerCase() === 'passed' &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(x?.tested_at || ''))
  );
  const distinct = new Set(tests.map(x=>String(x.environment).trim().toLowerCase())).size;
  const reviewers = arr(ev.peer_reviewers).filter(x=>reviewerName(x).length>1);
  const smes = reviewers.filter(x=>reviewerFlag(x,'sme'));
  const technical = reviewers.filter(x=>reviewerFlag(x,'technical') || reviewerFlag(x,'sme'));
  const sources = arr(work.source_provenance).filter(s =>
    s?.authoritative === true && nonEmpty(s.publisher) && nonEmpty(s.title) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(s.retrieved_at || '')) &&
    (nonEmpty(s.url) || nonEmpty(s.document_ref))
  );

  const required = [
    ['tester', nonEmpty(work.tester?.name) && nonEmpty(work.tester?.role)],
    ['test_started_at', validDateTime(work.test_started_at)],
    ['test_completed_at', validDateTime(work.test_completed_at)],
    ['diagnostic_tested', ev.diagnostic_tested === true],
    ['remediation_tested', ev.remediation_tested === true],
    ['rollback_or_irreversibility_confirmed', rollbackOk],
    ['escalation_confirmed', ev.escalation_confirmed === true],
    ['time_validated', ev.time_validated === true],
    ['expected_result_confirmed', ev.expected_result_confirmed === true],
    ['owner_signoff', nonEmpty(ev.owner_signoff)],
    ['authoritative_source_provenance', sources.length >= 1],
    ['tested_platforms', arr(work.tested_platforms).filter(nonEmpty).length >= 1],
    ['minimum_test_records', tests.length >= requiredTests],
    ['minimum_distinct_environments', distinct >= Number(req.minimum_distinct_environments || 0)],
    ['minimum_peer_reviewers', reviewers.length >= Number(req.minimum_peer_reviewers || 0)],
    ['actual_test_declaration', work.declaration?.actual_test_performed === true],
    ['anti_fabrication_declaration', work.declaration?.evidence_is_not_fabricated === true],
  ];

  if (Number(req.minimum_sme_reviewers || 0) > 0) {
    required.push(['minimum_sme_reviewers', smes.length >= Number(req.minimum_sme_reviewers)]);
  }
  if (Number(req.minimum_technical_reviewers || 0) > 0) {
    required.push(['minimum_technical_reviewers', technical.length >= Number(req.minimum_technical_reviewers)]);
  }
  if (req.negative_path_required === true) {
    required.push(['negative_path_tested', ev.negative_path_tested === true]);
  }

  for (const [id,ok] of required) if (!ok) missing.push(id);
  return missing;
}

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir).filter(x=>x.endsWith('.yml')||x.endsWith('.yaml'))) {
    const file = path.join(dir,name);
    const work = yaml.load(fs.readFileSync(file,'utf8')) || {};
    total++;
    if (Number(work.schema_version) !== 1) errors.push(`${file}: schema_version must be 1`);
    if (!allowedStatuses.has(String(work.status || ''))) errors.push(`${file}: invalid work-item status`);

    const missing = completeRequirements(work);
    if (work.status === 'completed') {
      completed++;
      if (missing.length) errors.push(`${file}: completed work-item missing ${missing.join(', ')}`);
    } else if (!missing.length) {
      warnings.push(`${file}: all completion requirements are present but status is ${work.status}`);
    }
  }
}

if (warnings.length) console.warn(warnings.join('\n'));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Evidence work-item validation passed: ${total} work-item(s), ${completed} completed.`);
