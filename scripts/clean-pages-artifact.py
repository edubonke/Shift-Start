#!/usr/bin/env python3
from pathlib import Path
import argparse
import shutil
import sys

parser = argparse.ArgumentParser(description="Remove ShiftStart development patch artifacts from the generated GitHub Pages site.")
parser.add_argument("--check", action="store_true", help="Fail if any known development artifact is present; do not remove anything.")
args = parser.parse_args()

site = Path("_site")
if not site.is_dir():
    print("_site does not exist; build the site before artifact cleanup.", file=sys.stderr)
    sys.exit(2)

file_patterns = [
    "shiftstart-batch-b*-remediation*.zip",
    "shiftstart-post-*-governance-fix*.zip",
    "shiftstart-supportvault-product-polish*.zip",
    "shiftstart-sprint1-p0-01-ransomware*.zip",
    "shiftstart-shift-workspace-enhancements*.zip",
    "ShiftStart_Mobile_Responsive_Update*.zip",
    "shiftstart-final-corrective-patch*.zip",
    "shiftstart-phase1a-*.zip",
]
dir_patterns = [
    "shiftstart-batch-b*-remediation",
    "shiftstart-post-*-governance-fix*",
    "shiftstart-supportvault-product-polish",
    "shiftstart-sprint1-p0-01-ransomware",
    "shiftstart-shift-workspace-enhancements*",
    "shiftstart-final-corrective-patch*",
    "shiftstart-phase1a-*",
]
exact_noise = [
    "tatus",
    'ktop and mobile responsive layout"',
]

def find_candidates():
    found = set()
    for pattern in file_patterns + dir_patterns:
        for path in site.glob(pattern):
            found.add(path)
    for name in exact_noise:
        path = site / name
        if path.exists():
            found.add(path)
    return sorted(found, key=lambda p: p.as_posix())

candidates = find_candidates()
if args.check:
    if candidates:
        print("Development artifacts remain in _site:", file=sys.stderr)
        for path in candidates:
            print(f" - {path}", file=sys.stderr)
        sys.exit(1)
    print("Pages artifact hygiene validation passed: no known ShiftStart patch/install artifacts are published.")
    sys.exit(0)

for path in candidates:
    if path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()

remaining = find_candidates()
if remaining:
    print("Artifact cleanup was incomplete:", file=sys.stderr)
    for path in remaining:
        print(f" - {path}", file=sys.stderr)
    sys.exit(1)

print(f"Pages artifact cleanup passed: removed {len(candidates)} development artifact(s) from _site.")
