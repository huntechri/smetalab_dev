#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'features', 'shared', 'lib'];
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.mdx']);

const BORDER_TOKEN_RE = /\bborder(?:-[^\s"'`}]*)?/g;

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.git') || entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    if (EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function classify(token) {
  if (token === 'border') return 'bare-border';
  if (/^border-\[[^\]]+\]$/.test(token)) return 'arbitrary-color';
  if (/^border-(gray|zinc|slate|neutral)-/.test(token)) return 'hardcoded-neutral';
  if (/^border-(black|white)/.test(token)) return 'hardcoded-absolute';
  if (/^border-border(\/\d+)?$/.test(token)) return 'design-token';
  return 'other';
}

const files = (await Promise.all(ROOTS.map((r) => walk(r).catch(() => [])))).flat();
const stats = new Map();
const hits = [];

for (const file of files) {
  const text = await fs.readFile(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
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
