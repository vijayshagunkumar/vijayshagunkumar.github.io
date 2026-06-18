# Vijay Kumar Portfolio

Professional portfolio website built with Vite, React, and TypeScript for GitHub Pages root deployment.

## Branch Model

- `source` contains the editable React/Vite project.
- `main` contains the compiled static website served by GitHub Pages.
- Public URL: `https://vijayshagunkumar.github.io/`

Do content edits on `source`, then deploy the compiled output to `main`.

## Local Setup

```bash
npm install
npm run dev
```

Open the portfolio locally:

```text
http://localhost:5173/
```

Open the local admin editor:

```text
http://localhost:5173/admin
```

## Admin Password

Create a local `.env` file if you want the static password gate:

```env
VITE_ADMIN_PASSWORD=choose-a-local-password
```

This is not real security because the site is static. It only hides accidental access.

## Portfolio Studio Workflow

The `/admin` Portfolio Studio edits structured JSON content from `src/content/`.

Editable sections:

- Dashboard
- Hero
- Metrics
- About
- Skills
- Experience
- Corporate Projects
- Products I've Built
- Certifications
- Education
- Awards
- Contact
- Resume & Profile

Studio features:

- Portfolio overview counts for projects, products, certifications, and experience.
- Last modified timestamp.
- Draft indicators for unsaved and saved local changes.
- Global admin search across projects, products, certifications, skills, and experience.
- Collapsible cards for list-heavy sections.
- Duplicate, delete, move up, move down, and drag-and-drop reordering for major lists.
- Desktop, tablet, and mobile preview modes.
- One-click Publish flow for committing changed JSON files to `source` and triggering production deployment.
- Resume/profile photo local upload preview.

How to edit:

1. Open `/admin` locally.
2. Select a section from the left sidebar.
3. Use search to jump directly to a project, product, certification, skill, or experience entry.
4. Edit text fields, links, arrays, tags, project demo URLs, GitHub URLs, or credential URLs.
5. Use Add, Duplicate, Delete, Move Up, Move Down, or drag handles where available.
6. Click Save to store changes in browser `localStorage`.
7. Click Preview to open the portfolio using the locally saved content.
8. Use Desktop, Tablet, or Mobile Preview inside the Studio preview modal.
9. Click Publish.
10. Enter a fine-grained GitHub token with repository access for `Contents: Read and write`, `Actions: Read and write`, and `Metadata: Read-only`.
11. Confirm Publish to commit JSON files to `source`. The production workflow starts automatically from the source push.

Important: browser saves are local until you publish. The GitHub token is kept in browser `sessionStorage`; do not paste it into chat or commit it to the repo.

## Publish Workflow

The Studio Publish button:

1. Saves the current Studio drafts to browser localStorage.
2. Reads each existing `src/content/*.json` file SHA from the `source` branch with the GitHub Contents API.
3. Updates only changed JSON files with `PUT /repos/{owner}/{repo}/contents/{path}`.
4. Lets `.github/workflows/publish-portfolio.yml` start automatically on pushes to `source`.
5. The workflow checks out `source`, runs `npm ci`, runs `npm run build`, and publishes the compiled site to both `main` and `gh-pages`.

This keeps the editable source and production branches aligned without manual JSON export.
Fine-grained GitHub tokens should have `Contents: Read and write`, `Actions: Read and write`, and `Metadata: Read-only`.

## Content Files

```text
src/content/
  hero.json
  metrics.json
  about.json
  skills.json
  experience.json
  projects.json
  personalProjects.json
  certifications.json
  education.json
  awards.json
  contact.json
```

Public components read from these JSON files through the data modules in `src/data/`.
When previewing from `/admin`, the portfolio uses matching `localStorage` content if available.

## Resume And Profile Photo

The Studio lets you edit the path text and upload local preview files.

To replace files, manually update:

```text
public/resume.pdf
public/profile-photo.jpg
```

Keep root paths unless intentionally changing deployment structure:

```text
/resume.pdf
/profile-photo.jpg
```

Uploaded preview files are stored in browser localStorage only. Before deployment, replace the actual files in `public/`.

## Build And Deploy

From the `source` branch:

```bash
npm run build
npm run deploy
```

`npm run deploy` builds the site and publishes `dist` to the `main` branch for root GitHub Pages.

## QA Checklist

Before deploying:

```bash
npm run build
```

Check:

- Public portfolio at `/`
- Admin editor at `/admin`
- Save to localStorage
- Preview from localStorage
- Publish button opens the production publish dialog
- No admin link in the public navbar
- Resume and profile image paths still resolve from root
