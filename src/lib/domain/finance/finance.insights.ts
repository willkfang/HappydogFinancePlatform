import {
	CATEGORY_ESSENTIALITY_MAP,
	CATEGORY_LIFECYCLE_MAP,
	CATEGORY_SCOPE_MAP,
	PROPERTY_NAMES
} from './finance.defaults';
import type {
	BudgetVariance,
	CashflowView,
	CashflowViewMode,
	ClassifiedTransaction,
	Essentiality,
	FinanceInsights,
	FinanceLifecycle,
	FinanceScope,
	FinancialHealthSnapshot,
	MonthlyCashflowPoint,
	RentalPropertySummary
} from './finance.types';
import type { TransactionRecord } from '$domain/transactions/transaction.types';

function round(value: number) {
	return Number(value.toFixed(2));
}

function toMonth(date: string) {
	return date.slice(0, 7);
}

function detectPropertyName(transaction: TransactionRecord) {
	return (
		PROPERTY_NAMES.find(
			(property) =>
				transaction.subtypeName.includes(property) || transaction.categoryName.includes(property)
		) ?? null
	);
}

export function classifyTransaction(transaction: TransactionRecord): ClassifiedTransaction {
	const propertyName = detectPropertyName(transaction);
	const scope: FinanceScope = propertyName
		? 'rental'
		: (CATEGORY_SCOPE_MAP[transaction.categoryName] ??
			(transaction.expensorName === 'Shared' ? 'household' : 'personal'));
	const lifecycle: FinanceLifecycle =
		transaction.type === 'transfer'
			? 'transfer'
			: (CATEGORY_LIFECYCLE_MAP[transaction.categoryName] ?? 'operating');
	const essentiality: Essentiality =
		scope === 'rental'
			? 'essential'
			: (CATEGORY_ESSENTIALITY_MAP[transaction.categoryName] ??
				(scope === 'household' ? 'essential' : 'discretionary'));
	const isUncategorized =
		transaction.categoryName.trim().length === 0 ||
		['Misc', 'Fees'].includes(transaction.categoryName.trim());

	return {
		...transaction,
		scope,
		lifecycle,
		essentiality,
		propertyName,
		isReviewItem: transaction.status === 'review',
		isUncategorized,
		isExcludedFromHouseholdBudget:
			scope === 'rental' ||
			scope === 'personal' ||
			['transfer', 'reimbursement'].includes(lifecycle),
		isAnomalous: false
	};
}

function markAnomalies(transactions: ClassifiedTransaction[]) {
	const expenses = transactions.filter((transaction) => transaction.type === 'expense');
	const averageExpense =
		expenses.length === 0
			? 0
			: expenses.reduce((sum, transaction) => sum + transaction.amount, 0) / expenses.length;

	return transactions.map((transaction) => ({
		...transaction,
		isAnomalous:
			transaction.type === 'expense' &&
			transaction.amount > Math.max(averageExpense * 2, 1000) &&
			transaction.lifecycle !== 'transfer'
	}));
}

function buildMonthlyCashflowPoints(
	transactions: ClassifiedTransaction[],
	filter: (transaction: ClassifiedTransaction) => boolean
): MonthlyCashflowPoint[] {
	const monthMap = new Map<string, MonthlyCashflowPoint>();

	for (const transaction of transactions.filter(filter)) {
		const month = toMonth(transaction.date);
		const current = monthMap.get(month) ?? { month, income: 0, expense: 0, net: 0 };

		if (transaction.type === 'income') current.income += transaction.amount;
		if (transaction.type === 'expense') current.expense += transaction.amount;
		current.net = current.income - current.expense;

		monthMap.set(month, current);
	}

	return Array.from(monthMap.values())
		.sort((left, right) => right.month.localeCompare(left.month))
		.map((point) => ({
			...point,
			income: round(point.income),
			expense: round(point.expense),
			net: round(point.net)
		}));
}

function averageNet(points: MonthlyCashflowPoint[], months: number) {
	if (points.length === 0) return 0;
	const slice = points.slice(0, months);
	return round(slice.reduce((sum, point) => sum + point.net, 0) / slice.length);
}

function sumAmount(
	transactions: ClassifiedTransaction[],
	filter: (transaction: ClassifiedTransaction) => boolean
) {
	return round(
		transactions.filter(filter).reduce((sum, transaction) => sum + transaction.amount, 0)
	);
}

