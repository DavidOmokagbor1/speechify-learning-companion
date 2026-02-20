import { test, expect } from '@playwright/test';

test.describe('Listen flow (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login first
    const email = `listen-e2e-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /register|create/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('navigates to listen and shows content input', async ({ page }) => {
    await page.getByRole('link', { name: /listen|new|create text/i }).first().click();

    await expect(page).toHaveURL(/listen/);
    await expect(page.getByPlaceholder(/paste|type|content/i)).toBeVisible();
  });

  test('can paste text and start playback', async ({ page }) => {
    await page.goto('/listen');

    const textarea = page.getByPlaceholder(/paste|type|content/i);
    await textarea.fill('This is a sample text for the learning companion. It has enough words to test the playback.');

    await page.getByRole('button', { name: /play/i }).click();

    // Button changes to Pause when playing
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible({ timeout: 5000 });
  });

  test('stats link works', async ({ page }) => {
    await page.goto('/listen');

    await page.getByRole('link', { name: /stats/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/retention|total quizzes/i).first()).toBeVisible();
  });
});
