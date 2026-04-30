#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const roots = ['lib/services', 'lib/domain', 'lib/data', 'lib/infrastructure'];
const excludedDirs = new Set(['node_modules', '.next', 'dist', 'build', 'coverage']);
const extensions = new Set(['.ts', '.tsx']);
const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(process.cwd(), filePath));
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.includes("@/features/")) {
      violations.push(`${relativePath}:${index + 1} ${line.trim()}`);
    }
  });
}

function walk(directoryPath) {
  for (const entry of readdirSync(directoryPath)) {
    const entryPath = path.join(directoryPath, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
      if (excludedDirs.has(entry)) continue;
      walk(entryPath);
    } else if (stat.isFile() && extensions.has(path.extname(entryPath))) {
      scanFile(entryPath);
    }
  }
}

for (const root of roots) {
  const rootPath = path.join(process.cwd(), root);
  if (existsSync(rootPath)) walk(rootPath);
}

if (violations.length > 0) {
  console.error('Architecture import guard failed: lib/** must not import from @/features/.');
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Architecture import guard passed.');
}
