#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const roots = ['app', 'components', 'features'];
const extensions = new Set(['.tsx']);
const reportPath = path.join(process.cwd(), 'reports', 'ui-local-classes.md');

const arbitraryClassRegex = /className="[^"]*-\[[^"]*\]/g;
const inlineStyleRegex = /style=\{\{[^}]*\}\}/g;
const customClassRegex = /\b(text-display|text-title|text-subtitle|text-body|text-caption|skip-link|glass-card|glass-morphism|text-gradient|no-scrollbar)\b/g;

const findings = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(process.cwd(), filePath));
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const hasArbitrary = arbitraryClassRegex.test(line);
    const hasInline = inlineStyleRegex.test(line);
    const hasCustom = customClassRegex.test(line);

    // Reset regex indices just to be safe with global flag
    arbitraryClassRegex.lastIndex = 0;
    inlineStyleRegex.lastIndex = 0;
    customClassRegex.lastIndex = 0;

    if (hasArbitrary || hasInline || hasCustom) {
      findings.push({
        file: relativePath,
        line: index + 1,
        content: line.trim(),
        type: hasArbitrary ? 'Arbitrary Class' : hasInline ? 'Inline Style' : 'Custom CSS Class'
      });
    }
  });
}

function walk(directoryPath) {
  for (const entry of readdirSync(directoryPath)) {
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

// Group findings by root
const grouped = {};
findings.forEach((f) => {
  const firstDir = f.file.split('/')[0] || 'other';
  if (!grouped[firstDir]) grouped[firstDir] = [];
  grouped[firstDir].push(f);
});

let md = `# UI Local Classes Audit (Generated via Script)

This report documents every instance of arbitrary Tailwind classes, inline styles, and bespoke CSS classes detected via ` + '`pnpm audit:ui-local-classes`.' + `

---

`;

for (const [dir, items] of Object.entries(grouped)) {
  md += `## \`${dir}/\` Module Findings\n\n`;
  md += `| File | Line | Content | Type |\n`;
  md += `|---|---|---|---|\n`;
  for (const item of items) {
    const safeContent = item.content.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    md += `| \`${item.file}\` | ${item.line} | \`${safeContent}\` | ${item.type} |\n`;
  }
  md += `\n---\n\n`;
}

md += `## Summary & Recommendations

- **Complete Automation**: This audit was generated programmatically by scanning the entire workspace.
- **Design Alignment**: Arbitrary values should be systematically replaced with standard Design System tokens from ` + '`docs/DESIGN_SYSTEM.md`' + `.
`;

writeFileSync(reportPath, md, 'utf8');
console.log(`Successfully generated local classes audit report at ${reportPath}`);
