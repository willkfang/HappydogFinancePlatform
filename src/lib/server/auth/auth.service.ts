import { loginSchema } from '$domain/auth/login.schema';

type AuthFormErrors = {
	email?: string[];
	password?: string[];
	form?: string[];
};

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
	const { data, error } = await supabase
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

	const linkedToHousehold = await hasHouseholdAccess(supabase, user.id);

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
