# ShiftStart IT Support Knowledge Base

A production-oriented, technician-first static knowledge base built with Eleventy, Tailwind CSS, Markdown, YAML front matter and Lunr.js. It deploys to GitHub Pages and is deliberately structured so API endpoints, bots, authentication and a Git-backed CMS can be added later.

## What is included

- Permanent keyboard-friendly search (`/`, arrow keys, Enter) with title, tag, error-code and full-text indexing.
- Fuzzy and prefix matching using a pre-built Lunr index.
- Markdown content types for symptoms, causes, procedures and diagnostic commands.
- YAML-driven decision-tree wizard generated as `wizard-data.json` during the build.
- Procedure TL;DRs, expected-result blocks, automatic command copy buttons, escalation paths and configurable ITSM links.
- Client-side feedback and zero-result logging with optional endpoint hooks.
- Role-aware UI hooks that remain open by default.
- Netlify Function and Cloudflare Worker placeholders.
- GitHub Actions deployment and a structured KB Request issue form.
- Eleven example procedures plus linked symptoms, causes and reusable commands.

## Requirements

- Node.js 20 or later; Node.js 22 is recommended.
- npm 10 or later.

## Run locally

```bash
npm install
npm run dev
```

Eleventy starts a local development server and Tailwind watches for style changes.

To validate content and create a production build:

```bash
npm test
```

The static output is written to `_site/`.

## Deploy to GitHub Pages

1. Create a GitHub repository and copy this project into it.
2. Run `npm install` locally if you want to commit a lockfile for reproducible dependency resolution.
3. Push to the `main` branch.
4. In the repository, open **Settings > Pages** and select **GitHub Actions** as the source.
5. The included workflow builds with the repository name as the path prefix and deploys `_site`.

No domain, environment secret or manual build command is required for the default open site.

## Add a procedure

1. Copy `src/templates/procedure-template.md` to `src/content/procedures/your-procedure.md`.
2. Complete every required front-matter field.
3. Use the command shortcode for command-line snippets:

```njk
{% command "powershell" "PowerShell" "Get-NetAdapter" %}
```

This automatically renders a copy button.

4. Put the expert fix in `tldr`.
5. After each material action, add an expected-result block:

```html
<div class="expected"><strong>Expected result:</strong> The adapter is Up and has a valid address.</div>
```

6. Link content through slug arrays such as `related_symptoms`, `related_causes`, `related_procedures`, `diagnostic_commands` and `next_steps`.
7. Run `npm run check` before committing. The validator fails when required metadata is missing.

## Content model

### Procedure

Required metadata: `title`, `description`, `content_type: procedure`, `category`, `severity`, `tags`, `tldr`, `escalation`.

### Symptom

Required metadata: `title`, `description`, `content_type: symptom`, `category`, `severity`, `tags`, `related_procedures`.

### Cause

Required metadata: `title`, `description`, `content_type: cause`, `probability`, `related_symptoms`.

### Diagnostic command

Required metadata: `title`, `description`, `content_type: command`, `platform`.

## Update the symptom wizard

Edit `src/data/wizard-questions.yaml`. Each question node has `question`, `yes` and `no`. A terminal node has `title`, `summary` and `procedure`.

Run:

```bash
npm run generate
```

The build script validates the YAML syntax and emits `src/generated/wizard-data.json`, which is copied to `/data/wizard-data.json` in the built site.

## Search index and bot consumption

`scripts/generate-search-data.js` parses all Markdown and creates:

- `/data/search-index.json`: serialised Lunr index.
- `/data/search-documents.json`: portable article records with titles, descriptions, URLs, tags and searchable text.

A Slack or Teams bot can fetch `search-documents.json`, load `search-index.json` using Lunr in Node.js, run the same query strategy and return article URLs. For a bot endpoint, deploy a small authenticated function that:

1. Receives the chat query.
2. Loads or caches both JSON files.
3. Searches the Lunr index.
4. Returns the top three titles, summaries and URLs.

Do not expose internal content through a public bot endpoint unless the site itself is protected.

## Configure ITSM, feedback and diagnostics

Edit `src/_data/site.json`.

### Ticket URL

Set `ticketUrlTemplate` using these placeholders:

- `{title}` article title
- `{category}` article category
- `{url}` current article URL

Example:

```json
"ticketUrlTemplate": "https://itsm.example.com/new?title={title}&category={category}&article={url}"
```

### Feedback and zero-result search

Set `feedbackEndpoint` and `zeroResultEndpoint` to HTTPS endpoints that accept JSON POST requests. When blank, feedback stays in local storage and zero-result searches are logged to the browser console.

### Dynamic diagnostics

The config contains `diagnostics.enabled`, `diagnostics.endpoint` and `diagnostics.method`. The provided API folders are safe placeholders only. Before enabling remote diagnostics, add authentication, authorisation, strict command allow-lists, input validation, audit logging, timeouts and network restrictions. Never accept arbitrary shell commands from the browser.

## Optional serverless functions

### Netlify

Examples are under `api/netlify/functions/`. Copy them to the functions directory used by your Netlify configuration, add secure storage, then point the site endpoints to their deployed URLs.

### Cloudflare Workers

An ES module Worker placeholder is under `api/cloudflare/worker.js`. Deploy it with Wrangler after adding authentication and persistence.

GitHub Pages hosts static files only; serverless functions must run on another provider.

## Role-based access

The site is open by default. To activate UI gating:

1. Protect the site with Cloudflare Access, Netlify Identity or another identity-aware proxy.
2. Set `access.enabled` to `true`.
3. Populate `window.KB_USER = { role: "engineer" }` from trusted identity claims before `app.js` runs.
4. Add `data-role="engineer,admin"` to UI sections that should be hidden from other roles.
5. Use `required_role` in article front matter for page-level policy metadata.

Client-side hiding is not security. Enforce access at the CDN, proxy or origin.

## Add Decap CMS later

The repository already keeps all editable content in predictable Markdown folders. To add Decap CMS:

1. Add `src/admin/index.html` and `src/admin/config.yml`.
2. Configure Git Gateway or GitHub OAuth.
3. Define collections that point to `src/content/procedures`, `symptoms`, `causes` and `commands`.
4. Mirror each required front-matter field in the CMS schema.
5. Keep pull-request review and `npm run check` in CI so non-developer edits remain valid.

## Architecture

```text
src/
├── _data/                 # Global configuration
├── _includes/             # Layouts and reusable UI partials
├── assets/                # Tailwind input/output and vanilla JS
├── content/               # Markdown knowledge model
├── data/                  # Wizard source YAML
├── generated/             # Build-generated JSON (ignored by Git)
└── templates/             # Authoring templates
scripts/                   # Search, wizard and validation builds
api/                       # Optional serverless placeholders
.github/                   # Pages deployment and KB issue form
```

## Production hardening checklist

- Replace the example ITSM domain.
- Review every procedure against organisational policy and supported product versions.
- Protect internal content with an identity-aware edge service when required.
- Add Content Security Policy headers through the chosen hosting layer.
- Pin or self-host Lunr instead of using the CDN where offline availability is required.
- Add automated link checking, accessibility testing and scheduled content review issues.
- Configure analytics and feedback endpoints with privacy, retention and authentication controls.

## License

Use internally or adapt to your organisation's repository and content policy.
