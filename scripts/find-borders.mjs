#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.mdx',
  '.html',
  '.json',
  '.yml',
  '.yaml',
]);

const BORDER_TOKEN_RE = /\bborder(?:-[^\s"'`)]*)?/g;

function listTrackedFiles() {
  const stdout = execSync('git ls-files', { encoding: 'utf8' });
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => EXTS.has(path.extname(file)));
}

function classify(token) {
  if (token === 'border') return 'bare-border';
  if (/^border-\[[^\]]+\]$/.test(token)) return 'arbitrary-color';
  if (/^border-(gray|zinc|slate|neutral)-/.test(token)) return 'hardcoded-neutral';
  if (/^border-(black|white)/.test(token)) return 'hardcoded-absolute';
  if (/^border-border(\/\d+)?$/.test(token)) return 'design-token';
  return 'other';
}

const files = listTrackedFiles();
const stats = new Map();
const hits = [];

for (const file of files) {
  const text = await fs.readFile(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.includes('--border')) return;
    const matches = line.match(BORDER_TOKEN_RE);
    if (!matches) return;
    for (const token of matches) {
      const kind = classify(token);
      stats.set(kind, (stats.get(kind) ?? 0) + 1);
      hits.push({ file, line: idx + 1, token, kind, snippet: line.trim() });
    }
  });
}

console.log('=== Border token summary ===');
for (const [k, v] of [...stats.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`${k}: ${v}`);
}

console.log('\n=== Detailed hits (non design-token) ===');
for (const h of hits.filter((h) => h.kind !== 'design-token')) {
  console.log(`${h.file}:${h.line} [${h.kind}] ${h.token} :: ${h.snippet}`);
}
