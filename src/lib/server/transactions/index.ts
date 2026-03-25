import { createEmptyTransactionRepository } from './transaction.repository.memory';
import { createSupabaseTransactionRepository } from './transaction.repository.supabase';
import { createSupabaseAdminClient } from '$server/supabase/admin';

export function createTransactionRepository(locals: Pick<App.Locals, 'supabase' | 'user'>) {
	if (!locals.supabase || !locals.user) {
		return createEmptyTransactionRepository();
	}

	const adminClient = createSupabaseAdminClient();

	return createSupabaseTransactionRepository(adminClient ?? locals.supabase, locals.user.id);
}
