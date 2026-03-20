import type { TransactionRecord } from './transaction.types';

export type DashboardAnalytics = {
	netCashflow: number;
	averageExpense: number;
	topExpenseCategories: Array<{ name: string; amount: number; count: number }>;
	expenseByExpensor: Array<{ name: string; amount: number }>;
	reviewQueue: TransactionRecord[];
	recentIncome: TransactionRecord[];
};

export function buildDashboardAnalytics(
	transactions: TransactionRecord[],
	reviewLimit = 5
): DashboardAnalytics {
	const expenses = transactions.filter((transaction) => transaction.type === 'expense');
	const income = transactions.filter((transaction) => transaction.type === 'income');
	const reviewQueue = transactions
		.filter((transaction) => transaction.status === 'review')
		.slice(0, reviewLimit);

	const categoryTotals = new Map<string, { amount: number; count: number }>();
	for (const transaction of expenses) {
		const current = categoryTotals.get(transaction.categoryName) ?? { amount: 0, count: 0 };
		current.amount += transaction.amount;
		current.count += 1;
		categoryTotals.set(transaction.categoryName, current);
	}

	const expensorTotals = new Map<string, number>();
	for (const transaction of expenses) {
		expensorTotals.set(
			transaction.expensorName,
			(expensorTotals.get(transaction.expensorName) ?? 0) + transaction.amount
		);
	}

	return {
		netCashflow:
			income.reduce((sum, transaction) => sum + transaction.amount, 0) -
			expenses.reduce((sum, transaction) => sum + transaction.amount, 0),
		averageExpense:
			expenses.length === 0
				? 0
				: expenses.reduce((sum, transaction) => sum + transaction.amount, 0) / expenses.length,
		topExpenseCategories: Array.from(categoryTotals.entries())
			.map(([name, metrics]) => ({ name, amount: metrics.amount, count: metrics.count }))
			.sort((left, right) => right.amount - left.amount)
			.slice(0, 5),
		expenseByExpensor: Array.from(expensorTotals.entries())
			.map(([name, amount]) => ({ name, amount }))
			.sort((left, right) => right.amount - left.amount),
		reviewQueue,
		recentIncome: income.slice(0, 3)
	};
}
