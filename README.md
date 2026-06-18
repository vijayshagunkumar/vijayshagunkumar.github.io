# Vijay Kumar Portfolio

Professional portfolio website built with Vite, React, and TypeScript for GitHub Pages deployment.

## Local Setup

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
  components/        Reusable React sections and cards
  data/              Profile, projects, experience, skills, certifications, education, awards
  styles/            Global styles, themes, component CSS
public/
  profile-photo.jpg  Profile image used by the hero
  resume.pdf         Replace with the latest resume PDF
```

## Add A New Project

For corporate/work projects, edit `src/data/projects.ts` and add one object to the `projects` array:

```ts
{
  id: "new-project",
  title: "New Project",
  organization: "Company or Personal Initiative",
  description: "Recruiter-friendly summary of the work.",
  metric: "Measurable impact",
  tags: ["AI", "Platform", "Product"],
  categories: ["AI", "Enterprise"],
  featured: true,
  liveUrl: "https://example.com",
  githubUrl: "https://github.com/username/repo"
}
```

Add a `caseStudy` property when you want an expandable problem, approach, and results view.

## Add A Personal Initiative Project

Edit `src/data/personalProjects.ts` and add one object to the `personalProjects` array:

```ts
{
  id: "new-product",
  name: "New Product",
  valueProposition: "One-line value proposition.",
  problemSolved: "Problem this product solves.",
  targetUsers: "Primary users.",
  highlights: ["Benefit one", "Benefit two", "Benefit three"],
  techHighlights: ["AI workflow", "UX design", "Data handling"],
  status: "Live beta",
  liveUrl: "https://example.com",
  githubUrl: "https://github.com/username/repo"
}
```

## Change Theme

Themes are defined in `src/styles/themes.css` and listed in `src/data/profile.ts`.
The selected theme is saved in `localStorage` under `portfolio-theme`.

Available themes:

- Professional Navy/Teal
- Light Executive
- Dark Elegant
- Minimal Recruiter View

## Update Resume

Replace `public/resume.pdf` with the latest resume file. Keep the same filename so links continue to work.

## Deploy To GitHub Pages

### Option 1: npm deploy

Update these values first:

- `package.json` `homepage`
- `vite.config.ts` `base`

Then run:

```bash
npm run deploy
```

### Option 2: GitHub Actions

This repo includes `.github/workflows/deploy.yml`.

In GitHub:

1. Go to repository `Settings`.
2. Open `Pages`.
3. Set source to `GitHub Actions`.
4. Push to `main`.

## Notes From Migration

The original single-file portfolio has been converted into a maintainable React architecture. The supplied source HTML did not include the external resume PDF, so `public/resume.pdf` is a placeholder until replaced with the real resume.
