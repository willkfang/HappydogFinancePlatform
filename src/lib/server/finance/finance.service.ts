import { buildFinanceInsights } from '$domain/finance/finance.insights';
import { createRetirementPlannerModel } from '$domain/finance/retirement';
import type { TransactionRepository } from '$server/transactions/transaction.repository';

export async function getFinanceInsights(repository: TransactionRepository) {
	const transactions = await repository.listTransactions();
	return buildFinanceInsights(transactions);
}

export async function getRetirementPlanner(repository: TransactionRepository) {
	const insights = await getFinanceInsights(repository);
	return createRetirementPlannerModel(insights);
}
