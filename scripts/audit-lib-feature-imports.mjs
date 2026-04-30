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

function isFeatureImport(specifier) {
  const normalized = specifier.trim();
  if (normalized.startsWith('@/features/')) return true;
  if (!normalized.startsWith('.')) return false;

  const segments = normalized.split('/');
  let depth = 0;
  for (const segment of segments) {
    if (segment === '..') depth += 1;
    else if (segment !== '.') break;
  }

  return depth >= 2 && normalized.includes('/features/');
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(process.cwd(), filePath));
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!(trimmed.startsWith('import ') || trimmed.startsWith('export '))) return;

    const match = trimmed.match(/\bfrom\s+['"]([^'"]+)['"]/);
    if (!match) return;

    if (isFeatureImport(match[1])) {
      violations.push(`${relativePath}:${index + 1} ${trimmed}`);
    }
  });
}

function walk(directoryPath) {
  for (const entry of readdirSync(directoryPath)) {
    if (excludedDirs.has(entry)) continue;

    const entryPath = path.join(directoryPath, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
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
  console.error('Lib-to-feature import boundary audit failed.');
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Lib-to-feature import boundary audit passed.');
}
