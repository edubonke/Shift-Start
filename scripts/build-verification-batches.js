#!/usr/bin/env node
'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const policy = yaml.load(fs.readFileSync('_data/verification-batch-policy.yml','utf8'));
const queue = JSON.parse(fs.readFileSync('reports/verification-priority-queue.json','utf8'));
const rows = queue.procedures || [];

function matchesSelector(row, selector) {
  if (selector.priorities && !selector.priorities.includes(row.priority)) return false;
  if (selector.governance_states && !selector.governance_states.includes(row.governance_state)) return false;
  return !['verified','deprecated'].includes(row.governance_state);
}

const batches = {};
for (const [id, config] of Object.entries(policy.batches || {})) {
  const selected = rows
    .filter(row => matchesSelector(row, config.selector || {}))
    .sort((a,b) => a.rank - b.rank)
    .slice(0, Number(config.maximum_items || 999));

  batches[id] = {
    id,
    name: config.name,
    description: config.description,
    maximumItems: Number(config.maximum_items || 999),
    count: selected.length,
    procedures: selected.map((row,index) => ({
      batchOrder: index + 1,
      rank: row.rank,
      slug: row.slug,
      title: row.title,
      category: row.category,
      priority: row.priority,
      governanceState: row.governance_state,
      priorityScore: row.priority_score,
      evidenceScorePercent: row.verification_score_percent,
      promotionReady: row.promotion_ready,
      missingRequirements: String(row.missing_requirements || '').split('|').filter(Boolean)
    }))
  };
}

fs.mkdirSync('reports',{recursive:true});
fs.mkdirSync('_data',{recursive:true});
const report = {
  schemaVersion: 1,
  model: policy.model,
  generatedAt: new Date().toISOString(),
  rankingRevision: queue.rankingRevision || '',
  batches
};
fs.writeFileSync('reports/verification-batches.json', JSON.stringify(report,null,2));
fs.writeFileSync('_data/verification-batches-dashboard.json', JSON.stringify({
  schemaVersion: report.schemaVersion,
  model: report.model,
  generatedAt: report.generatedAt,
  counts: Object.fromEntries(Object.entries(batches).map(([id,b])=>[id,b.count])),
  batches: Object.fromEntries(Object.entries(batches).map(([id,b])=>[id,{name:b.name,count:b.count,procedures:b.procedures.slice(0,10)}]))
},null,2));

const flat = Object.values(batches).flatMap(batch => batch.procedures.map(p => ({
  batch: batch.id,
  batch_name: batch.name,
  batch_order: p.batchOrder,
  queue_rank: p.rank,
  slug: p.slug,
  title: p.title,
  category: p.category,
  priority: p.priority,
  governance_state: p.governanceState,
  priority_score: p.priorityScore,
  evidence_score_percent: p.evidenceScorePercent,
  promotion_ready: p.promotionReady,
  missing_requirements: p.missingRequirements.join('|')
})));
const headers = Object.keys(flat[0] || {});
const csv = v => /[",\n|]/.test(String(v ?? '')) ? `"${String(v ?? '').replace(/"/g,'""')}"` : String(v ?? '');
fs.writeFileSync('reports/verification-batches.csv',
  [headers.join(','),...flat.map(r=>headers.map(h=>csv(r[h])).join(','))].join('\n')+'\n');

console.log('Verification batches generated.');
for (const [id,b] of Object.entries(batches)) {
  console.log(`Batch ${id}: ${b.count} — ${b.name}`);
  for (const p of b.procedures.slice(0,5)) {
    console.log(`  ${p.batchOrder}. ${p.priority} ${p.slug} score=${p.priorityScore}`);
  }
  if (b.count > 5) console.log(`  ... ${b.count - 5} more`);
}
