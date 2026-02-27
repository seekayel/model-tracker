#!/usr/bin/env node

/**
 * Build all playable game projects under games/.
 *
 * For each directory containing package.json (excluding backups/hidden dirs):
 *   1. bun install
 *   2. bun run build
 *   3. Copy dist/ -> public/games/<relative-path>/
 */

import { readdirSync, existsSync, cpSync, mkdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const GAMES_DIR = join(ROOT, 'games');
const OUTPUT_DIR = join(ROOT, 'public', 'games');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.backups']);

function shouldSkipDirectory(name) {
  return name.startsWith('.') || SKIP_DIRS.has(name);
}

function collectGameProjectDirs(directory) {
  const projectDirs = [];

  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (shouldSkipDirectory(entry.name)) {
      continue;
    }

    const childDir = join(directory, entry.name);
    const pkgPath = join(childDir, 'package.json');

    if (existsSync(pkgPath)) {
      projectDirs.push(childDir);
      continue;
    }

    projectDirs.push(...collectGameProjectDirs(childDir));
  }

  return projectDirs;
}

function toPosixPath(path) {
  return path.split('\\').join('/');
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const gameProjectDirs = collectGameProjectDirs(GAMES_DIR)
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

let built = 0;
let failed = 0;

for (const gameDir of gameProjectDirs) {
  const relativeGamePath = toPosixPath(relative(GAMES_DIR, gameDir));

  // Skip if path escapes games/ due to symlink or unexpected input
  if (relativeGamePath.startsWith('..')) {
    continue;
  }

  const distDir = join(gameDir, 'dist');
  const outputGameDir = join(OUTPUT_DIR, relativeGamePath);

  if (!statSync(gameDir).isDirectory()) {
    continue;
  }

  console.log(`\n  BUILD  ${relativeGamePath}`);
  console.log(`  ${'─'.repeat(40)}`);

  try {
    console.log('  Installing dependencies...');
    execSync('bun install', { cwd: gameDir, stdio: 'inherit' });

    console.log('  Running build...');
    execSync('bun run build', { cwd: gameDir, stdio: 'inherit' });

    if (!existsSync(distDir)) {
      console.error(`  ERROR  ${relativeGamePath}: build did not produce a dist/ directory`);
      failed++;
      continue;
    }

    mkdirSync(outputGameDir, { recursive: true });
    cpSync(distDir, outputGameDir, { recursive: true });

    console.log(`  OK  ${relativeGamePath} -> public/games/${relativeGamePath}/`);
    built++;
  } catch (err) {
    console.error(`  FAIL  ${relativeGamePath}: ${err.message}`);
    failed++;
  }
}

console.log(`\n  ${'═'.repeat(40)}`);
console.log(`  Game projects built: ${built} | Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
