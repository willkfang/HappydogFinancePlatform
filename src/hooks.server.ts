import type { Handle } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$server/supabase/server';
import { isSupabaseConfigured } from '$server/supabase/config';

export const handle: Handle = async ({ event, resolve }) => {
	if (!isSupabaseConfigured()) {
		event.locals.supabase = null;
		event.locals.session = null;
		event.locals.user = null;
		return resolve(event);
	}

	const supabase = createSupabaseServerClient(event.cookies);
	event.locals.supabase = supabase;

	const [
		{
			data: { session }
		},
		{
			data: { user }
		}
	] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

	event.locals.session = session;
	event.locals.user = user;

	return resolve(event);
};
