# Kimchi vs Others — macOS Tahoe Comparison

A comparison site showcasing different AI coding agents building the same task: **recreating the macOS Tahoe desktop as a web app**.

Each implementation was built from the same single prompt:

> Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working

The site lets you browse each implementation side-by-side, see what agent and model was used, how long it took, what it cost, and what questions the agent asked before starting.

**Live site:** https://mikenorgate.github.io/kimchi-comparison/

## Implementations

| Agent | Model | Workflow | Time | Cost | Approach |
|-------|-------|----------|------|------|----------|
| Kimchi | Kimi K2.7 | Ferment (full) | 2h 29m | $9.16 | Full desktop + bundled apps (React/TS/Vite/Tailwind) |
| Kimchi | Kimi K2.7 | Ferment | 45m | $2.67 | Core desktop shell (React/Vite) |
| Kimchi | Kimi K2.7 | Oneshot | 20m 57s | $2.21 | Single-page build (plain HTML/CSS/JS) |
| Claude | Fable 5 | `/goal` | 19m | $8.79 | Static build (plain HTML/CSS/JS) |
| Codex | GPT-5.5 | Codex | 6m 22s | $1.15 | Self-contained HTML/CSS/JS desktop |
| Codex | GPT-5.6 Luna | Codex | 97m | $0.04 | Self-contained HTML/CSS/JS desktop |

### The shared prompt

Every implementation started from the exact same prompt — no additional context, no screenshots, no design files. Agents that asked clarifying questions (Kimchi) received answers that shaped the scope. Agents that didn't (Claude, Codex) made their own assumptions.

## How it works

### Repository structure

```
.
├── CCGoal-Fable/          # Implementation: Claude /goal
├── Ferment-Full-Kimi2.7/  # Implementation: Kimchi ferment (full)
├── Ferment-Kimi2.7/       # Implementation: Kimchi ferment
├── Singleshot-Kimi2.7/    # Implementation: Kimchi oneshot
├── codex-gpt5.5/          # Implementation: Codex GPT-5.5
├── codex-gpt5.6-luna/     # Implementation: Codex GPT-5.6 Luna
├── scripts/
│   └── build-examples.mjs # Builds all implementations into site/public/
├── site/
│   ├── public/             # Generated: built implementations + static assets
│   ├── src/                # React + TypeScript comparison site
│   ├── index.html
│   └── vite.config.ts
├── package.json
└── .github/workflows/
    └── deploy.yml          # CI: build + deploy to GitHub Pages
```

Each implementation directory contains the source files plus a `meta.json` file with metadata about how it was built.

### `meta.json` format

Every implementation directory must contain a `meta.json`:

```json
{
  "id": "my-implementation",
  "title": "macOS Tahoe — My Implementation",
  "approach": "Brief description of the approach",
  "workflow": "ferment | oneshot | /goal | codex | session",
  "originalPrompt": "Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working",
  "questionsAndAnswers": [
    {
      "question": "What the agent asked",
      "answer": "What the user answered"
    }
  ],
  "sourcePath": "my-implementation",
  "buildCommand": "npm run build",
  "entryPoint": "index.html",
  "agent": "kimchi | claude | codex | other",
  "model": "Model Name",
  "durationMs": 600000,
  "cost": "$1.23"
}
```

### Build process

1. **`build-examples`** (`node scripts/build-examples.mjs`) — scans root-level directories for `meta.json` files, then either:
   - **Vite apps** (have `package.json` with a `build` script): runs `npm install && npm run build`, copies `dist/` contents to `site/public/<id>/`
   - **Static apps** (no build step): copies source files directly to `site/public/<id>/`
2. **`build:site`** (`cd site && npm ci && npm run build`) — builds the React comparison site, embedding implementation metadata from `site/src/data/examples.json`

### Deployment

Pushing to `main` triggers a GitHub Actions workflow that:
1. Checks out the repo
2. Runs `build:examples` with `GITHUB_PAGES_BASE=/kimchi-comparison/`
3. Runs `build:site` with the same base
4. Deploys `site/dist/` to GitHub Pages

## Adding a new implementation

### Option A: Submit a PR

1. **Fork** this repository.

2. **Create a directory** at the repo root for your implementation. The directory name should be descriptive, e.g. `my-agent-model`:
   ```bash
   mkdir my-agent-model
   ```

3. **Add your implementation files** — either:
   - A **Vite app** (has `package.json` with a `build` script and a `vite.config.ts`/`vite.config.js`). The build output from `dist/` will be copied to `site/public/<id>/`.
   - A **static app** (plain HTML/CSS/JS, no build step). All files will be copied as-is to `site/public/<id>/`.

4. **Create a `meta.json`** in your directory:
   ```json
   {
     "id": "my-agent-model",
     "title": "macOS Tahoe — My Agent Model",
     "approach": "One-line description of your approach",
     "workflow": "session",
     "originalPrompt": "Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working",
     "questionsAndAnswers": [
       {
         "question": "Approach",
         "answer": "What you did"
       }
     ],
     "sourcePath": "my-agent-model",
     "buildCommand": "npm run build",
     "entryPoint": "index.html",
     "agent": "my-agent",
     "model": "My Model",
     "durationMs": 600000,
     "cost": "$1.23"
   }
   ```

   **`id` rules**: lowercase alphanumeric with hyphens only (`[a-z0-9-]+`). This is used as the URL path and directory name.

5. **Update `site/src/data/examples.json`** — add your implementation's metadata to the array. You can copy an existing entry and modify it.

6. **Test locally**:
   ```bash
   npm install
   GITHUB_PAGES_BASE=/ npm run build:examples
   GITHUB_PAGES_BASE=/ npm run build:site
   ```
   Then serve `site/dist/` with any static server and verify your implementation loads.

7. **Submit a PR** — commit your implementation directory, the updated `examples.json`, and open a pull request against `main`.

### Option B: Local development only

If you just want to test locally without deploying:

```bash
# Install dependencies
npm install
cd site && npm ci && cd ..

# Build everything (serves at / so no base path needed)
npm run build:examples && npm run build:site

# Serve the built site
npx serve site/dist
```

## Tech stack

- **Comparison site**: React + TypeScript + Vite
- **Styling**: Custom CSS with Kimchi.dev dark theme
- **Routing**: React Router (HashRouter for GitHub Pages compatibility)
- **Deployment**: GitHub Pages via GitHub Actions

## License

MIT
