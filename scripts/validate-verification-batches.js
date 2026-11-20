#!/usr/bin/env node
'use strict';

const fs = require('fs');
const report = JSON.parse(fs.readFileSync('reports/verification-batches.json','utf8'));
const queue = JSON.parse(fs.readFileSync('reports/verification-priority-queue.json','utf8'));
const errors = [];

if (report.rankingRevision !== 'metadata-proxy-and-risk-floor-v2') {
  errors.push('Batches were not generated from corrected ranking revision.');
}
for (const id of ['A','B','C']) {
  if (!report.batches?.[id]) errors.push(`Missing Batch ${id}`);
}
for (const p of report.batches?.A?.procedures || []) {
  if (p.priority !== 'P0') errors.push(`Batch A contains non-P0 ${p.slug}`);
}
for (const p of report.batches?.B?.procedures || []) {
  if (p.priority !== 'P1') errors.push(`Batch B contains non-P1 ${p.slug}`);
}
for (const p of report.batches?.C?.procedures || []) {
  if (p.governanceState !== 'revalidation_required') errors.push(`Batch C contains non-revalidation item ${p.slug}`);
}
if (queue.totalProcedures !== 421) errors.push(`Queue procedure count changed: ${queue.totalProcedures}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Verification batch validation passed: A=${report.batches.A.count}, B=${report.batches.B.count}, C=${report.batches.C.count}.`);
