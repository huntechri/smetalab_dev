import { expect, test } from '@playwright/test'

const DEFAULT_ROUTES = ['/', '/sign-in', '/sign-up']
const ROUTES = (process.env.UI_SMOKE_ROUTES ?? DEFAULT_ROUTES.join(','))
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

for (const route of ROUTES) {
  test(`renders ${route} without a client-side crash`, async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })

    expect(response?.status(), `Unexpected HTTP status for ${route}`).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()

    const landmarkCount = await page.locator('main, [role="main"], form').count()
    expect(landmarkCount, `Expected at least one page landmark on ${route}`).toBeGreaterThan(0)

    await page.waitForLoadState('networkidle').catch(() => undefined)

    expect(pageErrors, `Client-side page errors on ${route}`).toEqual([])
    expect(
      consoleErrors.filter((message) => !message.includes('favicon') && !message.includes('net::ERR_ABORTED')),
      `Console errors on ${route}`
    ).toEqual([])
  })
}
