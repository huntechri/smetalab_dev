import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should display login form correctly', async ({ page }) => {
        await page.goto('/sign-in');

        // Check for main elements
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Пароль', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();

        // Check for branding
        await expect(page.getByText('Smetalab', { exact: true })).toBeVisible();
        await expect(page.getByText('BuildOS')).toBeVisible();
    });

    test('should navigate between sign-in and sign-up', async ({ page }) => {
        await page.goto('/sign-in');

        // Click "Create account"
        await page.getByRole('link', { name: 'Создать аккаунт' }).click();
        await expect(page).toHaveURL(/.*sign-up.*/);

        await expect(page.getByRole('button', { name: 'Создать аккаунт' })).toBeVisible();

        // Check extra field for organization name which is only in sign-up
        await expect(page.getByLabel('Название организации')).toBeVisible();

        // Go back to sign in
        await page.getByRole('link', { name: 'Войти в существующий аккаунт' }).click();
        await expect(page).toHaveURL(/.*sign-in.*/);
    });
});
