import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	DashboardSummary,
	ReferenceOption,
	TransactionRecord,
	TransactionReferenceData
} from '$domain/transactions/transaction.types';
import type { QuickAddTransactionInput } from '$domain/transactions/transaction.schema';
import type { Database } from '$server/supabase/database.types';
import type { TransactionRepository } from './transaction.repository';

type DatabaseClient = SupabaseClient<Database>;

async function getActiveHouseholdId(client: DatabaseClient) {
	const {
		data: { user },
		error: authError
	} = await client.auth.getUser();

	if (authError) throw authError;
	if (!user) throw new Error('You must be signed in to access household data.');

	const { data, error } = await client
		.from('household_users')
		.select('household_id')
		.eq('user_id', user.id)
		.limit(1)
		.maybeSingle();

	if (error) throw error;
	if (!data?.household_id) {
		throw new Error('Your account is not linked to a household yet.');
	}

	return { householdId: data.household_id, userId: user.id };
}

async function listOptions(client: DatabaseClient, table: string): Promise<ReferenceOption[]> {
	const { householdId } = await getActiveHouseholdId(client);

	const { data, error } = await client
		.from(table)
		.select('id, name')
		.eq('household_id', householdId)
		.order('name');

	if (error) throw error;

	return ((data as { id: string; name: string }[] | null) ?? []).map((row) => ({
		id: String(row.id),
		name: String(row.name)
	}));
}

async function resolveReferenceId(client: DatabaseClient, table: string, name: string) {
	const { householdId } = await getActiveHouseholdId(client);

	const { data, error } = await client
		.from(table)
		.select('id')
		.eq('household_id', householdId)
		.eq('name', name)
		.maybeSingle();

	if (error) throw error;
	if (!data) throw new Error(`Missing reference row in ${table} for "${name}".`);

	return String((data as { id: string }).id);
}

export function createSupabaseTransactionRepository(client: DatabaseClient): TransactionRepository {
	return {
		async getReferenceData(): Promise<TransactionReferenceData> {
			const [subtypes, paymentMethods, categories, expensors] = await Promise.all([
				listOptions(client, 'transaction_subtypes'),
				listOptions(client, 'payment_methods'),
				listOptions(client, 'categories'),
				listOptions(client, 'expensors')
			]);

			return { subtypes, paymentMethods, categories, expensors };
		},

		async listTransactions(): Promise<TransactionRecord[]> {
			const { householdId } = await getActiveHouseholdId(client);

			const { data, error } = await client
				.from('transactions')
				.select(
					'id, transaction_date, amount, transaction_type, status, note, legacy_source_id, created_by, transaction_subtypes(name), payment_methods(name), categories(name), expensors(name)'
				)
				.eq('household_id', householdId)
				.order('transaction_date', { ascending: false })
				.limit(50);

			if (error) throw error;

			return (
				(data as
					| {
							id: string;
							transaction_date: string;
							amount: number;
							transaction_type: TransactionRecord['type'];
							status: TransactionRecord['status'];
							note: string | null;
							legacy_source_id: string | null;
							created_by: string | null;
							transaction_subtypes?: { name?: string | null } | null;
							payment_methods?: { name?: string | null } | null;
							categories?: { name?: string | null } | null;
							expensors?: { name?: string | null } | null;
					  }[]
					| null) ?? []
			).map((row) => ({
				id: String(row.id),
				date: String(row.transaction_date),
				amount: Number(row.amount),
				type: row.transaction_type as TransactionRecord['type'],
				subtypeName: String(row.transaction_subtypes?.name ?? ''),
				paymentMethodName: String(row.payment_methods?.name ?? ''),
				categoryName: String(row.categories?.name ?? ''),
				expensorName: String(row.expensors?.name ?? ''),
				note: String(row.note ?? ''),
				status: row.status as TransactionRecord['status'],
				legacySourceId: row.legacy_source_id ? String(row.legacy_source_id) : null,
				createdBy: row.created_by ? String(row.created_by) : null
			}));
		},

		async getDashboardSummary(): Promise<DashboardSummary> {
			const transactions = await this.listTransactions();

			return transactions.reduce<DashboardSummary>(
				(summary, transaction) => {
					summary.transactionCount += 1;
					if (transaction.status === 'review') summary.reviewCount += 1;
					if (transaction.type === 'expense') summary.totalExpenseAmount += transaction.amount;
					if (transaction.type === 'income') summary.totalIncomeAmount += transaction.amount;
					return summary;
				},
				{
					transactionCount: 0,
					reviewCount: 0,
					totalExpenseAmount: 0,
					totalIncomeAmount: 0
				}
			);
		},

		async createTransaction(input: QuickAddTransactionInput): Promise<TransactionRecord> {
			const { householdId, userId } = await getActiveHouseholdId(client);

			const [subtypeId, paymentMethodId, categoryId, expensorId] = await Promise.all([
				resolveReferenceId(client, 'transaction_subtypes', input.subtypeName),
				resolveReferenceId(client, 'payment_methods', input.paymentMethodName),
				resolveReferenceId(client, 'categories', input.categoryName),
				resolveReferenceId(client, 'expensors', input.expensorName)
			]);

			const insertPayload: Record<string, unknown> = {
				household_id: householdId,
				transaction_date: input.date,
				amount: input.amount,
				transaction_type: input.type,
				status: input.status,
				note: input.note,
				legacy_source_id: input.legacySourceId,
				subtype_id: subtypeId,
				payment_method_id: paymentMethodId,
				category_id: categoryId,
				expensor_id: expensorId,
				created_by: userId
			};

			const { data, error } = await client
				.from('transactions')
				.insert(insertPayload as never)
				.select(
					'id, transaction_date, amount, transaction_type, status, note, legacy_source_id, created_by, transaction_subtypes(name), payment_methods(name), categories(name), expensors(name)'
				)
				.single();

			if (error) throw error;

			const row = data as {
				id: string;
				transaction_date: string;
				amount: number;
				transaction_type: TransactionRecord['type'];
				status: TransactionRecord['status'];
				note: string | null;
				legacy_source_id: string | null;
				created_by: string | null;
				transaction_subtypes?: { name?: string | null } | null;
				payment_methods?: { name?: string | null } | null;
				categories?: { name?: string | null } | null;
				expensors?: { name?: string | null } | null;
			};

			return {
				id: String(row.id),
				date: String(row.transaction_date),
				amount: Number(row.amount),
				type: row.transaction_type as TransactionRecord['type'],
				subtypeName: String(row.transaction_subtypes?.name ?? ''),
				paymentMethodName: String(row.payment_methods?.name ?? ''),
				categoryName: String(row.categories?.name ?? ''),
				expensorName: String(row.expensors?.name ?? ''),
				note: String(row.note ?? ''),
				status: row.status as TransactionRecord['status'],
				legacySourceId: row.legacy_source_id ? String(row.legacy_source_id) : null,
				createdBy: row.created_by ? String(row.created_by) : null
			};
		}
	};
}
