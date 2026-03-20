import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { hasHouseholdAccess } from '$server/auth/auth.service';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (isSupabaseConfigured() && !locals.user) {
		const redirectTo = `${url.pathname}${url.search}`;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	if (isSupabaseConfigured() && locals.supabase && locals.user) {
		const linkedToHousehold = await hasHouseholdAccess(locals.supabase, locals.user.id);

		if (!linkedToHousehold) {
			await locals.supabase.auth.signOut();
			const redirectTo = `${url.pathname}${url.search}`;
			throw redirect(
				303,
				`/login?reason=household-access&redirectTo=${encodeURIComponent(redirectTo)}`
			);
		}
	}

	return {
		configured: isSupabaseConfigured(),
		user: locals.user
	};
};
