import type { PageServerLoad } from './$types';
import { getFinanceInsights, getRetirementPlanner } from '$server/finance/finance.service';
import { isSupabaseConfigured } from '$server/supabase/config';
import { createTransactionRepository } from '$server/transactions';

export const load: PageServerLoad = async ({ locals }) => {
	const repository = createTransactionRepository(locals);

	return {
		configured: isSupabaseConfigured(),
		insights: await getFinanceInsights(repository),
		planner: await getRetirementPlanner(repository)
	};
};
