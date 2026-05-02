import fs from 'node:fs'
import path from 'node:path'
import { test } from '@playwright/test'

const DEFAULT_ROUTES = ['/', '/sign-in', '/sign-up']
const ROUTES = (process.env.UI_SMOKE_ROUTES ?? DEFAULT_ROUTES.join(','))
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const REPORT_DIR = path.join(process.cwd(), 'reports')
const REPORT_JSON_PATH = path.join(REPORT_DIR, 'ui-smoke-report.json')
const REPORT_MD_PATH = path.join(REPORT_DIR, 'ui-smoke-report.md')

const IGNORED_CONSOLE_ERROR_PATTERNS = [/favicon/i, /net::ERR_ABORTED/i]
const CLIENT_ERROR_TEXT_PATTERNS = [
  { category: 'application-error-screen', pattern: /Application error/i },
  { category: 'runtime-error-screen', pattern: /Unhandled Runtime Error/i },
  { category: 'hydration-error-screen', pattern: /Hydration failed/i },
  { category: 'react-client-error-screen', pattern: /Minified React error/i },
  { category: 'chunk-load-error-screen', pattern: /ChunkLoadError/i },
  { category: 'server-action-error-screen', pattern: /Failed to find Server Action/i },
]

type SmokeSeverity = 'high' | 'medium' | 'low'

type SmokeIssue = {
  severity: SmokeSeverity
  category: string
  message: string
  evidence?: string[]
}

type RouteSmokeResult = {
  route: string
  finalUrl: string | null
  status: number | null
  durationMs: number
  bodyVisible: boolean
  landmarkCount: number
  pageErrors: string[]
  consoleErrors: string[]
  detectedErrorScreens: string[]
  issues: SmokeIssue[]
}

function normalizeMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim().slice(0, 500)
}

function isIgnoredConsoleError(message: string): boolean {
  return IGNORED_CONSOLE_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

function summarizeIssue(issue: SmokeIssue): string {
  const evidence = issue.evidence?.length ? ` Evidence: ${issue.evidence.join(' | ')}` : ''
  return `${issue.severity}/${issue.category}: ${issue.message}${evidence}`
}

function collectIssues(result: Omit<RouteSmokeResult, 'issues'>): SmokeIssue[] {
  const issues: SmokeIssue[] = []

  if (result.status === null) {
    issues.push({
      severity: 'high',
      category: 'navigation-no-response',
      message: 'Route navigation did not return an HTTP response.',
    })
  } else if (result.status >= 500) {
    issues.push({
      severity: 'high',
      category: 'server-error-status',
      message: `Route returned HTTP ${result.status}.`,
    })
  } else if (result.status >= 400) {
    issues.push({
      severity: 'medium',
      category: 'client-error-status',
      message: `Route returned HTTP ${result.status}.`,
    })
  }

  if (!result.bodyVisible) {
    issues.push({
      severity: 'high',
      category: 'body-not-visible',
      message: 'The page body was not visible after navigation.',
    })
  }

  if (result.landmarkCount === 0) {
    issues.push({
      severity: 'medium',
      category: 'missing-page-landmark',
      message: 'No main, role="main", or form landmark was found.',
    })
  }

  if (result.pageErrors.length > 0) {
    issues.push({
      severity: 'high',
      category: 'client-side-page-error',
      message: 'The browser reported one or more uncaught page errors.',
      evidence: result.pageErrors,
    })
  }

  if (result.consoleErrors.length > 0) {
    issues.push({
      severity: 'medium',
      category: 'console-error',
      message: 'The page emitted one or more console errors.',
      evidence: result.consoleErrors,
    })
  }

  for (const detectedErrorScreen of result.detectedErrorScreens) {
    issues.push({
      severity: 'high',
      category: detectedErrorScreen,
      message: 'The rendered page contains a known client/runtime error marker.',
    })
  }

  return issues
}

function writeReports(results: RouteSmokeResult[]): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true })

  const issueCount = results.reduce((total, result) => total + result.issues.length, 0)
  const routesWithIssues = results.filter((result) => result.issues.length > 0)
  const severityCounts = results.reduce<Record<SmokeSeverity, number>>(
    (acc, result) => {
      for (const issue of result.issues) acc[issue.severity] += 1
      return acc
    },
    { high: 0, medium: 0, low: 0 }
  )

  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'report-only',
    note: 'This smoke report intentionally does not fail CI when diagnostics are found.',
    totalRoutes: results.length,
    routesWithIssues: routesWithIssues.length,
    issueCount,
    severityCounts,
    results,
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))

  const routeRows = results
    .map((result) => {
      const issues = result.issues.length ? result.issues.map(summarizeIssue).join('<br>') : '—'
      return `| \`${result.route}\` | ${result.status ?? 'n/a'} | ${result.landmarkCount} | ${result.pageErrors.length} | ${result.consoleErrors.length} | ${result.detectedErrorScreens.length} | ${issues.replace(/\|/g, '\\|')} |`
    })
    .join('\n')

  const bugCandidates = routesWithIssues
    .flatMap((result) => result.issues.map((issue) => ({ route: result.route, issue })))
    .map(
      ({ route, issue }) =>
        `### ${issue.severity.toUpperCase()} — ${issue.category} on \`${route}\`\n\n${issue.message}${
          issue.evidence?.length ? `\n\nEvidence:\n${issue.evidence.map((item) => `- ${item}`).join('\n')}` : ''
        }\n`
    )
    .join('\n')

  fs.writeFileSync(
    REPORT_MD_PATH,
    `# UI Smoke Diagnostics\n\nThis is a report-only smoke diagnostic. It intentionally does not fail CI when issues are found. Use this report to create follow-up bug tickets.\n\n- Routes checked: ${results.length}\n- Routes with issues: ${routesWithIssues.length}\n- Total diagnostic issues: ${issueCount}\n- High: ${severityCounts.high}\n- Medium: ${severityCounts.medium}\n- Low: ${severityCounts.low}\n\n## Route summary\n\n| Route | HTTP status | Landmarks | Page errors | Console errors | Error markers | Issues |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n${routeRows || '| — | — | — | — | — | — | — |'}\n\n## Bug report candidates\n\n${bugCandidates || '_No route-level smoke issues detected._'}\n`
  )
}

