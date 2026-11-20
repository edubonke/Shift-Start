#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const args = process.argv.slice(2);
const getArg = name => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at+1] : '';
};
const batchId = String(getArg('--batch') || 'A').toUpperCase();
const force = args.includes('--force');

const batches = JSON.parse(fs.readFileSync('reports/verification-batches.json','utf8'));
const batch = batches.batches?.[batchId];
if (!batch) throw new Error(`Unknown batch ${batchId}. Run npm run verification:batches first.`);

const outDir = path.join('verification','evidence','pending');
fs.mkdirSync(outDir,{recursive:true});
let created=0, skipped=0;

for (const item of batch.procedures) {
  const out = path.join(outDir, `${item.slug}.yml`);
  if (fs.existsSync(out) && !force) { skipped++; continue; }

  const work = {
    schema_version: 1,
    procedure: {
      slug: item.slug,
      title: item.title,
      priority: item.priority,
      category: item.category,
      queue_rank: item.rank,
      batch: batchId
    },
    status: 'pending',
    tester: {
      name: '',
      role: '',
      organisation: ''
    },
    test_started_at: '',
    test_completed_at: '',
    environment_notes: '',
    verification_evidence: {
      diagnostic_tested: false,
      remediation_tested: false,
      rollback_confirmed: false,
      irreversible_change: false,
      irreversibility_approved_by: '',
      stop_conditions_confirmed: false,
      escalation_confirmed: false,
      time_validated: false,
      expected_result_confirmed: false,
      negative_path_tested: false,
      owner_signoff: '',
      peer_reviewers: [],
      test_environments: []
    },
    source_provenance: [],
    tested_platforms: [],
    actual_duration_minutes: null,
    observations: '',
    defects_found: [],
    blockers: '',
    evidence_attachments: [],
    declaration: {
      actual_test_performed: false,
      evidence_is_not_fabricated: false
    }
  };

  fs.writeFileSync(out, yaml.dump(work,{lineWidth:120,noRefs:true,sortKeys:false}));
  created++;
}

console.log(`Evidence work-items for Batch ${batchId}: created=${created}, skipped_existing=${skipped}.`);
console.log(`Location: ${outDir}`);
