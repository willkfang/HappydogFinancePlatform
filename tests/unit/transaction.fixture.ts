import type { TransactionRecord } from '../../src/lib/domain/transactions/transaction.types';

export function makeTransactionRecord(
	overrides: Partial<TransactionRecord> & Pick<TransactionRecord, 'id'>
): TransactionRecord {
	return {
		id: overrides.id,
		date: overrides.date ?? '2026-03-01',
		amount: overrides.amount ?? 0,
		type: overrides.type ?? 'expense',
		subtypeName: overrides.subtypeName ?? '',
		accountName: overrides.accountName ?? '',
		merchantName: overrides.merchantName ?? '',
		rawMerchantName: overrides.rawMerchantName ?? '',
		paymentMethodName: overrides.paymentMethodName ?? '',
		categoryName: overrides.categoryName ?? '',
		expensorName: overrides.expensorName ?? 'Shared',
		note: overrides.note ?? '',
		status: overrides.status ?? 'review',
		legacySourceId: overrides.legacySourceId ?? null,
		createdBy: overrides.createdBy ?? null
	};
}
