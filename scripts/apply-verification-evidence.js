#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const args = process.argv.slice(2);
const getArg = name => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at+1] : '';
};
const slug = getArg('--slug');
const apply = args.includes('--apply');
if (!slug) throw new Error('Usage: npm run verification:evidence:apply -- --slug <procedure-slug> [--apply]');

const candidates = [
  path.join('verification','evidence','completed',`${slug}.yml`),
  path.join('verification','evidence','pending',`${slug}.yml`)
];
const workFile = candidates.find(fs.existsSync);
if (!workFile) throw new Error(`Evidence work-item not found for ${slug}`);

const work = yaml.load(fs.readFileSync(workFile,'utf8')) || {};
if (work.status !== 'completed') {
  throw new Error(`Evidence work-item ${workFile} is not completed. Refusing import.`);
}
if (work.declaration?.actual_test_performed !== true || work.declaration?.evidence_is_not_fabricated !== true) {
  throw new Error('Evidence declaration is incomplete. Refusing import.');
}

const procFile = path.join('_procedures',`${slug}.md`);
if (!fs.existsSync(procFile)) throw new Error(`Procedure not found: ${procFile}`);
const parsed = matter(fs.readFileSync(procFile,'utf8'));
const d = parsed.data;

const completedAt = new Date(work.test_completed_at);
if (Number.isNaN(completedAt.getTime())) throw new Error('Invalid test_completed_at');
const lastTested = completedAt.toISOString().slice(0,10);

const evidence = JSON.parse(JSON.stringify(work.verification_evidence || {}));
d.verification_evidence = evidence;
d.source_provenance = JSON.parse(JSON.stringify(work.source_provenance || []));
d.tested_platforms = JSON.parse(JSON.stringify(work.tested_platforms || []));
d.last_tested = lastTested;
d.verification_test_record = {
  batch: work.procedure?.batch || '',
  tester: work.tester || {},
  test_started_at: work.test_started_at,
  test_completed_at: work.test_completed_at,
  actual_duration_minutes: work.actual_duration_minutes,
  observations: work.observations || '',
  defects_found: work.defects_found || [],
  blockers: work.blockers || '',
  evidence_attachments: work.evidence_attachments || []
};

const front = yaml.dump(d,{lineWidth:120,noRefs:true,sortKeys:false}).trim();
const output = `---\n${front}\n---\n${parsed.content.replace(/^\n+/,'')}`;

console.log(`Evidence import preview for ${slug}:`);
console.log(`  source: ${workFile}`);
console.log(`  target: ${procFile}`);
console.log(`  last_tested: ${lastTested}`);
console.log(`  peer reviewers: ${(evidence.peer_reviewers || []).length}`);
console.log(`  test environments: ${(evidence.test_environments || []).length}`);
console.log(`  authoritative sources: ${(work.source_provenance || []).filter(x=>x.authoritative===true).length}`);

if (!apply) {
  console.log('Dry run only. Re-run with --apply after reviewing the evidence.');
  process.exit(0);
}

fs.writeFileSync(procFile,output);
const completedDir = path.join('verification','evidence','completed');
fs.mkdirSync(completedDir,{recursive:true});
const completedFile = path.join(completedDir,path.basename(workFile));
if (workFile !== completedFile) {
  fs.renameSync(workFile,completedFile);
}
console.log('Evidence imported into procedure front matter. Promotion has NOT been performed.');
console.log('Next: npm run verification:v2:apply && npm run readiness:promote && npm run check');
