import { loginSchema } from '$domain/auth/login.schema';
import { createSupabaseAdminClient } from '$server/supabase/admin';

type AuthFormErrors = {
	email?: string[];
	password?: string[];
	form?: string[];
};

function formatError(error: unknown) {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message
		};
	}

	if (typeof error === 'object' && error !== null) {
		return error;
	}

	return {
		message: String(error)
	};
}

function getAttemptEmail(input: Record<string, FormDataEntryValue | string | undefined>) {
	const rawEmail = input.email;

	if (typeof rawEmail !== 'string') {
		return null;
	}

	return rawEmail.trim().toLowerCase();
}

export async function hasHouseholdAccess(
	supabase: NonNullable<App.Locals['supabase']>,
	userId: string
) {
	const adminClient = createSupabaseAdminClient();
	const client = adminClient ?? supabase;

	const { data, error } = await client
		.from('household_users')
		.select('household_id')
		.eq('user_id', userId)
		.limit(1)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return Boolean(data?.household_id);
}

export async function signInWithPassword(
	supabase: NonNullable<App.Locals['supabase']>,
	input: Record<string, FormDataEntryValue | string | undefined>
) {
	const attemptEmail = getAttemptEmail(input);
	const parsed = loginSchema.safeParse(input);

	if (!parsed.success) {
		console.warn('[auth] Password login validation failed', {
			email: attemptEmail,
			fieldErrors: parsed.error.flatten().fieldErrors
		});

		return {
			ok: false as const,
			errors: parsed.error.flatten().fieldErrors as AuthFormErrors
		};
	}

	const {
		data: { user },
		error
	} = await supabase.auth.signInWithPassword(parsed.data);

	if (error) {
		console.warn('[auth] Supabase password sign-in rejected', {
			email: attemptEmail,
			message: error.message
		});

		return {
			ok: false as const,
			errors: {
				form: [error.message]
			}
		};
	}

	if (!user) {
		console.error('[auth] Supabase password sign-in returned no user', {
			email: attemptEmail
		});

		return {
			ok: false as const,
			errors: {
				form: ['Sign-in completed without a user session. Please try again.']
			}
		};
	}

	let linkedToHousehold = false;

	try {
		linkedToHousehold = await hasHouseholdAccess(supabase, user.id);
	} catch (lookupError) {
		console.error('[auth] Household lookup failed after password sign-in', {
			email: attemptEmail,
			userId: user.id,
			error: formatError(lookupError)
		});

		await supabase.auth.signOut();

		return {
			ok: false as const,
			errors: {
				form: ['Signed in, but household access could not be verified. Please try again.']
			}
		};
	}

	if (!linkedToHousehold) {
		console.warn('[auth] Password sign-in missing household access', {
			email: attemptEmail,
			userId: user.id
		});

		await supabase.auth.signOut();

		return {
			ok: false as const,
			errors: {
				form: ['This account is not linked to a household yet. Create the household mapping first.']
			}
		};
	}

	console.info('[auth] Password sign-in succeeded', {
		email: attemptEmail,
		userId: user.id
	});

	return {
		ok: true as const
	};
}
