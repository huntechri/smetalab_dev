import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

type TestCase = {
  classname: string
  name: string
  timeSeconds: number
  failed: boolean
  skipped: boolean
  reportName: string
}

type TestSuite = {
  name: string
  timeSeconds: number
  tests: number
  failures: number
  skipped: number
  reportName: string
}

const ROOT = process.cwd()
const TEST_RESULTS_DIR = path.join(ROOT, 'test-results')
const REPORT_DIR = path.join(ROOT, 'reports')
const REPORT_MD_PATH = path.join(REPORT_DIR, 'vitest-unit-timing.md')
const REPORT_JSON_PATH = path.join(REPORT_DIR, 'vitest-unit-timing.json')

function getAttr(xml: string, attr: string): string | undefined {
  const match = xml.match(new RegExp(`${attr}="([^"]*)"`, 'u'))
  return match?.[1]
}

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getJunitPaths(): string[] {
  if (!fs.existsSync(TEST_RESULTS_DIR)) return []
  return fs
    .readdirSync(TEST_RESULTS_DIR)
    .filter((fileName) => fileName.startsWith('junit') && fileName.endsWith('.xml'))
    .map((fileName) => path.join(TEST_RESULTS_DIR, fileName))
    .sort()
}

function parseSuites(xml: string, reportName: string): TestSuite[] {
  const suites: TestSuite[] = []
  for (const match of xml.matchAll(/<testsuite\b([^>]*)>/gu)) {
    const attrs = match[1] ?? ''
    suites.push({
      name: decodeXml(getAttr(attrs, 'name') ?? 'unknown'),
      timeSeconds: parseNumber(getAttr(attrs, 'time')),
      tests: Math.trunc(parseNumber(getAttr(attrs, 'tests'))),
      failures: Math.trunc(parseNumber(getAttr(attrs, 'failures'))),
      skipped: Math.trunc(parseNumber(getAttr(attrs, 'skipped'))),
      reportName,
    })
  }
  return suites
}

function parseCases(xml: string, reportName: string): TestCase[] {
  const cases: TestCase[] = []
  for (const match of xml.matchAll(/<testcase\b([^>]*)(?:\/>|>([\s\S]*?)<\/testcase>)/gu)) {
    const attrs = match[1] ?? ''
    const body = match[2] ?? ''
    cases.push({
      classname: decodeXml(getAttr(attrs, 'classname') ?? 'unknown'),
      name: decodeXml(getAttr(attrs, 'name') ?? 'unknown'),
      timeSeconds: parseNumber(getAttr(attrs, 'time')),
      failed: /<failure\b/u.test(body) || /<error\b/u.test(body),
      skipped: /<skipped\b/u.test(body),
      reportName,
    })
  }
  return cases
}

function formatSeconds(value: number): string {
  return `${value.toFixed(3)}s`
}

function mdTable<T>(items: T[], columns: Array<[string, (item: T) => string]>): string {
  if (items.length === 0) return '_No rows._'
  const header = `| ${columns.map(([title]) => title).join(' | ')} |`
  const separator = `| ${columns.map(() => '---').join(' | ')} |`
  const rows = items.map((item) => `| ${columns.map(([, getter]) => getter(item).replace(/\|/g, '\\|')).join(' | ')} |`)
  return [header, separator, ...rows].join('\n')
}

function main(): void {
  const junitPaths = getJunitPaths()
  if (junitPaths.length === 0) {
    console.warn(`Vitest JUnit reports not found in ${path.relative(ROOT, TEST_RESULTS_DIR)}`)
    return
  }

  const suites: TestSuite[] = []
  const cases: TestCase[] = []

  for (const junitPath of junitPaths) {
    const reportName = path.basename(junitPath, '.xml')
    const xml = fs.readFileSync(junitPath, 'utf8')
    suites.push(...parseSuites(xml, reportName))
    cases.push(...parseCases(xml, reportName))
  }

  const slowSuites = [...suites].sort((a, b) => b.timeSeconds - a.timeSeconds).slice(0, 20)
  const slowCases = [...cases].sort((a, b) => b.timeSeconds - a.timeSeconds).slice(0, 30)
  const failedCases = cases.filter((testCase) => testCase.failed)
  const totalSuiteTime = suites.reduce((sum, suite) => sum + suite.timeSeconds, 0)

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_JSON_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        junitReports: junitPaths.map((junitPath) => path.relative(ROOT, junitPath)),
        totalSuites: suites.length,
        totalCases: cases.length,
        totalTimeSeconds: totalSuiteTime,
        failedCases,
        slowSuites,
        slowCases,
      },
      null,
      2,
    ),
  )

  fs.writeFileSync(
    REPORT_MD_PATH,
    `# Vitest Unit Timing\n\n- JUnit reports: ${junitPaths.map((junitPath) => `\`${path.relative(ROOT, junitPath)}\``).join(', ')}\n- Total suites: ${suites.length}\n- Total test cases: ${cases.length}\n- Total suite time: ${formatSeconds(totalSuiteTime)}\n- Failed cases: ${failedCases.length}\n\n## Slowest suites\n\n${mdTable(slowSuites, [
      ['Report', (suite) => `\`${suite.reportName}\``],
      ['Suite', (suite) => `\`${suite.name}\``],
      ['Time', (suite) => formatSeconds(suite.timeSeconds)],
      ['Tests', (suite) => String(suite.tests)],
      ['Failures', (suite) => String(suite.failures)],
      ['Skipped', (suite) => String(suite.skipped)],
    ])}\n\n## Slowest test cases\n\n${mdTable(slowCases, [
      ['Report', (testCase) => `\`${testCase.reportName}\``],
      ['Classname', (testCase) => `\`${testCase.classname}\``],
      ['Name', (testCase) => `\`${testCase.name}\``],
      ['Time', (testCase) => formatSeconds(testCase.timeSeconds)],
      ['Failed', (testCase) => String(testCase.failed)],
      ['Skipped', (testCase) => String(testCase.skipped)],
    ])}\n\n## Failed test cases\n\n${mdTable(failedCases, [
      ['Report', (testCase) => `\`${testCase.reportName}\``],
      ['Classname', (testCase) => `\`${testCase.classname}\``],
      ['Name', (testCase) => `\`${testCase.name}\``],
      ['Time', (testCase) => formatSeconds(testCase.timeSeconds)],
    ])}\n`,
  )

  console.log(`Vitest timing summary written to ${path.relative(ROOT, REPORT_MD_PATH)}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
