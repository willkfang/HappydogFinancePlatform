import { createEmptyTransactionRepository } from './transaction.repository.memory';
import { createSupabaseTransactionRepository } from './transaction.repository.supabase';

export function createTransactionRepository(supabase: App.Locals['supabase']) {
	if (!supabase) {
		return createEmptyTransactionRepository();
	}

	return createSupabaseTransactionRepository(supabase);
}
