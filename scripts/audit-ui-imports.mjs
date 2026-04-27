#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const roots = ['app', 'components', 'features', 'entities', 'shared'];
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const allowlistPrefixes = ['components/shadcn-studio/'];
const forbiddenPackageName = '@repo' + '/ui';
const violations = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isAllowlisted(relativePath) {
  return allowlistPrefixes.some((prefix) => relativePath.startsWith(prefix));
}

function hasForbiddenImport(line) {
  const normalized = line.trim();
  return (
    normalized.includes(`from '${forbiddenPackageName}`) ||
    normalized.includes(`from "${forbiddenPackageName}`) ||
    normalized.startsWith(`import '${forbiddenPackageName}`) ||
    normalized.startsWith(`import "${forbiddenPackageName}`)
  );
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(process.cwd(), filePath));
  if (isAllowlisted(relativePath)) return;

  readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (hasForbiddenImport(line)) {
        violations.push(`${relativePath}:${index + 1} ${line.trim()}`);
      }
    });
}

function walk(directoryPath) {
  for (const entry of readdirSync(directoryPath)) {
    const entryPath = path.join(directoryPath, entry);
    const relativePath = toPosix(path.relative(process.cwd(), entryPath));
    if (isAllowlisted(relativePath)) continue;

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
  console.error('Runtime shared UI import audit failed. Use canonical @/shared/ui/* imports.');
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Runtime shared UI import audit passed.');
}
