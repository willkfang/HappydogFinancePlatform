import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Cookies } from '@sveltejs/kit';
import type { Database } from './database.types';

export function createSupabaseServerClient(cookies: Cookies) {
	return createServerClient<Database>(
		env.PUBLIC_SUPABASE_URL ?? '',
		env.PUBLIC_SUPABASE_ANON_KEY ?? '',
		{
			cookies: {
				getAll() {
					return cookies.getAll();
				},
				setAll(cookieList) {
					for (const cookie of cookieList) {
						cookies.set(cookie.name, cookie.value, {
							...cookie.options,
							path: cookie.options.path ?? '/'
						});
					}
				}
			}
		}
	);
}
