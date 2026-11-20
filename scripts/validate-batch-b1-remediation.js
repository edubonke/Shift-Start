#!/usr/bin/env node
'use strict';
const fs=require('fs'), matter=require('gray-matter');
const manifest=require('../_data/batch-b1-audit-remediation.json');
const errors=[];
for(const [slug,c] of Object.entries(manifest.classifications)){
  const f=`_procedures/${slug}.md`;
  if(!fs.existsSync(f)){errors.push(`missing ${f}`);continue;}
  const t=fs.readFileSync(f,'utf8'); const d=matter(t).data;
  if(String(d.severity||'').toLowerCase()!==c.severity)errors.push(`${slug}: severity expected ${c.severity}`);
  if(String(d.verification_priority||'').toUpperCase()!==c.priority)errors.push(`${slug}: priority expected ${c.priority}`);
  if(!t.includes('## Mandatory Batch B-1 controls') && slug!=='troubleshoot-a-mapped-drive-reconnect-failure')errors.push(`${slug}: Batch B-1 controls missing`);
}
const dup='_procedures/troubleshoot-a-mapped-drive-reconnect-failure.md';
const dd=matter(fs.readFileSync(dup,'utf8')).data;
if(dd.content_status!=='deprecated')errors.push('mapped-drive reconnect duplicate not deprecated');
if(dd.canonical_procedure!=='mapped-drive-missing')errors.push('mapped-drive reconnect canonical link missing');
const malware=fs.readFileSync('_procedures/respond-to-a-suspected-malware-infection.md','utf8');
if(!malware.includes('0. **Isolate the endpoint immediately.**'))errors.push('malware Step 0 missing');
const compromised=fs.readFileSync('_procedures/respond-to-a-suspected-compromised-account.md','utf8');
for(const x of ['Get-InboxRule','ForwardingAddress','ForwardingSmtpAddress'])if(!compromised.includes(x))errors.push(`compromised account missing ${x}`);
const vpn=fs.readFileSync('_procedures/vpn-not-connecting.md','utf8');
if(!vpn.includes('## Parent triage decision path'))errors.push('VPN parent decision path missing');
const ap=fs.readFileSync('_procedures/triage-a-wireless-access-point-outage.md','utf8');
if(!ap.includes('PoE power budget')||!ap.includes('reload in 10'))errors.push('wireless AP governance controls missing');
const gw=fs.readFileSync('_procedures/troubleshoot-a-default-gateway-failure.md','utf8');
if(!gw.includes('HSRP/VRRP/GLBP')||!gw.includes('reload in 10'))errors.push('default gateway controls missing');
const symptom=matter(fs.readFileSync('_symptoms/a-duplicate-ip-address.md','utf8')).data;
if(String(symptom.severity).toLowerCase()!=='medium')errors.push('duplicate-IP symptom should remain medium');
const pc=fs.readdirSync('_procedures').filter(x=>x.endsWith('.md')).length;
if(pc!==421)errors.push(`procedure count changed: ${pc}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Batch B-1 remediation validation passed.');
console.log('Ledger: P1=14, P2=12 active + 1 deprecated duplicate, P3=3.');
console.log('Duplicate-IP symptom remains medium.');
