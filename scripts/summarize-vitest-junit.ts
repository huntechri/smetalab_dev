import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

type TestCase = {
  classname: string
  name: string
  timeSeconds: number
  failed: boolean
  skipped: boolean
}

type TestSuite = {
  name: string
  timeSeconds: number
  tests: number
  failures: number
  skipped: number
}

const ROOT = process.cwd()
const JUNIT_PATH = path.join(ROOT, 'test-results', 'junit.xml')
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

function parseSuites(xml: string): TestSuite[] {
  const suites: TestSuite[] = []
  for (const match of xml.matchAll(/<testsuite\b([^>]*)>/gu)) {
    const attrs = match[1] ?? ''
    suites.push({
      name: decodeXml(getAttr(attrs, 'name') ?? 'unknown'),
      timeSeconds: parseNumber(getAttr(attrs, 'time')),
      tests: Math.trunc(parseNumber(getAttr(attrs, 'tests'))),
      failures: Math.trunc(parseNumber(getAttr(attrs, 'failures'))),
      skipped: Math.trunc(parseNumber(getAttr(attrs, 'skipped'))),
    })
  }
  return suites
}

function parseCases(xml: string): TestCase[] {
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
  if (!fs.existsSync(JUNIT_PATH)) {
    console.warn(`Vitest JUnit report not found: ${path.relative(ROOT, JUNIT_PATH)}`)
    return
  }

  const xml = fs.readFileSync(JUNIT_PATH, 'utf8')
  const suites = parseSuites(xml)
  const cases = parseCases(xml)
  const slowSuites = [...suites].sort((a, b) => b.timeSeconds - a.timeSeconds).slice(0, 20)
  const slowCases = [...cases].sort((a, b) => b.timeSeconds - a.timeSeconds).slice(0, 30)
  const failedCases = cases.filter((testCase) => testCase.failed)

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_JSON_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalSuites: suites.length,
        totalCases: cases.length,
        totalTimeSeconds: suites.reduce((sum, suite) => sum + suite.timeSeconds, 0),
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
    `# Vitest Unit Timing\n\n- Total suites: ${suites.length}\n- Total test cases: ${cases.length}\n- Total suite time: ${formatSeconds(suites.reduce((sum, suite) => sum + suite.timeSeconds, 0))}\n- Failed cases: ${failedCases.length}\n\n## Slowest suites\n\n${mdTable(slowSuites, [
      ['Suite', (suite) => `\`${suite.name}\``],
      ['Time', (suite) => formatSeconds(suite.timeSeconds)],
      ['Tests', (suite) => String(suite.tests)],
      ['Failures', (suite) => String(suite.failures)],
      ['Skipped', (suite) => String(suite.skipped)],
    ])}\n\n## Slowest test cases\n\n${mdTable(slowCases, [
      ['Classname', (testCase) => `\`${testCase.classname}\``],
      ['Name', (testCase) => `\`${testCase.name}\``],
      ['Time', (testCase) => formatSeconds(testCase.timeSeconds)],
      ['Failed', (testCase) => String(testCase.failed)],
      ['Skipped', (testCase) => String(testCase.skipped)],
    ])}\n\n## Failed test cases\n\n${mdTable(failedCases, [
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
