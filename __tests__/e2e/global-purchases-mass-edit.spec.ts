import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;
const READY = process.env.E2E_GLOBAL_PURCHASES_READY === '1';

test.describe('Global purchases mass edit', () => {
    test.skip(!EMAIL || !PASSWORD || !READY, 'Set E2E_EMAIL, E2E_PASSWORD and E2E_GLOBAL_PURCHASES_READY=1 to run mass-edit scenario.');

    test('edits 100 rows without visible UI degradation', async ({ page }) => {
        await page.goto('/sign-in');
        await page.getByLabel('Email').fill(EMAIL!);
        await page.getByLabel('Пароль', { exact: true }).fill(PASSWORD!);
        await page.getByRole('button', { name: 'Войти' }).click();

        await page.goto('/app/global-purchases');
        await expect(page.getByText('Итого закупки')).toBeVisible();

        const start = Date.now();
        const materialCells = page.getByLabel('Наименование материала');

        for (let index = 0; index < 100; index += 1) {
            const cell = materialCells.nth(index);
            await cell.click();
            await cell.fill(`Массовое обновление ${index + 1}`);
            await cell.blur();
        }

        const elapsedMs = Date.now() - start;
        expect(elapsedMs).toBeLessThan(15000);
        await expect(page.getByText('Массовое обновление 100')).toBeVisible();
    });
});
