#!/usr/bin/env node
'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const errors = [];
const report = JSON.parse(fs.readFileSync('reports/verification-priority-queue.json','utf8'));
const policy = yaml.load(fs.readFileSync('_data/verification-batch-policy.yml','utf8'));

if (report.totalProcedures !== 421) errors.push(`Priority queue expected 421 procedures; found ${report.totalProcedures}`);
if (report.rankingRevision !== 'metadata-proxy-and-risk-floor-v2') errors.push('Corrected ranking revision is not active.');

for (const row of report.procedures || []) {
  if (row.search_demand_source === 'temporary_topic_proxy' && row.search_demand_source_field !== 'metadata_only') {
    errors.push(`${row.slug}: temporary proxy must be metadata_only`);
  }
  if (row.priority === 'P0' && !['verified','deprecated'].includes(row.governance_state) && row.priority_score < Number(policy.priority_floors.P0.minimum_score)) {
    errors.push(`${row.slug}: actionable P0 fell below the P0 verification score floor`);
  }
  if (row.priority === 'P1' && !['verified','deprecated'].includes(row.governance_state) && row.priority_score < Number(policy.priority_floors.P1.minimum_score)) {
    errors.push(`${row.slug}: actionable P1 fell below the P1 verification score floor`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Corrected verification priority queue validation passed: ${report.totalProcedures} procedures.`);
console.log(`Ranking revision: ${report.rankingRevision}.`);