function createCashflowView(
	mode: CashflowViewMode,
	label: string,
	transactions: ClassifiedTransaction[],
	filter: (transaction: ClassifiedTransaction) => boolean
): CashflowView {
	const monthly = buildMonthlyCashflowPoints(transactions, filter);
	const filtered = transactions.filter(filter);
	const drivers = new Map<string, number>();

	for (const transaction of filtered) {
		if (transaction.type !== 'expense') continue;
		drivers.set(
			transaction.categoryName,
			(drivers.get(transaction.categoryName) ?? 0) + transaction.amount
		);
	}

	return {
		mode,
		label,
		monthly,
		incomeTotal: round(
			filtered
				.filter((transaction) => transaction.type === 'income')
				.reduce((sum, transaction) => sum + transaction.amount, 0)
		),
		expenseTotal: round(
			filtered
				.filter((transaction) => transaction.type === 'expense')
				.reduce((sum, transaction) => sum + transaction.amount, 0)
		),
		netTotal: round(
			filtered.reduce((sum, transaction) => {
				if (transaction.type === 'income') return sum + transaction.amount;
				if (transaction.type === 'expense') return sum - transaction.amount;
				return sum;
			}, 0)
		),
		changeDrivers: Array.from(drivers.entries())
			.map(([label, amount]) => ({ label, amount: round(amount) }))
			.sort((left, right) => right.amount - left.amount)
			.slice(0, 5)
	};
}

function buildBudgetVariances(transactions: ClassifiedTransaction[]): BudgetVariance[] {
	const spending = transactions.filter(
		(transaction) =>
			transaction.type === 'expense' &&
			transaction.lifecycle !== 'transfer' &&
			transaction.scope !== 'rental'
	);
	const categories = new Map<
		string,
		{ actual: number; months: Set<string>; scope: FinanceScope; essentiality: Essentiality }
	>();

	for (const transaction of spending) {
		const current = categories.get(transaction.categoryName) ?? {
			actual: 0,
			months: new Set<string>(),
			scope: transaction.scope,
			essentiality: transaction.essentiality
		};
		current.actual += transaction.amount;
		current.months.add(toMonth(transaction.date));
		categories.set(transaction.categoryName, current);
	}

	return Array.from(categories.entries())
		.map(([categoryName, data]) => {
			const monthCount = Math.max(data.months.size, 1);
			const trailingAverage = data.actual / monthCount;
			const annualized = ['Insurance', 'Taxes', 'Travel', 'Gifts', 'Home Maintenance'].includes(
				categoryName
			);
			const target = trailingAverage * (data.essentiality === 'essential' ? 1.05 : 1);
			const variance = trailingAverage - target;

			return {
				categoryName,
				scope: data.scope,
				essentiality: data.essentiality,
				actual: round(trailingAverage),
				target: round(target),
				trailingAverage: round(trailingAverage),
				variance: round(variance),
				annualized,
				alert:
					trailingAverage > target * 1.1 ? 'over' : trailingAverage > target ? 'watch' : 'on-track'
			} satisfies BudgetVariance;
		})
		.sort((left, right) => right.actual - left.actual)
		.slice(0, 8);
}

function buildRentalProperties(transactions: ClassifiedTransaction[]): RentalPropertySummary[] {
	const rentalMap = new Map<string, RentalPropertySummary>();

	for (const transaction of transactions.filter(
		(item) => item.scope === 'rental' && item.propertyName
	)) {
		const propertyName = transaction.propertyName!;
		const current = rentalMap.get(propertyName) ?? {
			propertyName,
			income: 0,
			operatingExpense: 0,
			capitalExpense: 0,
			netCashflow: 0,
			maintenanceReserveTarget: 0
		};

		if (transaction.type === 'income') current.income += transaction.amount;
		if (transaction.type === 'expense' && transaction.lifecycle === 'capital') {
			current.capitalExpense += transaction.amount;
		} else if (transaction.type === 'expense') {
			current.operatingExpense += transaction.amount;
		}

		current.netCashflow = current.income - current.operatingExpense - current.capitalExpense;
		current.maintenanceReserveTarget =
			current.operatingExpense * 0.1 + current.capitalExpense * 0.25;
		rentalMap.set(propertyName, current);
	}

	return Array.from(rentalMap.values())
		.map((item) => ({
			...item,
			income: round(item.income),
			operatingExpense: round(item.operatingExpense),
			capitalExpense: round(item.capitalExpense),
			netCashflow: round(item.netCashflow),
			maintenanceReserveTarget: round(item.maintenanceReserveTarget)
		}))
		.sort((left, right) => right.netCashflow - left.netCashflow);
}

