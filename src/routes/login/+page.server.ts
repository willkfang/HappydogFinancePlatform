import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { signInWithPassword } from '$server/auth/auth.service';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	if (isSupabaseConfigured() && locals.user) {
		throw redirect(303, redirectTo);
	}

	return {
		redirectTo
	};
};

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		if (!isSupabaseConfigured() || !locals.supabase) {
			return fail(503, {
				status: 503,
				message: 'Supabase auth is not configured yet.',
				errors: {},
				values: { email: '', password: '' }
			});
		}

		const formData = Object.fromEntries(await request.formData());
		const result = await signInWithPassword(locals.supabase, formData);

		if (!result.ok) {
			return fail(400, {
				status: 400,
				message: result.errors.form?.[0] ?? 'Enter a valid email and password.',
				errors: result.errors,
				values: {
					email: String(formData.email ?? ''),
					password: ''
				}
			});
		}

		throw redirect(303, String(formData.redirectTo ?? url.searchParams.get('redirectTo') ?? '/'));
	}
};
