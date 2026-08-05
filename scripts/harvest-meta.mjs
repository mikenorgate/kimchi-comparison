#!/usr/bin/env node
/**
 * Metadata harvester for the macOS Tahoe comparison site.
 *
 * Scans implementation directories at the repository root, reads agent session
 * metadata from default kimchi/claude locations, and writes a normalised
 * meta.json file into each implementation directory.
 *
 * The script is idempotent: running it again regenerates all meta.json files.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { homedir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '..');
const KIMCHI_DIR = process.env.KIMCHI_FERMENTS_DIR || resolve(homedir(), '.kimchi', 'ferments');
const CLAUDE_DIR = process.env.CLAUDE_PROJECTS_DIR || resolve(homedir(), '.claude', 'projects');
const KIMCHI_HARNESS_DIR =
  process.env.KIMCHI_HARNESS_DIR || resolve(homedir(), '.config', 'kimchi', 'harness', 'sessions');

const CANONICAL_PROMPT =
  'Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working';

const TITLE_MAP = {
  'ferment-full-kimi2-7': 'macOS Tahoe — Full Desktop',
  'ferment-kimi2-7': 'macOS Tahoe — Core Shell',
  'singleshot-kimi2-7': 'macOS Tahoe — Single Page',
  'ccgoal-fable': 'macOS Tahoe — Static Build',
  'codex-gpt5-5': 'macOS Tahoe — Codex GPT-5.5',
};

const STRATEGY_MAP = {
  'ferment-full-kimi2-7': 'Full desktop + bundled apps',
  'ferment-kimi2-7': 'Core desktop shell',
  'singleshot-kimi2-7': 'Single-page build',
  'ccgoal-fable': 'Static build',
  'codex-gpt5-5': 'Self-contained HTML/CSS/JS desktop',
};

const WORKFLOW_MAP = {
  'ferment-full-kimi2-7': 'ferment',
  'ferment-kimi2-7': 'ferment',
  'singleshot-kimi2-7': 'oneshot',
  'ccgoal-fable': '/goal',
  'codex-gpt5-5': 'codex',
};

const MODEL_MAP = {
  'ferment-full-kimi2-7': 'Kimi K2.7',
  'ferment-kimi2-7': 'Kimi K2.7',
  'singleshot-kimi2-7': 'Kimi K2.7',
  'ccgoal-fable': 'Fable 5',
  'codex-gpt5-5': 'GPT-5.5',
};

const DURATION_MS_MAP = {
  'ccgoal-fable': 19 * 60 * 1000,
  'singleshot-kimi2-7': 20 * 60 * 1000 + 57 * 1000,
  'codex-gpt5-5': 6 * 60 * 1000 + 22 * 1000,
};

const COST_MAP = {
  'ccgoal-fable': '$8.79',
  // Codex GPT-5.5 session cost calculated from cumulative token usage:
  // input 453119 (uncached 89983 + cached 363136), output 17150.
  // Long-context tier applied because input > 272K:
  // $10/M uncached input + $1/M cached input + $45/M output.
  'codex-gpt5-5': '$2.03',
};

const EXCLUDED_DIRS = new Set(['site', 'node_modules', '.git', '.github', 'scripts']);
const EXCLUDED_FERMENTS = new Set([
  // The current "Build Comparison Site" ferment is the site project itself,
  // not one of the macOS Tahoe implementations.
  '019fd2c9-0914-712f-9969-045b7e9df5e6',
]);

function durationBetween(start, end) {
  if (!start || !end) return null;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
  return Math.max(0, endMs - startMs);
}

async function loadKimchiFerments() {
  if (!existsSync(KIMCHI_DIR)) return [];
  const files = await readdir(KIMCHI_DIR);
  const ferments = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const id = file.replace(/\.json$/, '');
    if (EXCLUDED_FERMENTS.has(id)) continue;
    try {
      const content = await readFile(join(KIMCHI_DIR, file), 'utf8');
      const data = JSON.parse(content);
      ferments.push({
        id,
        ...data,
        durationMs: durationBetween(data.createdAt, data.updatedAt),
      });
    } catch {
      // Ignore unreadable or malformed ferment files.
    }
  }
  return ferments;
}

async function loadClaudeSessions() {
  if (!existsSync(CLAUDE_DIR)) return [];
  const projectDirs = await readdir(CLAUDE_DIR, { withFileTypes: true });
  const sessions = [];
  for (const projectDir of projectDirs) {
    if (!projectDir.isDirectory()) continue;
    const indexPath = join(CLAUDE_DIR, projectDir.name, 'sessions-index.json');
    if (!existsSync(indexPath)) continue;
    try {
      const index = JSON.parse(await readFile(indexPath, 'utf8'));
      for (const entry of index.entries || []) {
        if (entry.projectPath) {
          sessions.push({
            id: entry.sessionId,
            projectPath: entry.projectPath,
            firstPrompt: entry.firstPrompt || '',
            summary: entry.summary || '',
            durationMs: durationBetween(entry.created, entry.modified),
          });
        }
      }
    } catch {
      // Ignore unreadable or malformed index files.
    }
  }
  return sessions;
}

function parseAskUserAnswers(text) {
  const answers = {};
  if (!text) return answers;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;
    const rest = trimmed.slice(2);
    const colonIdx = rest.indexOf(':');
    if (colonIdx === -1) continue;
    const key = rest.slice(0, colonIdx).trim();
    const value = rest.slice(colonIdx + 1).trim();
    if (key) answers[key] = value;
  }
  return answers;
}

async function extractHarnessAskUserQa(fermentId) {
  if (!existsSync(KIMCHI_HARNESS_DIR)) return [];

  // Find candidate session files that mention this ferment id. Check the first
  // 50 lines of each file (the cwd/session header doesn't include the id). Skip
  // sessions whose cwd is the comparison-site root repo, since that session
  // references implementation ferment ids while talking about the site itself.
  // Pick the earliest matching implementation session chronologically.
  const candidates = [];
  for (const sessionDir of readdirSync(KIMCHI_HARNESS_DIR, { withFileTypes: true })) {
    if (!sessionDir.isDirectory()) continue;
    const dirPath = join(KIMCHI_HARNESS_DIR, sessionDir.name);
    for (const file of readdirSync(dirPath)) {
      if (!file.endsWith('.jsonl')) continue;
      const filePath = join(dirPath, file);
      try {
        const lines = (await readFile(filePath, 'utf8')).split('\n');
        const head = lines.slice(0, 50).join('\n');
        if (!head.includes(fermentId)) continue;
        const firstLine = lines[0] || '';
        const cwdMatch = firstLine.match(/"cwd":"([^"]+)"/);
        const cwd = cwdMatch ? cwdMatch[1] : '';
        if (cwd === ROOT) continue;
        candidates.push(filePath);
      } catch {
        // ignore unreadable files
      }
    }
  }
  if (candidates.length === 0) return [];
  candidates.sort();
  const sessionPath = candidates[0];

  const content = await readFile(sessionPath, 'utf8');
  const askCalls = new Map(); // toolCallId -> { questionId -> question }
  const toolResults = new Map(); // toolCallId -> answers map

  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event.type !== 'message') continue;
    const msg = event.message || {};

    // Assistant messages contain ask_user tool calls.
    if (msg.role === 'assistant' && Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block?.type === 'toolCall' && block.name === 'ask_user') {
          const args = block.arguments || {};
          const questions = args.questions || [];
          const map = new Map();
          for (const q of questions) {
            const id = q.id;
            const prompt = q.prompt || q.question;
            const options = Array.isArray(q.options)
              ? q.options.map((o) => ({ id: o.id, label: o.label, description: o.description }))
              : [];
            if (id && prompt) map.set(id, { prompt, options });
          }
          if (map.size > 0) askCalls.set(block.id, map);
        }
      }
    }

    // Tool results carry the user's answers keyed by question id.
    if (msg.role === 'toolResult' && msg.toolName === 'ask_user' && msg.toolCallId) {
      const text = msg.content
        ?.map((c) => (typeof c === 'string' ? c : c?.text || ''))
        .join('');
      toolResults.set(msg.toolCallId, parseAskUserAnswers(text));
    }
  }

  function formatAnswer(rawAnswer, options) {
    if (!rawAnswer) return '';
    const ids = rawAnswer.split(',').map((s) => s.trim()).filter(Boolean);
    const parts = ids.map((id) => {
      const option = options.find((o) => o.id === id);
      if (!option) return id;
      return option.description
        ? `${option.label} — ${option.description}`
        : option.label;
    });
    if (parts.length > 0) return parts.join('; ');
    return rawAnswer;
  }

  const pairs = [];
  for (const [toolCallId, questionsMap] of askCalls) {
    const answers = toolResults.get(toolCallId) || {};
    for (const [qid, q] of questionsMap) {
      const answer = answers[qid];
      if (answer) {
        pairs.push({ question: q.prompt.trim(), answer: formatAnswer(answer, q.options) });
      }
    }
  }
  return pairs;
}

async function extractQaPairs(ferment) {
  // Prefer the actual ask_user Q&A captured in the harness session.
  if (ferment?.id) {
    const askUserQa = await extractHarnessAskUserQa(ferment.id);
    if (askUserQa.length > 0) return askUserQa;
  }

  const pairs = [];
  if (!ferment.scoping) return pairs;

  const sections = [
    ['What is the goal?', ferment.scoping.goal?.answer],
    ['What are the success criteria?', ferment.scoping.criteria?.answer],
    ['What are the constraints?', ferment.scoping.constraints?.answer],
    ['What are the assumptions?', ferment.scoping.assumptions?.answer],
  ];

  for (const [label, answer] of sections) {
    if (answer && typeof answer === 'string' && answer.trim()) {
      pairs.push({ question: label, answer: answer.trim() });
    }
  }
  return pairs;
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function scoreFermentMatch(ferment, dirPath, dirName, readmeText, pkg) {
  let score = 0;
  const normalizedDir = normalizeText(dirName);
  const normalizedName = normalizeText(ferment.name || '');
  const normalizedDesc = normalizeText(ferment.description || '');
  const criteria = normalizeText((ferment.scoping?.criteria?.answer) || '');

  // Directory name appears in ferment name.
  if (normalizedName.includes(normalizedDir) || normalizedDir.includes(normalizedName)) {
    score += 10;
  }

  // Worktree path points directly at this directory.
  if (ferment.worktree?.path === dirPath) {
    score += 50;
  }

  // Presence of unique dependency keywords in criteria / description.
  const deps = Object.keys(pkg?.dependencies || {})
    .concat(Object.keys(pkg?.devDependencies || {}));
  for (const dep of deps) {
    const depToken = normalizeText(dep);
    if (criteria.includes(depToken) || normalizedDesc.includes(depToken)) {
      score += 2;
    }
  }

  // README content overlap with ferment description.
  const readmeNorm = normalizeText(readmeText);
  const descWords = normalizedDesc.split(' ').filter(Boolean);
  const matches = descWords.filter((w) => readmeNorm.includes(w)).length;
  score += matches * 0.5;

  return score;
}

async function findBestFermentMatch(ferments, dirPath, dirName, readmeText, pkg) {
  let best = null;
  let bestScore = 0;
  for (const ferment of ferments) {
    const score = scoreFermentMatch(ferment, dirPath, dirName, readmeText, pkg);
    if (score > bestScore) {
      bestScore = score;
      best = ferment;
    }
  }
  return bestScore >= 5 ? best : null;
}

async function readPackageJson(dir) {
  try {
    const content = await readFile(join(dir, 'package.json'), 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function readReadme(dir) {
  for (const name of ['README.md', 'Readme.md', 'readme.md']) {
    try {
      return await readFile(join(dir, name), 'utf8');
    } catch {
      // try next
    }
  }
  return '';
}

function inferBuildCommand(pkg) {
  if (pkg?.scripts?.build) return 'npm run build';
  if (pkg?.scripts?.start?.includes('http.server')) return pkg.scripts.start;
  // CCGoal-Fable has no package.json; fallback to python server.
  return 'python3 -m http.server 8080';
}

function inferEntryPoint(pkg, dir) {
  if (pkg?.scripts?.build) {
    return existsSync(join(dir, 'vite.config.ts')) || existsSync(join(dir, 'vite.config.js'))
      ? 'dist/index.html'
      : 'build/index.html';
  }
  return 'index.html';
}

function extractReadmeTitle(readmeText) {
  if (!readmeText) return '';
  const match = readmeText.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function inferAgent(dirName, workflow, readmeText, claudeSession) {
  const normalizedDir = dirName.toLowerCase();
  if (workflow === 'ferment' || workflow === 'oneshot') return 'kimchi';
  if (workflow === '/goal') return 'claude';
  if (workflow === 'codex') return 'codex';
  if (claudeSession) return 'claude';
  if (normalizedDir.includes('kimi')) return 'kimchi';
  if (normalizedDir.includes('codex')) return 'codex';
  if (normalizedDir.includes('claude') || readmeText.toLowerCase().includes('claude')) return 'claude';
  return 'unknown';
}

function inferApproach(pkg, dirName, readmeText) {
  // Prefer a human strategy label over the tech stack, since every card is the
  // same prompt and the tech details are available in the build/run section.
  const id = dirName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (STRATEGY_MAP[id]) return STRATEGY_MAP[id];

  const deps = Object.keys(pkg?.dependencies || {})
    .concat(Object.keys(pkg?.devDependencies || {}));
  if (deps.includes('react')) {
    return deps.includes('typescript') ? 'React + TypeScript + Vite' : 'React + Vite';
  }
  if (deps.includes('vue')) return 'Vue';
  if (deps.includes('svelte')) return 'Svelte';
  if (readmeText.toLowerCase().includes('claude')) return 'Claude Code (plain HTML/CSS/JS)';
  if (dirName.toLowerCase().includes('fable')) return 'Claude Code (plain HTML/CSS/JS)';
  return 'Plain HTML/CSS/JS';
}

function inferTitle(dirName, readmeText) {
  const id = dirName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (TITLE_MAP[id]) return TITLE_MAP[id];
  return extractReadmeTitle(readmeText) || dirName.replace(/-/g, ' ');
}

async function listImplementationDirs() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    dirs.push({ name: entry.name, path: resolve(ROOT, entry.name) });
  }
  return dirs;
}

function findLocalKimchiFerment(dirPath, ferments) {
  const localKimchi = join(dirPath, '.kimchi', 'ferments');
  if (!existsSync(localKimchi)) return null;
  const entries = readdirSync(localKimchi, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const entry of entries) {
    const matched = ferments.find((f) => f.id === entry.name);
    if (matched) return matched;
  }
  return null;
}

function findClaudeSessionForDir(dirPath, sessions) {
  // Only accept a Claude session when the recorded projectPath matches this
  // implementation directory exactly or ends with the directory name, avoiding
  // overly loose parent-directory matches (e.g. /Users/mike).
  const dirName = basename(dirPath);
  const exact = sessions.find((s) => s.projectPath === dirPath);
  if (exact) return exact;
  return sessions.find((s) => {
    const pp = s.projectPath || '';
    return pp.endsWith('/' + dirName) || pp.endsWith('\\' + dirName);
  });
}

async function assignFermentsToDirs(dirs, ferments) {
  // Two-pass assignment:
  // 1. Direct local .kimchi metadata wins and reserves that ferment.
  // 2. Remaining directories are matched against remaining ferments only
  //    when they have a package.json with dependencies, giving the strongest
  //    signal that an agent session exists for this implementation.
  const assignments = new Map();
  const assignedIds = new Set();

  // Pass 1: local metadata.
  for (const dir of dirs) {
    const local = findLocalKimchiFerment(dir.path, ferments);
    if (local) {
      assignments.set(dir.path, local);
      assignedIds.add(local.id);
    }
  }

  const remainingFerments = ferments.filter((f) => !assignedIds.has(f.id));

  // Pass 2: global correlation, only for dirs with a package.json (buildable projects).
  for (const dir of dirs) {
    if (assignments.has(dir.path)) continue;
    const pkg = await readPackageJson(dir.path);
    if (!pkg) continue;
    const readmeText = await readReadme(dir.path);
    const ferment = await findBestFermentMatch(
      remainingFerments,
      dir.path,
      dir.name,
      readmeText,
      pkg,
    );
    if (ferment) {
      assignments.set(dir.path, ferment);
      assignedIds.add(ferment.id);
    }
  }

  return { assignments, claudeMatches: new Map() };
}

async function assignClaudeSessionsToDirs(dirs, claudeSessions) {
  const matches = new Map();
  for (const dir of dirs) {
    const session = findClaudeSessionForDir(dir.path, claudeSessions);
    if (session) matches.set(dir.path, session);
  }
  return matches;
}

async function generateMetaForDirectory(dir, fermentAssignments, claudeMatches, ferments) {
  const dirName = basename(dir.path);
  const pkg = await readPackageJson(dir.path);
  const readmeText = await readReadme(dir.path);

  // Prefer pre-computed assignment; fall back to direct local lookup and then global.
  let ferment = fermentAssignments.get(dir.path);

  if (!ferment) {
    ferment = findLocalKimchiFerment(dir.path, ferments);
  }

  if (!ferment && pkg) {
    const assignedIds = new Set(Array.from(fermentAssignments.values()).map((f) => f.id));
    const remainingFerments = ferments.filter((f) => !assignedIds.has(f.id));
    ferment = await findBestFermentMatch(remainingFerments, dir.path, dirName, readmeText, pkg);
  }

  const claudeSession = claudeMatches.get(dir.path);

  let questionsAndAnswers;
  let title;
  let agent;
  let fermentId;

  // Every implementation in this comparison started from the same prompt.
  const originalPrompt = CANONICAL_PROMPT;
  const id = dirName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const workflow = WORKFLOW_MAP[id] || 'session';
  agent = inferAgent(dirName, workflow, readmeText, claudeSession);

  if (ferment) {
    questionsAndAnswers = await extractQaPairs(ferment);
    title = inferTitle(dirName, readmeText);
    fermentId = ferment.id;
  } else if (claudeSession) {
    questionsAndAnswers = claudeSession.summary
      ? [{ question: 'Summary', answer: claudeSession.summary }]
      : [{ question: 'Approach', answer: inferApproach(pkg, dirName, readmeText) }];
    title = inferTitle(dirName, readmeText);
    fermentId = claudeSession.id;
  } else {
    questionsAndAnswers = [{ question: 'Approach', answer: inferApproach(pkg, dirName, readmeText) }];
    title = inferTitle(dirName, readmeText);
    fermentId = null;
  }

  return {
    id,
    title,
    approach: inferApproach(pkg, dirName, readmeText),
    workflow,
    originalPrompt,
    questionsAndAnswers,
    sourcePath: dirName,
    buildCommand: inferBuildCommand(pkg),
    entryPoint: inferEntryPoint(pkg, dir.path),
    // Non-required but useful for the comparison UI.
    agent,
    model: MODEL_MAP[id] || null,
    durationMs: DURATION_MS_MAP[id] ?? ferment?.durationMs ?? claudeSession?.durationMs ?? null,
    cost: COST_MAP[id] || null,
    fermentId,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const dirs = await listImplementationDirs();
  const ferments = await loadKimchiFerments();
  const claudeSessions = await loadClaudeSessions();

  const { assignments: fermentAssignments } = await assignFermentsToDirs(dirs, ferments);
  const claudeMatches = await assignClaudeSessionsToDirs(dirs, claudeSessions);

  const examples = [];
  for (const dir of dirs) {
    const meta = await generateMetaForDirectory(dir, fermentAssignments, claudeMatches, ferments);
    examples.push(meta);
    const outPath = join(dir.path, 'meta.json');
    if (dryRun) {
      console.log(`Would write ${outPath}:`, JSON.stringify(meta, null, 2));
    } else {
      await writeFile(outPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');
      console.log(`Wrote ${outPath}`);
    }
  }

  // Aggregate metadata for the comparison site UI.
  const siteDataDir = resolve(ROOT, 'site', 'src', 'data');
  const examplesPath = join(siteDataDir, 'examples.json');
  if (dryRun) {
    console.log(`Would write ${examplesPath}:`, JSON.stringify(examples, null, 2));
  } else {
    await mkdir(siteDataDir, { recursive: true });
    await writeFile(examplesPath, JSON.stringify(examples, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${examplesPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
