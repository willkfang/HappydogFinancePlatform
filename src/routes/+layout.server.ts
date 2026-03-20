import type { LayoutServerLoad } from './$types';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: LayoutServerLoad = async ({ locals }) => ({
	configured: isSupabaseConfigured(),
	user: locals.user
});
