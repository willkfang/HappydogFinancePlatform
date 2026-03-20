// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$server/supabase/database.types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database> | null;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			configured: boolean;
			user: User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
