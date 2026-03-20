export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment';

export type TransactionStatus = 'draft' | 'review' | 'complete';

export type ReferenceOption = {
	id: string;
	name: string;
};

export type TransactionRecord = {
	id: string;
	date: string;
	amount: number;
	type: TransactionType;
	subtypeName: string;
	paymentMethodName: string;
	categoryName: string;
	expensorName: string;
	note: string;
	status: TransactionStatus;
	legacySourceId: string | null;
	createdBy: string | null;
};

export type TransactionReferenceData = {
	subtypes: ReferenceOption[];
	paymentMethods: ReferenceOption[];
	categories: ReferenceOption[];
	expensors: ReferenceOption[];
};

export type DashboardSummary = {
	transactionCount: number;
	reviewCount: number;
	totalExpenseAmount: number;
	totalIncomeAmount: number;
};
