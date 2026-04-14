import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

type PackageJson = {
  scripts?: Record<string, string>;
};

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function extractDbCommandsFromReadme(readme: string): string[] {
  const sectionMatch = readme.match(/##\s+💾\s+Команды работы с БД([\s\S]*?)(?:\r?\n##\s|$)/u);

  if (!sectionMatch) {
    throw new Error('README database commands section is missing.');
  }

  const sectionBody = sectionMatch[1];
  const codeFenceMatch = sectionBody.match(/```bash\r?\n([\s\S]*?)```/u);

  if (!codeFenceMatch) {
    throw new Error('README database commands code block is missing.');
  }

  return codeFenceMatch[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('pnpm '))
    .map((line) => line.replace(/^pnpm\s+/u, '').split(/\s+/u)[0]);
}

describe('repository consistency', () => {
  it('keeps README db commands aligned with package scripts', () => {
    const pkg = JSON.parse(readRepoFile('package.json')) as PackageJson;
    const scripts = pkg.scripts ?? {};
    const readme = readRepoFile('README.md');

    const commands = extractDbCommandsFromReadme(readme);
    const missingScripts = commands.filter((command) => !(command in scripts));

    expect(missingScripts).toEqual([]);
  });
});
