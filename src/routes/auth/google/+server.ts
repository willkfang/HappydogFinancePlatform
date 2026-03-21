import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isSupabaseConfigured } from '$server/supabase/config';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!isSupabaseConfigured() || !locals.supabase) {
		throw redirect(303, '/login?reason=oauth-unavailable');
	}

	const next = url.searchParams.get('next') ?? '/';
	const safeNext = next.startsWith('/') ? next : '/';
	const redirectTo = new URL('/auth/callback', url);
	redirectTo.searchParams.set('next', safeNext);

	const { data, error } = await locals.supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: redirectTo.toString()
		}
	});

	if (error || !data.url) {
		throw redirect(303, '/login?reason=oauth-unavailable');
	}

	throw redirect(303, data.url);
};
