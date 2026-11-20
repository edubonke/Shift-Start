# Upgrade the existing GitHub Pages repository

This repository contains more than 800 Markdown and source files. Use Git or Codespaces rather than the browser multi-file uploader.

## Codespaces replacement method

1. Upload the ZIP archive itself to the repository root.
2. Open **Code → Codespaces → Create codespace on main**.
3. Run the commands supplied with the release. They extract the new repository into `/tmp`, preserve `.git`, replace the working tree, and push the upgrade.
4. Keep **Settings → Pages → Source: GitHub Actions**.
5. Confirm the workflow reports at least 421 procedures and 446 symptoms in the verification step.

## Completeness controls

- The procedures page loops through the entire Jekyll collection without a `limit`.
- The search generator reads every Markdown article.
- The wizard generator reads every symptom and every procedure.
- The validator fails on broken symptom/procedure links.
- The deployment workflow fails if fewer than 200 procedures are present, guarding against accidental partial uploads.
