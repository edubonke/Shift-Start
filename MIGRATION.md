# Replace the Eleventy repository with this Jekyll version

This package is a complete replacement, not an add-on. Remove the old Eleventy source before committing the Jekyll files.

## Recommended: GitHub Codespaces

1. Open the repository and choose **Code → Codespaces → Create codespace on main**.
2. Upload and extract this package in the Codespace.
3. From the repository root, remove the legacy Eleventy files and copy in the Jekyll package.
4. Confirm that `_config.yml`, `Gemfile`, `_layouts`, `_procedures`, and `.github/workflows/deploy.yml` are at the repository root.
5. Commit and push:

```bash
git add -A
git commit -m "Convert knowledge base from Eleventy to Jekyll"
git push
```

## GitHub Pages setting

Open **Settings → Pages** and set **Source** to **GitHub Actions**.

The workflow named **Build and deploy Jekyll KB to GitHub Pages** will install dependencies, validate the content, generate the search and wizard JSON, compile Tailwind CSS, build Jekyll, and deploy `_site`.

## Files that must no longer be used

Delete these legacy Eleventy items if they remain:

```text
.eleventy.js
src/
public/
```

The Jekyll workflow ignores them as an additional safeguard, but removing them keeps the repository clean.
