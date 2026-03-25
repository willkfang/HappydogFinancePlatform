import { expect, test } from '@playwright/test';
import { ensureSupabaseE2EFixture } from './support/supabase-fixtures';

let credentials: Awaited<ReturnType<typeof ensureSupabaseE2EFixture>>;

test.beforeAll(async () => {
	credentials = await ensureSupabaseE2EFixture();
});

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

test('mapped user can sign in and reach the dashboard', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill(credentials.email);
	await page.getByLabel('Password').fill(credentials.password);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
	await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
});

test('mapped user can save a real quick add transaction', async ({ page }) => {
	const merchantLabel = `Playwright Merchant ${Date.now()}`;

	await page.goto('/login?redirectTo=%2Fquick-add');
	await page.getByLabel('Email').fill(credentials.email);
	await page.getByLabel('Password').fill(credentials.password);
	await page.getByRole('button', { name: 'Sign in' }).click();

	await expect(page).toHaveURL(/\/quick-add$/);
	await page.getByLabel('Amount').fill('12.34');
	await page.getByLabel('Subtype').fill('Personal');
	await page.getByLabel('Account').fill('Chase Joint Checking');
	await page.getByLabel('Merchant').fill(merchantLabel);
	await page.getByLabel('Payment Method').fill('Chase Joint Checking');
	await page.getByLabel('Category').fill('Groceries');
	await page.getByLabel('Expensor').fill('Shared');
	await page.getByLabel('Note').fill('Playwright quick add smoke test');
	await page.getByRole('button', { name: 'Save transaction' }).click();

	await expect(page.getByText('Transaction saved.')).toBeVisible();

	await page.goto('/transactions');
	await expect(page.getByText('Personal')).toBeVisible();
	await expect(page.getByText('$12.34')).toBeVisible();
});
