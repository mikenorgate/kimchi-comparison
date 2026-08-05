import { readdir, readFile, mkdir, cp, rm, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const execFileAsync = promisify(execFile);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDED_DIRS = new Set(['site', 'node_modules', '.git', '.github', 'scripts', 'Archive.zip']);

async function listImplementationDirs() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    dirs.push({ name: entry.name, path: join(ROOT, entry.name) });
  }
  return dirs.sort((a, b) => a.name.localeCompare(b.name));
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function validateId(id, dirName) {
  if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) {
    throw new Error(
      `Invalid meta.id "${id}" for ${dirName}. IDs must be lowercase alphanumeric with hyphens only.`
    );
  }
}

async function copyDir(src, dest, { ignore = [] } = {}) {
  const ignoreSet = new Set(ignore);
  await cp(src, dest, {
    recursive: true,
    filter: (source) => {
      const base = source.slice(src.length + 1).split('/')[0];
      return !ignoreSet.has(base);
    },
  });
}

async function buildImplementation(dir, publicDir) {
  const pkgPath = join(dir.path, 'package.json');
  const pkg = await readJson(pkgPath);
  const isVite = pkg?.devDependencies?.vite || pkg?.dependencies?.vite;

  if (isVite && pkg?.scripts?.build) {
    console.log(`Building ${dir.name} with npm...`);
    await execFileAsync('npm', ['install'], { cwd: dir.path, stdio: 'inherit' });
    await execFileAsync('npm', ['run', 'build'], { cwd: dir.path, stdio: 'inherit' });
    const distDir = join(dir.path, 'dist');
    if (await pathExists(distDir)) {
      await copyDir(distDir, publicDir);
    } else {
      throw new Error(`Expected dist directory at ${distDir}`);
    }
    return;
  }

  // Static implementation: copy all source files except metadata and dependencies.
  console.log(`Copying static implementation ${dir.name}...`);
  const sourceFiles = await readdir(dir.path, { withFileTypes: true });
  for (const entry of sourceFiles) {
    if (entry.name === 'meta.json') continue;
    if (entry.name === 'node_modules') continue;
    const src = join(dir.path, entry.name);
    const dest = join(publicDir, entry.name);
    await cp(src, dest, { recursive: true });
  }
}

async function main() {
  const dirs = await listImplementationDirs();
  const sitePublicDir = join(ROOT, 'site', 'public');

  // Clean previous copies.
  if (await pathExists(sitePublicDir)) {
    const entries = await readdir(sitePublicDir, { withFileTypes: true });
    for (const entry of entries) {
      if (/^[a-z0-9-]+$/.test(entry.name)) {
        await rm(join(sitePublicDir, entry.name), { recursive: true, force: true });
      }
    }
  } else {
    await mkdir(sitePublicDir, { recursive: true });
  }

  for (const dir of dirs) {
    const meta = await readJson(join(dir.path, 'meta.json'));
    if (!meta) {
      console.warn(`Skipping ${dir.name}: no meta.json`);
      continue;
    }
    validateId(meta.id, dir.name);
    const publicDir = join(sitePublicDir, meta.id);
    await mkdir(publicDir, { recursive: true });
    await buildImplementation(dir, publicDir);
    console.log(`Prepared ${publicDir}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