function buildFocusBreakdowns(transactions: ClassifiedTransaction[]) {
	const focusCategories = new Set([
		'Groceries',
		'Restaurants',
		'Home Maintenance',
		'Kids',
		'Travel'
	]);
	const focusMap = new Map<string, { amount: number; count: number }>();

	for (const transaction of transactions.filter(
		(item) => item.type === 'expense' && focusCategories.has(item.categoryName)
	)) {
		const current = focusMap.get(transaction.categoryName) ?? { amount: 0, count: 0 };
		current.amount += transaction.amount;
		current.count += 1;
		focusMap.set(transaction.categoryName, current);
	}

	return Array.from(focusMap.entries())
		.map(([name, data]) => ({ name, amount: round(data.amount), count: data.count }))
		.sort((left, right) => right.amount - left.amount);
}

function buildFinancialHealth(
	transactions: ClassifiedTransaction[],
	cashflowViews: CashflowView[]
): FinancialHealthSnapshot {
	const allView = cashflowViews.find((view) => view.mode === 'all')!;
	const coreView = cashflowViews.find((view) => view.mode === 'core-household')!;
	const lifestyleView = cashflowViews.find((view) => view.mode === 'lifestyle')!;
	const essentialSpend = sumAmount(
		transactions,
		(transaction) => transaction.type === 'expense' && transaction.essentiality === 'essential'
	);
	const discretionarySpend = sumAmount(
		transactions,
		(transaction) => transaction.type === 'expense' && transaction.essentiality === 'discretionary'
	);
	const incomeTotal = allView.incomeTotal || 1;
	const debtPayments = sumAmount(
		transactions,
		(transaction) => transaction.type === 'expense' && transaction.lifecycle.startsWith('debt')
	);

	return {
		currentMonthNetCashflow: allView.monthly[0]?.net ?? 0,
		trailing3MonthNetCashflow: averageNet(allView.monthly, 3),
		trailing12MonthNetCashflow: averageNet(allView.monthly, 12),
		savingsRate: round(Math.max(coreView.netTotal, 0) / incomeTotal),
		fixedCostRatio: round(essentialSpend / incomeTotal),
		essentialSpend,
		discretionarySpend,
		cashRunwayMonths: round(
			(lifestyleView.netTotal + essentialSpend * 2) / Math.max(essentialSpend, 1)
		),
		debtLoadRatio: round(debtPayments / incomeTotal),
		reviewRatio: round(
			transactions.filter((transaction) => transaction.isReviewItem).length /
				Math.max(transactions.length, 1)
		),
		rentalAdjustedNetCashflow: coreView.netTotal,
		dataTrust: {
			reviewCount: transactions.filter((transaction) => transaction.isReviewItem).length,
			uncategorizedCount: transactions.filter((transaction) => transaction.isUncategorized).length,
			excludedCount: transactions.filter((transaction) => transaction.isExcludedFromHouseholdBudget)
				.length,
			transferCount: transactions.filter((transaction) => transaction.lifecycle === 'transfer')
				.length,
			anomalyCount: transactions.filter((transaction) => transaction.isAnomalous).length
		}
	};
}

export function buildFinanceInsights(transactions: TransactionRecord[]): FinanceInsights {
	const classifiedTransactions = markAnomalies(transactions.map(classifyTransaction));
	const cashflowViews = [
		createCashflowView(
			'all',
			'All cashflow',
			classifiedTransactions,
			(transaction) => transaction.lifecycle !== 'transfer'
		),
		createCashflowView(
			'core-household',
			'Core household',
			classifiedTransactions,
			(transaction) =>
				transaction.scope === 'household' &&
				!['transfer', 'reimbursement'].includes(transaction.lifecycle)
		),
		createCashflowView(
			'lifestyle',
			'Lifestyle',
			classifiedTransactions,
			(transaction) =>
				transaction.scope === 'household' &&
				transaction.lifecycle === 'operating' &&
				transaction.type !== 'transfer'
		)
	];

	return {
		classifiedTransactions,
		health: buildFinancialHealth(classifiedTransactions, cashflowViews),
		budgetVariances: buildBudgetVariances(classifiedTransactions),
		cashflowViews,
		rentalProperties: buildRentalProperties(classifiedTransactions),
		focusBreakdowns: buildFocusBreakdowns(classifiedTransactions)
	};
}
