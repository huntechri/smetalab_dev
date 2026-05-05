#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const roots = ['app', 'components', 'features', 'shared'];
const extensions = new Set(['.tsx', '.ts']);
const reportPath = path.join(process.cwd(), 'reports', 'typography-bugs.md');

// Regular expressions to catch typography inconsistencies
const arbitraryFontSizeRegex = /\btext-\[(9px|10px|11px|12px)\]\b/;

const findings = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(process.cwd(), filePath));
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    // Exclude design system token definition files and shadcn primitive internals
    const EXCLUDED = [
      'shared/ui/primitive-surface.ts',
      'shared/ui/primitive-badge.ts',
      'shared/ui/primitive-controls.ts', // intentional: file input, select label, base input styles
      'shared/ui/command.tsx',            // shadcn internal: cmdk heading + shortcut styles
      'shared/ui/context-menu.tsx',       // shadcn internal: keyboard shortcut label
      'shared/ui/dropdown-menu.tsx',      // shadcn internal: keyboard shortcut label
      'shared/ui/menubar.tsx',            // shadcn internal: keyboard shortcut label
      'shared/ui/kbd.tsx',                // intentional: <kbd> element is always small
      'shared/ui/avatar.tsx',             // intentional: avatar fallback size variant
    ];
    if (EXCLUDED.some((e) => relativePath.includes(e))) {
      return;
    }

    const hasArbitraryFontSize = arbitraryFontSizeRegex.test(line);
    
    // To reliably find "fake captions" (text-xs + muted/opacity), 
    // we extract string literals to check if BOTH classes are present in the same class string
    let hasFakeCaption = false;
    const stringLiterals = line.match(/(["'`])(.*?)\1/g) || [];
    for (const str of stringLiterals) {
      if (/\btext-xs\b/.test(str) && /\b(opacity-\d+|text-muted-foreground)\b/.test(str)) {
        hasFakeCaption = true;
        break;
      }
    }

    if (hasArbitraryFontSize || hasFakeCaption) {
      findings.push({
        file: relativePath,
        line: index + 1,
        content: line.trim(),
        type: hasArbitraryFontSize ? 'Arbitrary Font Size (use compactCaption)' : 'Fake Caption (text-xs + opacity)'
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

let md = `# Typography & Metric Pill Inconsistencies Audit

This report documents instances of hardcoded metric typography (\`text-[9px]\`, \`text-[10px]\`, \`text-[11px]\`) and fake captions (\`text-xs\` with \`opacity\` or \`text-muted-foreground\`). These should be replaced with canonical tokens like \`primitiveVisualTypographyClassNames.compactCaption\` or wrapped in \`EstimateMetricPill\` / \`Badge\`.

---

`;

if (findings.length === 0) {
  md += `**🎉 No typography inconsistencies found!**\n`;
} else {
  for (const [dir, items] of Object.entries(grouped)) {
    md += `## \`${dir}/\` Module Findings (${items.length})\n\n`;
    md += `| File | Line | Content | Type |\n`;
    md += `|---|---|---|---|\n`;
    for (const item of items) {
      const safeContent = item.content.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      md += `| \`${item.file}:${item.line}\` | ${item.line} | \`${safeContent}\` | ${item.type} |\n`;
    }
    md += `\n---\n\n`;
  }
}

md += `## Total: ${findings.length} findings\n`;

writeFileSync(reportPath, md, 'utf8');
console.log(`Successfully generated typography bugs audit report at ${reportPath}`);
