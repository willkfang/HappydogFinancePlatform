import { describe, expect, it } from 'vitest';
import { quickAddTransactionSchema } from '../../src/lib/domain/transactions/transaction.schema';

describe('quickAddTransactionSchema', () => {
	it('parses imported spreadsheet-like values into a normalized transaction input', () => {
		const result = quickAddTransactionSchema.parse({
			date: '2019-01-12',
			amount: '$1,450.00',
			type: 'income',
			subtypeName: '929 Kirts',
			accountName: 'Chase Joint Checking',
			rawMerchantName: 'Zelle',
			paymentMethodName: 'Venmo',
			categoryName: 'Rental Income',
			expensorName: 'Shared',
			legacySourceId: '1775',
			note: 'January rent'
		});

		expect(result.amount).toBe(1450);
		expect(result.type).toBe('income');
		expect(result.paymentMethodName).toBe('Venmo');
		expect(result.accountName).toBe('Chase Joint Checking');
		expect(result.rawMerchantName).toBe('Zelle');
		expect(result.legacySourceId).toBe('1775');
	});

	it('allows capture-first transactions with optional enrichment fields omitted', () => {
		const result = quickAddTransactionSchema.parse({
			date: '2019-01-12',
			amount: '18.44',
			type: 'expense',
			rawMerchantName: 'Target'
		});

		expect(result.amount).toBe(18.44);
		expect(result.paymentMethodName).toBe('');
		expect(result.categoryName).toBe('');
		expect(result.expensorName).toBe('Shared');
		expect(result.rawMerchantName).toBe('Target');
	});

	it('rejects missing core capture fields', () => {
		const result = quickAddTransactionSchema.safeParse({
			date: '2019-01-12',
			amount: '',
			type: 'income'
		});

		expect(result.success).toBe(false);
	});
});
