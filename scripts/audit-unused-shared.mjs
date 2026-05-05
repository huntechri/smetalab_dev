#!/usr/bin/env node
/**
 * audit-unused-shared.mjs
 * Finds exports from shared/ui/ that are never imported anywhere in the project.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SHARED_UI_DIR = path.join(process.cwd(), 'shared', 'ui');
const SEARCH_ROOTS = ['app', 'components', 'features', 'shared', 'lib'];
const EXTENSIONS = new Set(['.tsx', '.ts']);
const REPORT_PATH = path.join(process.cwd(), 'reports', 'unused-shared.md');

// ── Step 1: Collect all exports from shared/ui ────────────────────────────

/** @type {Map<string, string[]>} file -> list of exported names */
const sharedExports = new Map();

const EXPORT_RE = /export\s+(?:(?:const|function|class|type|interface|enum)\s+(\w+)|{\s*([^}]+)\s*})/g;
const REEXPORT_RE = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;

function extractExports(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const names = new Set();

  let m;
  EXPORT_RE.lastIndex = 0;
  while ((m = EXPORT_RE.exec(src)) !== null) {
    if (m[1]) {
      names.add(m[1]);
    } else if (m[2]) {
      for (const part of m[2].split(',')) {
        // handle "Foo as Bar" → take "Bar" (the public alias)
        const alias = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (alias) names.add(alias);
      }
    }
  }
  return [...names];
}

function walkShared(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkShared(full);
    } else if (stat.isFile() && EXTENSIONS.has(path.extname(full))) {
      const rel = full; // absolute path, used as map key
      const exports = extractExports(full);
      if (exports.length > 0) sharedExports.set(full, exports);
    }
  }
}

walkShared(SHARED_UI_DIR);

// ── Step 2: Build a set of all import tokens used in the whole project ────

const usedNames = new Set();

// Matches: import { Foo, Bar } from '@/shared/ui/...' or '../shared/ui/...'
const IMPORT_NAMED_RE = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
// Matches: import Foo from '...'
const IMPORT_DEFAULT_RE = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;

function collectImports(filePath) {
  const src = readFileSync(filePath, 'utf8');

  let m;
  IMPORT_NAMED_RE.lastIndex = 0;
  while ((m = IMPORT_NAMED_RE.exec(src)) !== null) {
    for (const part of m[1].split(',')) {
      const alias = part.trim().split(/\s+as\s+/).shift()?.trim(); // take the ORIGINAL name
      if (alias) usedNames.add(alias);
    }
  }

  IMPORT_DEFAULT_RE.lastIndex = 0;
  while ((m = IMPORT_DEFAULT_RE.exec(src)) !== null) {
    usedNames.add(m[1]);
  }
}

function walkProject(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkProject(full);
    } else if (stat.isFile() && EXTENSIONS.has(path.extname(full))) {
      collectImports(full);
    }
  }
}

for (const root of SEARCH_ROOTS) {
  const rootPath = path.join(process.cwd(), root);
  if (existsSync(rootPath)) walkProject(rootPath);
}

// ── Step 3: Find exports that are never used ──────────────────────────────

/** @type {{ file: string; name: string }[]} */
const unused = [];

for (const [filePath, names] of sharedExports) {
  const relPath = filePath.replace(process.cwd() + path.sep, '').split(path.sep).join('/');

  // Skip index barrel files (they re-export others, not real components)
  if (path.basename(filePath) === 'index.ts' || path.basename(filePath) === 'index.tsx') continue;
  // Skip type-only files (pure token/constant files are ok to export freely)
  // Actually let's include them — unused tokens are still dead weight

  for (const name of names) {
    if (!usedNames.has(name)) {
      unused.push({ file: relPath, name });
    }
  }
}

// ── Step 4: Write report ──────────────────────────────────────────────────

// Group by file
const grouped = {};
for (const { file, name } of unused) {
  if (!grouped[file]) grouped[file] = [];
  grouped[file].push(name);
}

let md = `# Unused Shared/UI Exports Audit\n\n`;
md += `Exports from \`shared/ui/\` that are **never imported** anywhere in \`app/\`, \`components/\`, \`features/\`, \`shared/\`, or \`lib/\`.\n\n`;
md += `> ⚠️ This is a static analysis — barrel re-exports (\`index.ts\`) and dynamic imports are not tracked. Verify before deleting.\n\n---\n\n`;

const fileCount = Object.keys(grouped).length;
const totalCount = unused.length;

if (totalCount === 0) {
  md += `**🎉 No unused exports found!**\n`;
} else {
  md += `**${totalCount} unused export(s) across ${fileCount} file(s)**\n\n`;
  for (const [file, names] of Object.entries(grouped)) {
    md += `### \`${file}\`\n`;
    for (const name of names) {
      md += `- \`${name}\`\n`;
    }
    md += '\n';
  }
}

md += `\n---\n_Generated: ${new Date().toISOString()}_\n`;

writeFileSync(REPORT_PATH, md, 'utf8');
console.log(`\nAudit complete: ${totalCount} unused export(s) found.`);
console.log(`Report: ${REPORT_PATH}`);
