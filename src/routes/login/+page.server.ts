import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { signInWithPassword } from '$server/auth/auth.service';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = url.searchParams.get('redirectTo') || '/';
	const reason = url.searchParams.get('reason') || null;

	if (isSupabaseConfigured() && locals.user) {
		throw redirect(303, redirectTo);
	}

	return {
		redirectTo,
		reason
	};
};

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		if (!isSupabaseConfigured() || !locals.supabase) {
			console.error('[auth] Password login blocked because Supabase is not configured');

			return fail(503, {
				status: 503,
				message: 'Supabase auth is not configured yet.',
				errors: {},
				values: { email: '', password: '' }
			});
		}

		const formData = Object.fromEntries(await request.formData());
		const email = typeof formData.email === 'string' ? formData.email.trim().toLowerCase() : null;

		console.info('[auth] Password login attempt received', {
			email,
			redirectTo: String(formData.redirectTo ?? url.searchParams.get('redirectTo') ?? '/')
		});

		const result = await signInWithPassword(locals.supabase, formData);

		if (!result.ok) {
			console.warn('[auth] Password login attempt failed', {
				email,
				message: result.errors.form?.[0] ?? null,
				fieldErrors: {
					email: result.errors.email ?? [],
					password: result.errors.password ?? []
				}
			});

			return {
				status: 400,
				message: result.errors.form?.[0] ?? 'Enter a valid email and password.',
				errors: result.errors,
				values: {
					email: String(formData.email ?? ''),
					password: ''
				}
			};
		}

		console.info('[auth] Password login redirecting after success', {
			email,
			redirectTo: String(formData.redirectTo ?? url.searchParams.get('redirectTo') ?? '/')
		});

		throw redirect(303, String(formData.redirectTo ?? url.searchParams.get('redirectTo') ?? '/'));
	}
};
