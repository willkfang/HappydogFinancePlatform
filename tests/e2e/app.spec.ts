import { expect, test } from '@playwright/test';

test('navigation renders the core app surfaces', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

	await page.goto('/quick-add');
	await expect(page.getByRole('heading', { name: 'Quick Add' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save transaction' })).toBeDisabled();

	await page.goto('/transactions');
	await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();

	await page.goto('/admin');
	await expect(page.getByRole('heading', { name: 'Admin Grid' })).toBeVisible();

	await page.goto('/reports');
	await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();

	await page.goto('/planning');
	await expect(page.getByRole('heading', { name: 'Planning' })).toBeVisible();
});

test('login page renders', async ({ page }) => {
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
