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
	subtypeName: z.string().trim().max(120).optional().default(''),
	accountName: z.string().trim().max(120).optional().default(''),
	merchantName: z.string().trim().max(120).optional().default(''),
	rawMerchantName: z.string().trim().max(160).optional().default(''),
	paymentMethodName: z.string().trim().max(120).optional().default(''),
	categoryName: z.string().trim().max(120).optional().default(''),
	expensorName: z.string().trim().max(40).optional().default('Shared'),
	note: z.string().trim().max(240).optional().default(''),
	legacySourceId: z.string().trim().max(60).optional().nullable(),
	status: transactionStatusSchema.optional().default('review')
});

export type QuickAddTransactionInput = z.infer<typeof quickAddTransactionSchema>;
