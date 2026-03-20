import { loginSchema } from '$domain/auth/login.schema';

type AuthFormErrors = {
	email?: string[];
	password?: string[];
	form?: string[];
};

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
	const parsed = loginSchema.safeParse(input);

	if (!parsed.success) {
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
		return {
			ok: false as const,
			errors: {
				form: [error.message]
			}
		};
	}

	if (!user) {
		return {
			ok: false as const,
			errors: {
				form: ['Sign-in completed without a user session. Please try again.']
			}
		};
	}

	const linkedToHousehold = await hasHouseholdAccess(supabase, user.id);

	if (!linkedToHousehold) {
		await supabase.auth.signOut();

		return {
			ok: false as const,
			errors: {
				form: ['This account is not linked to a household yet. Create the household mapping first.']
			}
		};
	}

	return {
		ok: true as const
	};
}
