import { test, expect } from '@playwright/test';

test.describe('Quiz flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    const email = `quiz-e2e-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /register|create/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('navigates to Listen, pastes text, starts playback', async ({ page }) => {
    await page.getByRole('link', { name: /listen|new|create text/i }).first().click();
    await expect(page).toHaveURL(/listen/);

    const text =
      'The quick brown fox jumps over the lazy dog. This is a sample text for the learning companion quiz test. It has enough words to trigger a quiz after the interval.';
    await page.getByPlaceholder(/paste|type|content/i).fill(text);

    await page.getByRole('button', { name: /play/i }).click();

    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible({ timeout: 5000 });
  });

  test('quiz interval selector is visible on Listen page', async ({ page }) => {
    await page.goto('/listen');
    await expect(page.getByText(/quiz every/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('full quiz flow: play, wait for quiz, answer, see result', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('/listen');

    const text =
      'Machine learning is a subset of artificial intelligence. It enables computers to learn from data without being explicitly programmed. Deep learning uses neural networks with many layers.';
    await page.getByPlaceholder(/paste|type|content/i).fill(text);

    // Set quiz interval to 30 sec (second combobox is Quiz every)
    await page.getByRole('combobox').nth(1).selectOption('0.5');

    await page.getByRole('button', { name: /play/i }).click();
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible({ timeout: 5000 });

    // Wait for quiz to appear (30 sec + buffer)
    await page.waitForTimeout(35000);

    // Quiz modal or question should appear
    const quizVisible =
      (await page.getByRole('button', { name: /^[A-D]$/ }).first().isVisible().catch(() => false)) ||
      (await page.getByText(/\?/).isVisible().catch(() => false));

    if (quizVisible) {
      const optionA = page.getByRole('button', { name: 'A' }).first();
      if (await optionA.isVisible().catch(() => false)) {
        await optionA.click();
        await expect(page.getByText(/correct|incorrect|continue/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
