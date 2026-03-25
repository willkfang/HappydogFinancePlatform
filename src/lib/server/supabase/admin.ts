import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function isSupabaseAdminConfigured() {
	return Boolean(process.env.PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseAdminClient() {
	if (!isSupabaseAdminConfigured()) {
		return null;
	}

	return createClient<Database>(
		process.env.PUBLIC_SUPABASE_URL ?? '',
		process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		}
	);
}
