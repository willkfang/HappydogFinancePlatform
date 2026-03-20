import { z } from 'zod';

export const transactionTypeSchema = z.enum(['expense', 'income', 'transfer', 'adjustment']);

export const transactionStatusSchema = z.enum(['draft', 'review', 'complete']);

const parseAmount = (value: unknown) => {
	if (typeof value === 'number') return value;
	if (typeof value !== 'string') return Number.NaN;
	return Number.parseFloat(value.replaceAll('$', '').replaceAll(',', '').trim());
};

export const quickAddTransactionSchema = z.object({
	date: z.iso.date(),
	amount: z.union([z.string(), z.number()]).transform(parseAmount).pipe(z.number().positive()),
	type: transactionTypeSchema,
	subtypeName: z.string().trim().min(1).max(120),
	paymentMethodName: z.string().trim().min(1).max(120),
	categoryName: z.string().trim().min(1).max(120),
	expensorName: z.string().trim().min(1).max(40),
	note: z.string().trim().max(240).optional().default(''),
	legacySourceId: z.string().trim().max(60).optional().nullable(),
	status: transactionStatusSchema.optional().default('review')
});

export type QuickAddTransactionInput = z.infer<typeof quickAddTransactionSchema>;
