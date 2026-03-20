import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createTransactionRepository } from '$server/transactions';
import {
	createTransaction,
	getQuickAddReferenceData,
	normalizeQuickAddDefaults
} from '$server/transactions/transaction.service';
import { isSupabaseConfigured } from '$server/supabase/config';

export const load: PageServerLoad = async ({ locals }) => {
	const repository = createTransactionRepository(locals.supabase);

	return {
		configured: isSupabaseConfigured(),
		defaults: normalizeQuickAddDefaults(),
		referenceData: await getQuickAddReferenceData(repository)
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const repository = createTransactionRepository(locals.supabase);
		const formData = Object.fromEntries(await request.formData());

		if (!isSupabaseConfigured()) {
			return fail(503, {
				message: 'Supabase is not configured yet. Add env values before saving transactions.',
				values: normalizeQuickAddDefaults(formData)
			});
		}

		const result = await createTransaction(repository, formData);

		if (!result.ok) {
			const status = result.errors.form?.length ? 403 : 400;
			return fail(status, {
				status,
				message:
					status === 403
						? 'Your account is missing household access.'
						: 'Please correct the highlighted fields.',
				errors: result.errors,
				values: normalizeQuickAddDefaults(formData)
			});
		}

		return {
			message: 'Transaction saved.',
			values: normalizeQuickAddDefaults()
		};
	}
};
