import { describe, expect, it, vi } from 'vitest';
import {
	createTransaction,
	normalizeQuickAddDefaults
} from '../../src/lib/server/transactions/transaction.service';
import type { TransactionRepository } from '../../src/lib/server/transactions/transaction.repository';

function createRepository(): TransactionRepository {
	return {
		getReferenceData: vi.fn(),
		listTransactions: vi.fn(),
		getDashboardSummary: vi.fn(),
		createTransaction: vi.fn(async (input) => ({
			id: 'txn_1',
			date: input.date,
			amount: input.amount,
			type: input.type,
			subtypeName: input.subtypeName ?? '',
			accountName: input.accountName ?? '',
			merchantName: input.merchantName ?? '',
			rawMerchantName: input.rawMerchantName ?? '',
			paymentMethodName: input.paymentMethodName ?? '',
			categoryName: input.categoryName ?? '',
			expensorName: input.expensorName ?? '',
			note: input.note,
			status: input.status,
			legacySourceId: input.legacySourceId ?? null,
			createdBy: null
		}))
	};
}

describe('createTransaction', () => {
	it('returns validation errors before repository work when the payload is invalid', async () => {
		const repository = createRepository();

		const result = await createTransaction(repository, {
			date: '2019-01-12',
			amount: '',
			type: 'income',
			rawMerchantName: ''
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.amount).toBeDefined();
		}
		expect(repository.createTransaction).not.toHaveBeenCalled();
	});

	it('passes normalized values to the repository for a valid transaction', async () => {
		const repository = createRepository();

		const result = await createTransaction(repository, {
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
			note: 'February rent'
		});

		expect(result.ok).toBe(true);
		expect(repository.createTransaction).toHaveBeenCalledOnce();
	});

	it('normalizes a capture-first payload with optional enrichment omitted', async () => {
		const repository = createRepository();

		const result = await createTransaction(repository, {
			date: '2019-01-12',
			amount: '18.44',
			type: 'expense',
			rawMerchantName: 'Target'
		});

		expect(result.ok).toBe(true);
		expect(repository.createTransaction).toHaveBeenCalledWith(
			expect.objectContaining({
				rawMerchantName: 'Target',
				categoryName: '',
				paymentMethodName: '',
				expensorName: 'Shared'
			})
		);
	});
});

describe('normalizeQuickAddDefaults', () => {
	it('keeps provided values while filling the remaining defaults', () => {
		const defaults = normalizeQuickAddDefaults({
			type: 'income',
			expensorName: 'Shared',
			subtypeName: '929 Kirts',
			accountName: 'Chase Joint Checking'
		});

		expect(defaults.type).toBe('income');
		expect(defaults.expensorName).toBe('Shared');
		expect(defaults.subtypeName).toBe('929 Kirts');
		expect(defaults.accountName).toBe('Chase Joint Checking');
		expect(defaults.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
