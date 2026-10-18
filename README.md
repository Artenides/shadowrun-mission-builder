# Shadowline — Shadowrun: Anarchy 2.0 Campaign Generator

A browser-based tool for GMs running **Shadowrun: Anarchy 2.0**. Answer a 15-question wizard
about your table and setting, and it generates a connected mission campaign grounded in a
procedurally generated city — complete with districts, stakeholders, hidden narrative threads,
deliberate flavor outliers, and optional Anarchy-style NPC stat blocks.

See [`DESIGN.md`](./DESIGN.md) for the full design document (architecture, generation pipeline,
content model, etc.). This README covers running and deploying the implementation.

## Why there's no "database"

This is a 100% static site (no backend, no database — it's hosted free on GitHub Pages) and the
generation logic ships to the browser as regular JavaScript, so it can technically be read by
anyone who opens dev tools. Rather than trying to hide that (impossible on a static site), the
design removes the thing worth stealing: there is no flat list of finished missions or cities
anywhere. Content is built from small reusable fragments (location beats, complication beats,
corp/gang name parts, NPC archetypes) combined at generation time via a seeded PRNG. Reading the
source gets you the Lego bricks, not a shelf of finished models.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL.

## Building

```bash
npm run build
```

Output goes to `dist/`. The Vite config uses a relative base path (`base: './'`) so the build
works unmodified whether it's served from the root of a GitHub Pages user site
(`username.github.io`) or from a project subpath (`username.github.io/repo-name/`).

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and deploys automatically on every push to
`main`, using GitHub's native Pages deployment (no `gh-pages` branch needed). To enable it on a
new repo:

1. Push this repo to GitHub.
2. In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The site will be live at `https://<username>.github.io/<repo-name>/`.

## Project layout

```
src/
  rng/            seeded PRNG (mulberry32) — same seed always produces the same campaign
  content/        fragment tables: names, districts, mission text, complications, NPC flavor
  engine/         generation pipeline: city → thread web → missions → NPCs → campaign text
  ui/             wizard + campaign view React components
  utils/          Markdown export, shareable seed-URL encoding
```

Generation is deterministic from `(inputs, seed)`. The "Share seed" button in the UI encodes the
full input set into the URL query string, so reopening a shared link reproduces the exact same
campaign — no server storage involved.
