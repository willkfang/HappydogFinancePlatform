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
			subtypeName: input.subtypeName,
			paymentMethodName: input.paymentMethodName,
			categoryName: input.categoryName,
			expensorName: input.expensorName,
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
			subtypeName: '',
			paymentMethodName: '',
			categoryName: '',
			expensorName: ''
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.subtypeName).toBeDefined();
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
			paymentMethodName: 'Venmo',
			categoryName: 'Rental Income',
			expensorName: 'Shared',
			legacySourceId: '1775',
			note: 'February rent'
		});

		expect(result.ok).toBe(true);
		expect(repository.createTransaction).toHaveBeenCalledOnce();
	});
});

describe('normalizeQuickAddDefaults', () => {
	it('keeps provided values while filling the remaining defaults', () => {
		const defaults = normalizeQuickAddDefaults({
			type: 'income',
			expensorName: 'Shared',
			subtypeName: '929 Kirts'
		});

		expect(defaults.type).toBe('income');
		expect(defaults.expensorName).toBe('Shared');
		expect(defaults.subtypeName).toBe('929 Kirts');
		expect(defaults.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
