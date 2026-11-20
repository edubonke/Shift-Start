#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const required = {
  '_layouts/enterprise-explorer.html': ['ss-workbench','data-category-tree','data-detail-rail'],
  '_layouts/article.html': ['ss-executive-summary','ss-lifecycle','ss-sticky-action-bar','assurance-banner'],
  'assets/js/enterprise-shell.js': ['initCommandPalette','levenshtein','toggleTheme','loadDetail'],
  'assets/css/enterprise-shell.css': ['--ss-bg','ss-command-dialog','data-theme="dark"'],
  'enterprise-catalog.json': ['permalink: /assets/data/enterprise-catalog.json','evidenceComplete'],
  '_includes/enterprise-trust-footer.html': ['SOC 2','Not attested','GDPR readiness'],
};
let failed = false;
for (const [rel,tokens] of Object.entries(required)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { console.error(`Missing ${rel}`); failed = true; continue; }
  const text = fs.readFileSync(file,'utf8');
  for (const token of tokens) if (!text.includes(token)) { console.error(`${rel} missing ${token}`); failed = true; }
}
const counts = {};
for (const dir of ['_procedures','_symptoms','_causes','_commands']) {
  const abs = path.join(root,dir);
  counts[dir] = fs.existsSync(abs) ? fs.readdirSync(abs).filter(x=>x.endsWith('.md')).length : 0;
}
const trust = fs.readFileSync(path.join(root,'_includes/enterprise-trust-footer.html'),'utf8');
if (/SOC\s*2\s*Compliant/i.test(trust) || /GDPR\s*Compliant/i.test(trust)) {
  console.error('Compliance footer contains an unsupported compliance claim.'); failed = true;
}
if (failed) process.exit(1);
console.log('Enterprise architecture validation passed.');
console.log('Knowledge collection counts:', counts);
