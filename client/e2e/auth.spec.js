import { test, expect } from '@playwright/test';

test.describe('Auth flow (E2E)', () => {
  const testEmail = `e2e-${Date.now()}@test.com`;
  const testPassword = 'password123';

  test('register, login, and see home', async ({ page }) => {
    await page.goto('/');

    // Go to register
    await page.getByRole('link', { name: /get started|register/i }).first().click();
    await expect(page).toHaveURL(/register/);

    // Register
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder(/password/i).fill(testPassword);
    await page.getByRole('button', { name: /register|create/i }).click();

    // Should redirect to home, see user email
    await expect(page).toHaveURL('/');
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 5000 });

    // Sign out and go to login
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.getByRole('link', { name: /sign in/i }).first().click();

    // Login
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Back to home
    await expect(page).toHaveURL('/');
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 5000 });
  });

  test('shows error on invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('nonexistent@test.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid|failed/i)).toBeVisible({ timeout: 3000 });
  });
});
