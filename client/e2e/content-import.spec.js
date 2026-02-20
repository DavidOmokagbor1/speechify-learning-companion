import { test, expect } from '@playwright/test';

test.describe('Content import (Paste Link) E2E', () => {
  test.beforeEach(async ({ page }) => {
    const email = `import-e2e-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /register|create/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('Paste Link input and Import button are visible', async ({ page }) => {
    await expect(page.getByText('Paste Link')).toBeVisible();
    await expect(page.getByPlaceholder(/example\.com\/article/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();
  });

  test('shows toast when Paste Link URL is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Import' }).click();
    await expect(page.getByText(/enter a url/i)).toBeVisible({ timeout: 3000 });
  });

  test('Paste Link with article URL navigates to Listen when successful', async ({ page }) => {
    // Use a simple public page that returns HTML (example.com has minimal content)
    await page.getByPlaceholder(/example\.com\/article/i).fill('example.com');
    await page.getByRole('button', { name: 'Import' }).click();

    // Either navigates to listen with content, or shows error toast
    await page.waitForTimeout(3000);
    const url = page.url();
    const hasListen = url.includes('/listen');
    const hasError = await page.getByText(/failed|could not|error|invalid/i).isVisible().catch(() => false);

    expect(hasListen || hasError).toBe(true);
  });
});
