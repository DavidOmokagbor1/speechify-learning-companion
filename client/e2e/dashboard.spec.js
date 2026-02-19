import { test, expect } from '@playwright/test';

test.describe('Dashboard (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    const email = `dash-e2e-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /register|create/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('shows dashboard stats', async ({ page }) => {
    await page.getByRole('link', { name: /stats/i }).first().click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Total Quizzes')).toBeVisible();
    await expect(page.getByText('Avg Score')).toBeVisible();
    await expect(page.getByText('Daily Streak')).toBeVisible();
  });

  test('export CSV button exists', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible();
  });
});
