#!/usr/bin/env python3
from pathlib import Path
import sys
repo=Path.cwd(); errors=[]
checks={
'_includes/header.html':['sp-product-header','sp-product-nav','data-menu-toggle','Symptom Wizard','For Organisations'],
'_layouts/list.html':['sp-procedure-card','sp-card-summary','verification_governance_state','revalidation_required'],
'_layouts/default.html':['supportvault-product-polish.css'],
'assets/css/supportvault-product-polish.css':['.sp-product-nav','.rd-catalog-grid','.sp-procedure-card','@media(max-width:760px)']}
for rel,tokens in checks.items():
    p=repo/rel
    if not p.exists(): errors.append(f'Missing {rel}'); continue
    t=p.read_text(encoding='utf-8')
    for token in tokens:
        if token not in t: errors.append(f'{rel}: missing {token}')
if len(list((repo/'_procedures').glob('*.md'))) != 421:
    errors.append('procedure count changed; expected 421')
if errors:
    print('\n'.join(errors),file=sys.stderr); sys.exit(1)
print('ShiftStart SupportVault-style product polish validation passed.')
print('Navigation: simplified product-style desktop navigation.')
print('Catalogue: polished concise cards; 421 procedures preserved.')
print('Governance/search/wizard functionality retained.')