test.describe.configure({ mode: 'serial' })

test('collects UI smoke diagnostics without failing CI', async ({ page }, testInfo) => {
  const results: RouteSmokeResult[] = []

  for (const route of ROUTES) {
    const startedAt = Date.now()
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    const pageErrorHandler = (error: Error) => {
      pageErrors.push(normalizeMessage(error.message))
    }

    const consoleHandler = (message: { type: () => string; text: () => string }) => {
      if (message.type() !== 'error') return
      const text = normalizeMessage(message.text())
      if (!isIgnoredConsoleError(text)) consoleErrors.push(text)
    }

    page.on('pageerror', pageErrorHandler)
    page.on('console', consoleHandler)

    let status: number | null = null
    let finalUrl: string | null = null
    let bodyVisible = false
    let landmarkCount = 0
    const detectedErrorScreens: string[] = []

    try {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      status = response?.status() ?? null
      finalUrl = page.url()

      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined)

      bodyVisible = await page.locator('body').isVisible({ timeout: 2000 }).catch(() => false)
      landmarkCount = await page.locator('main, [role="main"], form').count().catch(() => 0)

      const bodyText = (await page.locator('body').textContent({ timeout: 2000 }).catch(() => '')) ?? ''
      for (const errorPattern of CLIENT_ERROR_TEXT_PATTERNS) {
        if (errorPattern.pattern.test(bodyText)) detectedErrorScreens.push(errorPattern.category)
      }
    } catch (error) {
      pageErrors.push(normalizeMessage(error instanceof Error ? error.message : String(error)))
    } finally {
      page.off('pageerror', pageErrorHandler)
      page.off('console', consoleHandler)
    }

    const baseResult: Omit<RouteSmokeResult, 'issues'> = {
      route,
      finalUrl,
      status,
      durationMs: Date.now() - startedAt,
      bodyVisible,
      landmarkCount,
      pageErrors,
      consoleErrors,
      detectedErrorScreens,
    }

    results.push({
      ...baseResult,
      issues: collectIssues(baseResult),
    })
  }

  writeReports(results)

  await testInfo.attach('ui-smoke-report-json', {
    path: REPORT_JSON_PATH,
    contentType: 'application/json',
  })
  await testInfo.attach('ui-smoke-report-md', {
    path: REPORT_MD_PATH,
    contentType: 'text/markdown',
  })

  const issueCount = results.reduce((total, result) => total + result.issues.length, 0)
  console.log(`UI smoke diagnostics complete. Found ${issueCount} report-only issue(s).`)
})
