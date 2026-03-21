import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isSupabaseConfigured } from '$server/supabase/config';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!isSupabaseConfigured() || !locals.supabase) {
		throw redirect(303, '/login?reason=oauth-unavailable');
	}

	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';
	const safeNext = next.startsWith('/') ? next : '/';

	if (!code) {
		throw error(400, 'No authorization code provided');
	}

	const { error: exchangeError } = await locals.supabase.auth.exchangeCodeForSession(code);

	if (exchangeError) {
		throw redirect(303, '/login?reason=auth-callback');
	}

	throw redirect(303, safeNext);
};
