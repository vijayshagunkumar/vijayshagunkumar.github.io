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
- Export Current Section, Export All Content, and Export Bundle.
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
9. Click Export Current Section to download the selected JSON file.
10. Click Export All Content to download all JSON files individually.
11. Click Export Bundle to download `portfolio-content.zip`.
12. Replace the matching files in `src/content/` with the exported JSON.

Important: browser saves are local only. They do not update repository files automatically.

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
- Export selected JSON
- Export all JSON
- No admin link in the public navbar
- Resume and profile image paths still resolve from root
