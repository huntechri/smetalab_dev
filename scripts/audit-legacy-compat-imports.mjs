#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const roots = ['.'];
const excludedDirs = new Set(['node_modules', '.next', 'dist', 'build', 'coverage', '.git']);
const extensions = new Set(['.ts', '.tsx']);
const forbiddenImports = [
  '@/features/projects/estimates/types/dto',
  '@/features/projects/estimates/types/execution.dto',
  '@/features/projects/estimates/types/room-params.dto',
  '@/features/projects/estimates/schemas/room-params.schema',
  '@/features/catalog/types/dto',
  '@/features/global-purchases/types/dto',
  '@/features/global-purchases/lib/date',
  '@/features/guide-catalog',
  '@/features/directories',
];
const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isForbiddenImport(specifier) {
  const normalized = specifier.trim();
  return forbiddenImports.some(
    (forbidden) => normalized === forbidden || normalized.startsWith(`${forbidden}/`),
  );
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(process.cwd(), filePath));
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!(trimmed.startsWith('import ') || trimmed.startsWith('export '))) return;

    const match = trimmed.match(/\bfrom\s+['"]([^'"]+)['"]/);
    if (!match) return;

    if (isForbiddenImport(match[1])) {
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
  console.error('Legacy compatibility import audit failed.');
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Legacy compatibility import audit passed.');
}
