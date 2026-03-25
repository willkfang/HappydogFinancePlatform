import type { PageServerLoad } from './$types';
import { createTransactionRepository } from '$server/transactions';
import { getDashboardSummary, getTransactions } from '$server/transactions/transaction.service';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: PageServerLoad = async ({ locals }) => {
	const repository = createTransactionRepository(locals);

	return {
		configured: isSupabaseConfigured(),
		summary: await getDashboardSummary(repository),
		transactions: await getTransactions(repository)
	};
};
