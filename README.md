# Kimchi vs Others — macOS Tahoe Comparison

A comparison site showcasing different AI coding agents building the same task: **recreating the macOS Tahoe desktop as a web app**.

Each implementation was built from the same single prompt:

> Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working

The site lets you browse each implementation side-by-side, see which agent and model was used, how long it took, what it cost, and what questions the agent asked before starting.

**Live site:** https://mikenorgate.github.io/kimchi-comparison/

## Adding a new implementation

1. **Fork** this repository.
2. **Create a directory** at the repo root for your implementation (e.g. `my-agent-model`).
3. **Add your implementation files** — either a Vite app (has `package.json` with a `build` script and `vite.config.ts/js`) or a static app (plain HTML/CSS/JS, no build step).
4. **Create a `meta.json`** in your directory:

   ```json
   {
     "id": "my-agent-model",
     "title": "macOS Tahoe — My Agent Model",
     "approach": "Brief description of the approach",
     "workflow": "ferment | oneshot | /goal | session",
     "originalPrompt": "Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working",
     "questionsAndAnswers": [
       { "question": "What the agent asked", "answer": "What the user answered" }
     ],
     "sourcePath": "my-agent-model",
     "buildCommand": "npm run build",
     "entryPoint": "index.html",
     "agent": "kimchi | claude | codex | other",
     "model": "Model Name",
     "durationMs": 600000,
     "cost": "$1.23"
   }
   ```

   **`id` rules**: lowercase alphanumeric with hyphens only (`[a-z0-9-]+`). Used as the URL path.

5. **Add your entry to `site/src/data/examples.json`** — copy an existing entry and modify it.
6. **Test locally**:
   ```bash
   npm install
   GITHUB_PAGES_BASE=/ npm run build:examples
   GITHUB_PAGES_BASE=/ npm run build:site
   npx serve site/dist
   ```
7. **Submit a PR** against `main`.

## How it works

- **`scripts/build-examples.mjs`** scans root-level directories for `meta.json` files. Vite apps are built with `npm install && npm run build` and their `dist/` contents are copied to `site/public/<id>/`. Static apps are copied as-is.
- **`site/`** is a Vite + React + TypeScript app that reads `examples.json` and renders the comparison UI.
- Pushing to `main` triggers a GitHub Actions workflow that builds everything and deploys to GitHub Pages.

## License

MIT
