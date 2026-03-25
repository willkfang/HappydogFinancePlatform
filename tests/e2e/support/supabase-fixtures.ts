import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const FIXTURE_USER = {
	email: 'happydog-e2e@example.com',
	password: 'HappyDogE2E123!'
};

const FIXTURE_HOUSEHOLD = {
	name: 'HappyDog E2E Household'
};

const SEED_VALUES = {
	transaction_subtypes: [
		'2035 Campbell',
		'26057 Hidden Valley',
		'3127 Parker',
		'929 Kirts',
		'DSO',
		'GM',
		'Personal',
		'Wisk'
	],
	payment_methods: [
		'Amazon Visa',
		'Amex Blue Preferred',
		'Capital One Quiksilver',
		'Capital One Venture',
		'Cash',
		'Chase Freedom Unlimited',
		'Chase Joint Checking',
		'Chase Sapphire Reserve',
		'Costco Citi',
		'Delta American Express',
		'J BoA Checking',
		'J BoA Saving',
		'J Huntington Checking',
		'J Huntington Saving',
		'Venmo',
		'W Chase Checking'
	],
	expensors: ['J', 'Shared', 'W'],
	categories: [
		'2035 Campbell',
		'929 Kirts',
		'AAA Membership',
		'Apparel',
		'Appliances',
		'Car Maintenance',
		'Childcare',
		'DeductIble Donation',
		'Dog',
		'Entertainment',
		'Fees',
		'Gasoline',
		'Gifts',
		'Groceries',
		'Health',
		'HOA',
		'Hobby',
		'Home Decor',
		'Home Maintenance',
		'Insurance',
		'Kids',
		'Lease',
		'Misc',
		'Mortgage',
		'Moving',
		'Personal Care',
		'Rental Income',
		'Restaurants',
		'Salary',
		'School',
		'Taxes',
		'Travel',
		'Union Dues',
		'Utilities',
		'Violin'
	],
	accounts: [
		'Amazon Visa',
		'Amex Blue Preferred',
		'Capital One Quiksilver',
		'Capital One Venture',
		'Cash',
		'Chase Freedom Unlimited',
		'Chase Joint Checking',
		'Chase Sapphire Reserve',
		'Costco Citi',
		'Delta American Express',
		'J BoA Checking',
		'J BoA Saving',
		'J Huntington Checking',
		'J Huntington Saving',
		'Venmo',
		'W Chase Checking'
	]
} as const;

let parsedEnvCache: Record<string, string> | null = null;

function readEnvFile() {
	if (parsedEnvCache) {
		return parsedEnvCache;
	}

	parsedEnvCache = Object.fromEntries(
		readFileSync('.env', 'utf8')
			.split(/\r?\n/)
			.map((line: string) => line.trim())
			.filter((line: string) => line && !line.startsWith('#'))
			.map((line: string) => {
				const separatorIndex = line.indexOf('=');
				return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
			})
	);

	return parsedEnvCache;
}

function getEnv(name: string) {
	return process.env[name] ?? readEnvFile()[name];
}

function createAdminClient() {
	const url = getEnv('PUBLIC_SUPABASE_URL');
	const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

	if (!url || !serviceRoleKey) {
		throw new Error('Missing Supabase admin credentials for Playwright fixtures.');
	}

	return createClient(url, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

async function ensureFixtureUser() {
	const admin = createAdminClient();
	const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

	if (error) {
		throw error;
	}

	const existing = data.users.find((user) => user.email?.toLowerCase() === FIXTURE_USER.email);

	if (existing) {
		await admin.auth.admin.updateUserById(existing.id, {
			password: FIXTURE_USER.password,
			email_confirm: true
		});

		return existing.id;
	}

	const { data: created, error: createError } = await admin.auth.admin.createUser({
		email: FIXTURE_USER.email,
		password: FIXTURE_USER.password,
		email_confirm: true
	});

	if (createError || !created.user) {
		throw createError ?? new Error('Unable to create Playwright auth user.');
	}

	return created.user.id;
}

async function ensureFixtureHousehold(userId: string) {
	const admin = createAdminClient();

	const { data: householdRows, error: householdError } = await admin
		.from('households')
		.upsert({ name: FIXTURE_HOUSEHOLD.name }, { onConflict: 'name' })
		.select('id, name')
		.limit(1);

	if (householdError || !householdRows?.[0]) {
		throw householdError ?? new Error('Unable to create Playwright household.');
	}

	const householdId = householdRows[0].id as string;

	const { error: membershipError } = await admin.from('household_users').upsert(
		{
			household_id: householdId,
			user_id: userId,
			role: 'owner'
		},
		{ onConflict: 'household_id,user_id' }
	);

	if (membershipError) {
		throw membershipError;
	}

	for (const [table, values] of Object.entries(SEED_VALUES)) {
		const payload = values.map((name) => ({ household_id: householdId, name }));
		const { error } = await admin.from(table).upsert(payload, { onConflict: 'household_id,name' });

		if (error) {
			throw error;
		}
	}

	return householdId;
}

export async function ensureSupabaseE2EFixture() {
	const userId = await ensureFixtureUser();
	await ensureFixtureHousehold(userId);

	return {
		email: FIXTURE_USER.email,
		password: FIXTURE_USER.password
	};
}
