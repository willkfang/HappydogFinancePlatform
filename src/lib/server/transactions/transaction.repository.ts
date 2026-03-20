import type {
	DashboardSummary,
	TransactionRecord,
	TransactionReferenceData
} from '$domain/transactions/transaction.types';
import type { QuickAddTransactionInput } from '$domain/transactions/transaction.schema';

export type TransactionRepository = {
	getReferenceData(): Promise<TransactionReferenceData>;
	listTransactions(): Promise<TransactionRecord[]>;
	getDashboardSummary(): Promise<DashboardSummary>;
	createTransaction(input: QuickAddTransactionInput): Promise<TransactionRecord>;
};
