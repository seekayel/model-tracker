#!/usr/bin/env node

/**
 * Build all games in the games/ directory.
 *
 * For each subdirectory with a package.json:
 *   1. bun install
 *   2. bun run build
 *   3. Copy dist/ -> public/games/<game-name>/
 */

import { readdirSync, existsSync, cpSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const GAMES_DIR = join(ROOT, 'games');
const OUTPUT_DIR = join(ROOT, 'public', 'games');

// Ensure output dir exists
mkdirSync(OUTPUT_DIR, { recursive: true });

const entries = readdirSync(GAMES_DIR);

let built = 0;
let failed = 0;

for (const entry of entries) {
  const gameDir = join(GAMES_DIR, entry);

  // Skip non-directories and hidden files
  if (!statSync(gameDir).isDirectory()) continue;
  if (entry.startsWith('.')) continue;

  const pkgPath = join(gameDir, 'package.json');
  if (!existsSync(pkgPath)) {
    console.log(`  SKIP  ${entry} (no package.json)`);
    continue;
  }

  console.log(`\n  BUILD  ${entry}`);
  console.log(`  ${'─'.repeat(40)}`);

  try {
    // Install dependencies
    console.log(`  Installing dependencies...`);
    execSync('bun install', { cwd: gameDir, stdio: 'inherit' });

    // Build
    console.log(`  Running build...`);
    execSync('bun run build', { cwd: gameDir, stdio: 'inherit' });

    // Copy dist to public/games/<name>
    const distDir = join(gameDir, 'dist');
    if (!existsSync(distDir)) {
      console.error(`  ERROR  ${entry}: build did not produce a dist/ directory`);
      failed++;
      continue;
    }

    const outputGameDir = join(OUTPUT_DIR, entry);
    mkdirSync(outputGameDir, { recursive: true });
    cpSync(distDir, outputGameDir, { recursive: true });

    console.log(`  OK  ${entry} -> public/games/${entry}/`);
    built++;
  } catch (err) {
    console.error(`  FAIL  ${entry}: ${err.message}`);
    failed++;
  }
}

console.log(`\n  ${'═'.repeat(40)}`);
console.log(`  Games built: ${built} | Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
