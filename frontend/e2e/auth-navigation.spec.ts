import { test, expect } from '@playwright/test';

test('landing page navigates to login form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await page.getByRole('link', { name: 'Sign In' }).click();

  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  await expect(page.getByPlaceholder('Email address')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
