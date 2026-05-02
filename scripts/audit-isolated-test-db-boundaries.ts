import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

type Severity = 'high' | 'medium'
type Finding = {
  filePath: string
  line: number
  severity: Severity
  token: string
  reason: string
}

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'reports')
const REPORT_MD_PATH = path.join(REPORT_DIR, 'isolated-test-db-boundaries.md')
const REPORT_JSON_PATH = path.join(REPORT_DIR, 'isolated-test-db-boundaries.json')
const SCAN_ROOTS = [
  '__tests__/unit',
  '__tests__/ui',
  '__tests__/api',
  '__tests__/performance',
  'packages',
]
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const EXCLUDED_SEGMENTS = new Set(['node_modules', '__tests__/integration', '__tests__/e2e', 'test-results', 'coverage'])
const TEST_FILE_PATTERN = /(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/u

const FORBIDDEN_IMPORT_PATTERNS: Array<{ pattern: RegExp; severity: Severity; reason: string }> = [
  {
    pattern: /from\s+['"]@\/lib\/data(?:\/|['"])/u,
    severity: 'high',
    reason: 'Isolated tests must not import data-layer modules directly. Move the test to integration or mock the repository boundary.',
  },
  {
    pattern: /from\s+['"]@\/lib\/data\/db(?:\/|['"])/u,
    severity: 'high',
    reason: 'Isolated tests must not import DB entrypoints. Move the test to integration or mock the DB boundary.',
  },
  {
    pattern: /from\s+['"](?:drizzle-orm|postgres|pg)(?:\/|['"])/u,
    severity: 'high',
    reason: 'Isolated tests must not import database clients directly.',
  },
  {
    pattern: /process\.env\.(?:DATABASE_URL|POSTGRES_URL|TEST_DATABASE_URL|LOCAL_DATABASE_URL)/u,
    severity: 'medium',
    reason: 'Isolated tests should not depend on database env vars except explicit env-boundary tests.',
  },
]

function toPosix(filePath: string): string {
  return filePath.split(path.sep).join('/')
}

function shouldSkip(relativePath: string): boolean {
  return relativePath.split('/').some((segment) => EXCLUDED_SEGMENTS.has(segment))
}

function walk(directoryPath: string, files: string[] = []): string[] {
  if (!fs.existsSync(directoryPath)) return files

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name)
    const relativePath = toPosix(path.relative(ROOT, fullPath))
    if (shouldSkip(relativePath)) continue

    if (entry.isDirectory()) walk(fullPath, files)
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name)) && TEST_FILE_PATTERN.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function scanFile(filePath: string): Finding[] {
  const relativePath = toPosix(path.relative(ROOT, filePath))
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/u)
  const findings: Finding[] = []

  lines.forEach((line, index) => {
    for (const rule of FORBIDDEN_IMPORT_PATTERNS) {
      const match = line.match(rule.pattern)
      if (!match) continue
      findings.push({
        filePath: relativePath,
        line: index + 1,
        severity: rule.severity,
        token: match[0],
        reason: rule.reason,
      })
    }
  })

  return findings
}

function writeReports(scannedFiles: number, findings: Finding[]): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_JSON_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scanRoots: SCAN_ROOTS,
        scannedFiles,
        totalFindings: findings.length,
        highFindings: findings.filter((finding) => finding.severity === 'high').length,
        mediumFindings: findings.filter((finding) => finding.severity === 'medium').length,
        findings,
      },
      null,
      2,
    ),
  )

  const rows = findings
    .map(
      (finding) =>
        `| ${finding.severity} | \`${finding.filePath}:${finding.line}\` | \`${finding.token.replace(/\|/g, '\\|')}\` | ${finding.reason} |`,
    )
    .join('\n')

  fs.writeFileSync(
    REPORT_MD_PATH,
    `# Isolated Test DB Boundary Audit\n\nThis report checks that unit/UI/API/performance tests do not silently turn into DB integration tests.\n\n- Scanned files: ${scannedFiles}\n- Total findings: ${findings.length}\n- High findings: ${findings.filter((finding) => finding.severity === 'high').length}\n- Medium findings: ${findings.filter((finding) => finding.severity === 'medium').length}\n\n| Severity | Location | Token | Reason |\n| --- | --- | --- | --- |\n${rows || '| - | - | - | - |'}\n`,
  )
}

function main(): void {
  const strict = process.argv.includes('--strict')
  const report = process.argv.includes('--report') || strict
  const files = SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root)))
  const findings = files.flatMap(scanFile)

  if (report) writeReports(files.length, findings)

  console.log(`Isolated test DB boundary audit complete. Scanned ${files.length} file(s), found ${findings.length} finding(s).`)

  if (strict && findings.some((finding) => finding.severity === 'high')) {
    console.error('Isolated test DB boundary audit failed: high-severity DB boundary findings detected.')
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
