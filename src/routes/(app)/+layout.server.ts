import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (isSupabaseConfigured() && !locals.user) {
		const redirectTo = `${url.pathname}${url.search}`;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return {
		configured: isSupabaseConfigured(),
		user: locals.user
	};
};
