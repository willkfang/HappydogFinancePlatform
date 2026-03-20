import { quickAddTransactionSchema } from '$domain/transactions/transaction.schema';
import type { QuickAddTransactionInput } from '$domain/transactions/transaction.schema';
import type { TransactionRepository } from './transaction.repository';

type TransactionFormErrors = Record<string, string[] | undefined> & {
	form?: string[];
};

export async function createTransaction(
	repository: TransactionRepository,
	input: Record<string, FormDataEntryValue | string | undefined>
) {
	const parsed = quickAddTransactionSchema.safeParse(input);

	if (!parsed.success) {
		return {
			ok: false as const,
			errors: parsed.error.flatten().fieldErrors as TransactionFormErrors
		};
	}

	try {
		const transaction = await repository.createTransaction(parsed.data);

		return {
			ok: true as const,
			transaction
		};
	} catch (error) {
		return {
			ok: false as const,
			errors: {
				form: [error instanceof Error ? error.message : 'Unable to save the transaction.']
			} satisfies TransactionFormErrors
		};
	}
}

export async function getQuickAddReferenceData(repository: TransactionRepository) {
	return repository.getReferenceData();
}

export async function getTransactions(repository: TransactionRepository) {
	return repository.listTransactions();
}

export async function getDashboardSummary(repository: TransactionRepository) {
	return repository.getDashboardSummary();
}

export function normalizeQuickAddDefaults(input?: Partial<QuickAddTransactionInput>) {
	return {
		date: input?.date ?? new Date().toISOString().slice(0, 10),
		type: input?.type ?? 'expense',
		subtypeName: input?.subtypeName ?? '',
		accountName: input?.accountName ?? '',
		merchantName: input?.merchantName ?? '',
		rawMerchantName: input?.rawMerchantName ?? '',
		paymentMethodName: input?.paymentMethodName ?? '',
		categoryName: input?.categoryName ?? '',
		expensorName: input?.expensorName ?? 'Shared',
		note: input?.note ?? '',
		amount: input?.amount ?? '',
		legacySourceId: input?.legacySourceId ?? ''
	};
}
