import type { PageServerLoad } from './$types';
import { createTransactionRepository } from '$server/transactions';
import { getTransactions } from '$server/transactions/transaction.service';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: PageServerLoad = async ({ locals }) => {
	const repository = createTransactionRepository(locals.supabase);

	return {
		configured: isSupabaseConfigured(),
		transactions: await getTransactions(repository)
	};
};
