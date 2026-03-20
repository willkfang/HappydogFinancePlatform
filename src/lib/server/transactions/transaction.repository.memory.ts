import type {
	DashboardSummary,
	TransactionRecord,
	TransactionReferenceData
} from '$domain/transactions/transaction.types';
import type { QuickAddTransactionInput } from '$domain/transactions/transaction.schema';
import type { TransactionRepository } from './transaction.repository';

export function createEmptyTransactionRepository(): TransactionRepository {
	return {
		async getReferenceData(): Promise<TransactionReferenceData> {
			return {
				accounts: [],
				subtypes: [],
				paymentMethods: [],
				categories: [],
				expensors: []
			};
		},
		async listTransactions(): Promise<TransactionRecord[]> {
			return [];
		},
		async getDashboardSummary(): Promise<DashboardSummary> {
			return {
				transactionCount: 0,
				reviewCount: 0,
				totalExpenseAmount: 0,
				totalIncomeAmount: 0
			};
		},
		async createTransaction(input: QuickAddTransactionInput): Promise<TransactionRecord> {
			void input;
			throw new Error('Supabase is not configured yet.');
		}
	};
}
