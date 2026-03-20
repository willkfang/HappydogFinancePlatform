import { env } from '$env/dynamic/public';

export function isSupabaseConfigured() {
	return Boolean(env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_ANON_KEY);
}
