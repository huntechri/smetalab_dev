import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

type MigrationJournalEntry = {
  idx: number;
  tag: string;
};

type MigrationJournal = {
  entries: MigrationJournalEntry[];
};

function readMigrationJournal(): MigrationJournal {
  const content = readFileSync(
    path.join(process.cwd(), 'lib/data/db/migrations/meta/_journal.json'),
    'utf8',
  );

  return JSON.parse(content) as MigrationJournal;
}

function getMigrationSqlBasenames(): string[] {
  return readdirSync(path.join(process.cwd(), 'lib/data/db/migrations'))
    .filter((fileName) => fileName.endsWith('.sql'))
    .map((fileName) => fileName.replace(/\.sql$/u, ''))
    .sort();
}

describe('db migration artifacts integrity', () => {
  it('keeps journal entries contiguous and aligned with sql files', () => {
    const journal = readMigrationJournal();
    const sqlBasenames = getMigrationSqlBasenames();
    const journalTags = journal.entries.map((entry) => entry.tag);

    for (const [position, entry] of journal.entries.entries()) {
      expect(entry.idx).toBe(position);
    }

    expect(journalTags).toEqual(sqlBasenames);
  });
});
