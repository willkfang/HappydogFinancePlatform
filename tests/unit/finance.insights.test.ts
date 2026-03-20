import { describe, expect, it } from 'vitest';
import {
	buildFinanceInsights,
	classifyTransaction
} from '../../src/lib/domain/finance/finance.insights';
import type { TransactionRecord } from '../../src/lib/domain/transactions/transaction.types';
import { makeTransactionRecord } from './transaction.fixture';

const fixture: TransactionRecord[] = [
	makeTransactionRecord({
		id: '1',
		date: '2026-03-01',
		amount: 5000,
		type: 'income',
		subtypeName: 'Salary',
		paymentMethodName: 'W Chase Checking',
		categoryName: 'Salary',
		expensorName: 'Shared',
		note: '',
		status: 'complete',
		legacySourceId: null,
		createdBy: null
	}),
	makeTransactionRecord({
		id: '2',
		date: '2026-03-02',
		amount: 1450,
		type: 'income',
		subtypeName: '929 Kirts',
		paymentMethodName: 'Venmo',
		categoryName: 'Rental Income',
		expensorName: 'Shared',
		note: '',
		status: 'complete',
		legacySourceId: null,
		createdBy: null
	}),
	makeTransactionRecord({
		id: '3',
		date: '2026-03-03',
		amount: 350,
		type: 'expense',
		subtypeName: 'Personal',
		paymentMethodName: 'Chase Joint Checking',
		categoryName: 'Groceries',
		expensorName: 'Shared',
		note: '',
		status: 'review',
		legacySourceId: null,
		createdBy: null
	}),
	makeTransactionRecord({
		id: '4',
		date: '2026-03-04',
		amount: 220,
		type: 'expense',
		subtypeName: '929 Kirts',
		paymentMethodName: 'Capital One Venture',
		categoryName: '929 Kirts',
		expensorName: 'Shared',
		note: '',
		status: 'complete',
		legacySourceId: null,
		createdBy: null
	})
];

describe('classifyTransaction', () => {
	it('identifies rental transactions and essentiality', () => {
		const classified = classifyTransaction(fixture[3]);

		expect(classified.scope).toBe('rental');
		expect(classified.propertyName).toBe('929 Kirts');
		expect(classified.essentiality).toBe('essential');
	});
});

describe('buildFinanceInsights', () => {
	it('builds health, budget, cashflow, and rental summaries', () => {
		const insights = buildFinanceInsights(fixture);

		expect(insights.health.dataTrust.reviewCount).toBe(1);
		expect(insights.cashflowViews).toHaveLength(3);
		expect(insights.rentalProperties[0]?.propertyName).toBe('929 Kirts');
		expect(insights.budgetVariances.some((item) => item.categoryName === 'Groceries')).toBe(true);
		expect(insights.health.rentalAdjustedNetCashflow).toBeGreaterThan(0);
	});
});
