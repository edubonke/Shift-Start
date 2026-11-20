#!/usr/bin/env node
'use strict';
const fs=require('fs'), matter=require('gray-matter');
const errors=[];
const expected={
'respond-to-a-ransomware-alert':['critical','P0'],
'respond-to-a-suspected-compromised-account':['high','P1'],
'triage-a-site-internet-outage':['critical','P0'],
'triage-a-site-wide-lan-outage':['critical','P0'],
'troubleshoot-windows-no-boot-or-boot-loop':['medium','P2'],
'declare-and-coordinate-a-major-incident':['critical','P0'],
'recover-a-corrupted-office-document':['medium','P2'],
'repair-a-corrupted-outlook-data-cache':['low','P3'],
'respond-to-a-lost-or-stolen-computer':['high','P1'],
'respond-to-a-lost-or-stolen-mobile-device':['high','P1'],
'respond-to-suspected-data-leakage':['critical','P0'],
'triage-a-cloud-service-outage':['critical','P0'],
'triage-a-windows-server-that-is-unreachable':['high','P1'],
'triage-a-wireless-access-point-outage':['high','P1'],
'triage-an-office-or-site-wide-outage':['critical','P0'],
'troubleshoot-a-print-server-outage':['high','P1'],
'bsod-0x0000007b':['medium','P2']};
for(const [slug,[sev,p]] of Object.entries(expected)){
 const f=`_procedures/${slug}.md`; if(!fs.existsSync(f)){errors.push(`missing ${f}`);continue;}
 const d=matter(fs.readFileSync(f,'utf8')).data;
 if(String(d.severity).toLowerCase()!==sev)errors.push(`${slug}: severity should be ${sev}`);
 if(String(d.verification_priority).toUpperCase()!==p)errors.push(`${slug}: priority should be ${p}`);
}
const must={
'respond-to-a-ransomware-alert':['0. **Isolate and contain immediately.'],
'respond-to-suspected-data-leakage':['0. **Contain the active leakage path immediately.'],
'respond-to-a-suspected-compromised-account':['0. **Contain the identity immediately.','Get-InboxRule','ForwardingAddress','ForwardingSmtpAddress'],
'triage-a-windows-server-that-is-unreachable':['0. **Check out-of-band management first.','iDRAC/iLO'],
'triage-a-wireless-access-point-outage':['PoE power budget','reload in 10'],
'triage-a-site-internet-outage':['reload in 10','ISP/provider circuit status'],
'triage-a-site-wide-lan-outage':['reload in 10','core/distribution switch health'],
'triage-a-cloud-service-outage':['official provider health/status','Azure Service Health','AWS Health']};
for(const [slug,tokens] of Object.entries(must)){
 const t=fs.readFileSync(`_procedures/${slug}.md`,'utf8');
 for(const x of tokens)if(!t.includes(x))errors.push(`${slug}: missing ${x}`);
}
const s=matter(fs.readFileSync('_symptoms/windows-blue-screen.md','utf8')).data;
if(String(s.severity).toLowerCase()!=='medium')errors.push('windows-blue-screen must be medium');
const pc=fs.readdirSync('_procedures').filter(x=>x.endsWith('.md')).length;
const sc=fs.readdirSync('_symptoms').filter(x=>x.endsWith('.md')).length;
if(pc!==421||sc!==446)errors.push(`content counts changed ${pc}/${sc}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Sprint 1 taxonomy/governance validation passed.');
console.log('Audited baseline: P0=7, P1=6, P2=3, P3=1; windows-blue-screen=medium.');
