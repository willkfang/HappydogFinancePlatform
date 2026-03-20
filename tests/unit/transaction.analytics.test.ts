import { describe, expect, it } from 'vitest';
import { buildDashboardAnalytics } from '../../src/lib/domain/transactions/transaction.analytics';
import type { TransactionRecord } from '../../src/lib/domain/transactions/transaction.types';
import { makeTransactionRecord } from './transaction.fixture';

const fixture: TransactionRecord[] = [
	makeTransactionRecord({
		id: 'txn_1',
		date: '2026-03-10',
		amount: 1450,
		type: 'income',
		subtypeName: '929 Kirts',
		paymentMethodName: 'Venmo',
		categoryName: 'Rental Income',
		expensorName: 'Shared',
		note: '',
		status: 'complete',
		legacySourceId: '1775',
		createdBy: 'user_1'
	}),
	makeTransactionRecord({
		id: 'txn_2',
		date: '2026-03-11',
		amount: 210,
		type: 'expense',
		subtypeName: 'Personal',
		paymentMethodName: 'Chase Sapphire Reserve',
		categoryName: 'Groceries',
		expensorName: 'Shared',
		note: '',
		status: 'review',
		legacySourceId: null,
		createdBy: 'user_1'
	}),
	makeTransactionRecord({
		id: 'txn_3',
		date: '2026-03-12',
		amount: 78,
		type: 'expense',
		subtypeName: 'Personal',
		paymentMethodName: 'Amazon Visa',
		categoryName: 'Dog',
		expensorName: 'J',
		note: '',
		status: 'complete',
		legacySourceId: null,
		createdBy: 'user_1'
	}),
	makeTransactionRecord({
		id: 'txn_4',
		date: '2026-03-13',
		amount: 125,
		type: 'expense',
		subtypeName: 'Personal',
		paymentMethodName: 'Costco Citi',
		categoryName: 'Groceries',
		expensorName: 'Shared',
		note: '',
		status: 'complete',
		legacySourceId: null,
		createdBy: 'user_1'
	})
];

describe('buildDashboardAnalytics', () => {
	it('builds useful rollups from live transactions', () => {
		const analytics = buildDashboardAnalytics(fixture);

		expect(analytics.netCashflow).toBe(1037);
		expect(analytics.averageExpense).toBeCloseTo(137.67, 2);
		expect(analytics.topExpenseCategories[0]).toEqual({
			name: 'Groceries',
			amount: 335,
			count: 2
		});
		expect(analytics.expenseByExpensor[0]).toEqual({
			name: 'Shared',
			amount: 335
		});
		expect(analytics.reviewQueue).toHaveLength(1);
		expect(analytics.recentIncome).toHaveLength(1);
	});
});
