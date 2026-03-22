import { expect, test } from '@playwright/test';

test('navigation renders the core app surfaces', async ({ page }) => {
	await page.goto('/');

	if (page.url().includes('/login')) {
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
		return;
	}

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
	await expect(page.getByRole('link', { name: 'Continue with Google' })).toBeVisible();
});

test('login page explains missing household access', async ({ page }) => {
	await page.goto('/login?reason=household-access');
	await expect(page.getByText('not linked to a household yet')).toBeVisible();
});

test('login form submits and renders validation feedback', async ({ page }) => {
	await page.goto('/login');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByText('Enter a valid email address.')).toBeVisible();
});
