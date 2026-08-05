import { mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const execFileAsync = promisify(execFile);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VALID_EXAMPLE_DIR = join(ROOT, 'Test-Example');
const VALID_EXAMPLE_ID = 'test-example';
const INVALID_EXAMPLE_DIR = join(ROOT, 'Invalid-Id');
const CLAUDE_EXAMPLE_DIR = join(ROOT, 'Test-Claude-Example');
const CLAUDE_EXAMPLE_ID = 'test-claude-example';
const MOCK_CLAUDE_DIR = resolve(ROOT, 'tmp-claude-projects');

async function run(command, args, options) {
  console.log(`$ ${command} ${args.join(' ')}`);
  return execFileAsync(command, args, { cwd: ROOT, stdio: 'inherit', env: process.env, ...options });
}

async function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function setupValid() {
  await mkdir(VALID_EXAMPLE_DIR, { recursive: true });
  await writeFile(
    join(VALID_EXAMPLE_DIR, 'README.md'),
    '# Test Example\n\nA synthetic implementation used to verify auto-discovery.\n'
  );
  await writeFile(
    join(VALID_EXAMPLE_DIR, 'index.html'),
    '<!doctype html><html><head><title>Test Example</title></head><body><h1>Test Example</h1></body></html>'
  );
}

async function teardownValid() {
  await rm(VALID_EXAMPLE_DIR, { recursive: true, force: true });
  await rm(join(ROOT, 'site', 'public', VALID_EXAMPLE_ID), { recursive: true, force: true });
  await rm(join(ROOT, 'site', 'dist', VALID_EXAMPLE_ID), { recursive: true, force: true });
}

async function setupInvalid() {
  await mkdir(INVALID_EXAMPLE_DIR, { recursive: true });
  await writeFile(
    join(INVALID_EXAMPLE_DIR, 'meta.json'),
    JSON.stringify({
      id: '../bad',
      title: 'Invalid',
      approach: 'Static',
      originalPrompt: 'Test',
      questionsAndAnswers: [],
      sourcePath: 'Invalid-Id',
      buildCommand: 'echo noop',
      entryPoint: 'index.html',
      agent: 'unknown',
      workflow: 'session',
      model: null,
      durationMs: null,
      cost: null,
    })
  );
  await writeFile(join(INVALID_EXAMPLE_DIR, 'index.html'), '<html></html>');
}

async function teardownInvalid() {
  await rm(INVALID_EXAMPLE_DIR, { recursive: true, force: true });
}

async function setupClaude() {
  const projectDirName = '-test-claude-project';
  const projectDir = join(MOCK_CLAUDE_DIR, projectDirName);
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    join(projectDir, 'sessions-index.json'),
    JSON.stringify({
      version: 1,
      entries: [
        {
          sessionId: 'claude-session-123',
          projectPath: CLAUDE_EXAMPLE_DIR,
          firstPrompt: 'Build a test example from a Claude session.',
          summary: 'Claude Test Example',
          created: '2026-08-05T10:00:00.000Z',
          modified: '2026-08-05T10:05:00.000Z',
        },
      ],
    })
  );

  await mkdir(CLAUDE_EXAMPLE_DIR, { recursive: true });
  await writeFile(
    join(CLAUDE_EXAMPLE_DIR, 'README.md'),
    '# Test Claude Example\n\nSynthetic example used to verify Claude metadata scanning.\n'
  );
  await writeFile(join(CLAUDE_EXAMPLE_DIR, 'index.html'), '<html><body>Claude</body></html>');
}

async function teardownClaude() {
  await rm(CLAUDE_EXAMPLE_DIR, { recursive: true, force: true });
  await rm(MOCK_CLAUDE_DIR, { recursive: true, force: true });
  await rm(join(ROOT, 'site', 'public', CLAUDE_EXAMPLE_ID), { recursive: true, force: true });
}

async function testClaudeScanning() {
  await setupClaude();
  try {
    await run('node', ['scripts/harvest-meta.mjs'], {
      env: { ...process.env, CLAUDE_PROJECTS_DIR: MOCK_CLAUDE_DIR },
    });

    const examples = JSON.parse(await readFile(join(ROOT, 'site', 'src', 'data', 'examples.json'), 'utf8'));
    const found = examples.find((e) => e.id === CLAUDE_EXAMPLE_ID);
    await assert(found, `Expected ${CLAUDE_EXAMPLE_ID} in site/src/data/examples.json`);
    await assert(found.agent === 'claude', `Expected agent to be 'claude', got ${found.agent}`);
    await assert(found.durationMs === 300000, `Expected Claude session duration of 5 minutes, got ${found.durationMs}`);
    const canonicalPrompt = 'Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working';
    await assert(
      found.originalPrompt === canonicalPrompt,
      `Expected canonical prompt, got ${found.originalPrompt}`
    );

    console.log('\n✓ Claude scanning test passed');
  } finally {
    console.log('\nCleaning up Claude synthetic example...');
    await teardownClaude();
  }
}

async function testValidDiscovery() {
  await setupValid();
  try {
    await run('npm', ['run', 'build']);

    const examples = JSON.parse(await readFile(join(ROOT, 'site', 'src', 'data', 'examples.json'), 'utf8'));
    const found = examples.find((e) => e.id === VALID_EXAMPLE_ID);
    await assert(found, `Expected ${VALID_EXAMPLE_ID} in site/src/data/examples.json`);
    await assert(
      ['id', 'title', 'approach', 'originalPrompt', 'questionsAndAnswers', 'sourcePath', 'buildCommand', 'entryPoint', 'agent', 'workflow', 'model', 'durationMs', 'cost']
        .every((key) => found[key] !== undefined),
      `Expected all meta fields for ${VALID_EXAMPLE_ID}`
    );
    await assert(found.durationMs === null, `Expected unknown example to have null durationMs, got ${found.durationMs}`);

    const publicFiles = await readdir(join(ROOT, 'site', 'public', VALID_EXAMPLE_ID));
    await assert(publicFiles.includes('index.html'), `Expected site/public/${VALID_EXAMPLE_ID}/index.html`);

    const distFiles = await readdir(join(ROOT, 'site', 'dist', VALID_EXAMPLE_ID));
    await assert(distFiles.includes('index.html'), `Expected site/dist/${VALID_EXAMPLE_ID}/index.html`);

    console.log('\n✓ Valid discovery test passed');
  } finally {
    console.log('\nCleaning up valid synthetic example...');
    await teardownValid();
  }
}

async function testInvalidIdRejected() {
  await setupInvalid();
  let rejected = false;
  try {
    await run('node', ['scripts/build-examples.mjs']);
  } catch (err) {
    rejected = true;
  } finally {
    console.log('\nCleaning up invalid synthetic example...');
    await teardownInvalid();
  }
  await assert(rejected, 'Expected build-examples to reject an invalid meta.id');
  console.log('\n✓ Invalid id rejection test passed');
}

async function main() {
  await testValidDiscovery();
  await testInvalidIdRejected();
  await testClaudeScanning();
  console.log('\nRestoring metadata without synthetic examples...');
  await run('node', ['scripts/harvest-meta.mjs']);
  console.log('\n✓ All auto-discovery tests passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
