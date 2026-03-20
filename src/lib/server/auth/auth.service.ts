import { loginSchema } from '$domain/auth/login.schema';

type AuthFormErrors = {
	email?: string[];
	password?: string[];
	form?: string[];
};

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

	const { error } = await supabase.auth.signInWithPassword(parsed.data);

	if (error) {
		return {
			ok: false as const,
			errors: {
				form: [error.message]
			}
		};
	}

	return {
		ok: true as const
	};
}
