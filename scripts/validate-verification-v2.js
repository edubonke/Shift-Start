#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const policy = yaml.load(fs.readFileSync('_data/verification-policy.yml','utf8'));
const errors = [];
const warnings = [];
const validStates = new Set(['verified','revalidation_required','live_validation_pending','under_review','draft','deprecated']);
const validPriorities = new Set(['P0','P1','P2','P3','P4']);
const today = new Date().toISOString().slice(0,10);
const files = fs.readdirSync('_procedures').filter(x=>x.endsWith('.md')).sort();

if (Number(policy.schema_version) !== 2) errors.push('_data/verification-policy.yml: schema_version must be 2');
if (policy.authoritative_public_status_field !== 'verification_governance_state') {
  errors.push('_data/verification-policy.yml: authoritative_public_status_field must be verification_governance_state');
}

const states = {};
let evidenceCompleteVerified = 0;
let rawVerified = 0;

for (const name of files) {
  const file = path.join('_procedures',name);
  const data = matter(fs.readFileSync(file,'utf8')).data;
  const state = String(data.verification_governance_state || '');
  const priority = String(data.verification_priority || '');

  if (Number(data.verification_schema_version) !== 2) errors.push(`${file}: verification_schema_version must be 2 (run npm run verification:v2:apply)`);
  if (!validStates.has(state)) errors.push(`${file}: invalid or missing verification_governance_state`);
  if (!validPriorities.has(priority)) errors.push(`${file}: invalid verification_priority`);
  if (!Array.isArray(data.verification_v2_missing)) errors.push(`${file}: verification_v2_missing must be an array`);
  if (!Number.isInteger(data.verification_v2_score_percent) || data.verification_v2_score_percent < 0 || data.verification_v2_score_percent > 100) {
    errors.push(`${file}: verification_v2_score_percent must be an integer from 0 to 100`);
  }

  if (priority === 'P4' && String(data.severity || '').toLowerCase() !== 'low') {
    errors.push(`${file}: P4 is only supported for low-risk informational/self-service content`);
  }

  if (data.content_status === 'verified') {
    rawVerified++;
    if (state === 'verified') {
      evidenceCompleteVerified++;
      if (data.verification_v2_complete !== true) errors.push(`${file}: governance Verified requires verification_v2_complete=true`);
      if (data.verification_v2_missing.length !== 0) errors.push(`${file}: governance Verified cannot have missing verification-v2 requirements`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.next_review_due || ''))) errors.push(`${file}: governance Verified requires next_review_due`);
      else if (data.next_review_due < today) errors.push(`${file}: Verified review SLA has expired; re-run verification:v2:apply`);
    } else if (state !== 'revalidation_required') {
      errors.push(`${file}: raw verified status without v2-complete evidence must be revalidation_required`);
    }
  } else if (state === 'verified') {
    errors.push(`${file}: governance Verified requires content_status=verified`);
  }

  if (state === 'deprecated' && data.content_status !== 'deprecated') errors.push(`${file}: deprecated governance state must match content_status`);
  if (state === 'draft' && data.content_status !== 'draft') errors.push(`${file}: draft governance state must match content_status`);

  states[state] = (states[state] || 0) + 1;
}

if (files.length !== 421) errors.push(`Expected 421 procedures; found ${files.length}`);

if (warnings.length) console.warn(warnings.join('\n'));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Verification-v2 governance validation passed: ${files.length} procedures.`);
console.log(`Authoritative governance states: ${JSON.stringify(states)}.`);
console.log(`Evidence-complete Verified=${evidenceCompleteVerified}; raw verified metadata=${rawVerified}.`);
