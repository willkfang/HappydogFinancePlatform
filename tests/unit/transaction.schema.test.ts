import { describe, expect, it } from 'vitest';
import { quickAddTransactionSchema } from '../../src/lib/domain/transactions/transaction.schema';

describe('quickAddTransactionSchema', () => {
	it('parses imported spreadsheet-like values into a normalized transaction input', () => {
		const result = quickAddTransactionSchema.parse({
			date: '2019-01-12',
			amount: '$1,450.00',
			type: 'income',
			subtypeName: '929 Kirts',
			paymentMethodName: 'Venmo',
			categoryName: 'Rental Income',
			expensorName: 'Shared',
			legacySourceId: '1775',
			note: 'January rent'
		});

		expect(result.amount).toBe(1450);
		expect(result.type).toBe('income');
		expect(result.paymentMethodName).toBe('Venmo');
		expect(result.legacySourceId).toBe('1775');
	});

	it('rejects incomplete required fields', () => {
		const result = quickAddTransactionSchema.safeParse({
			date: '2019-01-12',
			amount: '',
			type: 'income',
			subtypeName: '',
			paymentMethodName: '',
			categoryName: '',
			expensorName: ''
		});

		expect(result.success).toBe(false);
	});
});
