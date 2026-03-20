import { describe, expect, it, vi } from 'vitest';
import { hasHouseholdAccess, signInWithPassword } from '$server/auth/auth.service';

function createSupabaseStub({
	signInError = null,
	userId = 'user-1',
	householdRow = { household_id: 'household-1' } as { household_id: string } | null,
	householdError = null
} = {}) {
	const signOut = vi.fn().mockResolvedValue({ error: null });

	return {
		auth: {
			signInWithPassword: vi.fn().mockResolvedValue({
				data: { user: signInError ? null : { id: userId } },
				error: signInError
			}),
			signOut
		},
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					limit: vi.fn().mockReturnValue({
						maybeSingle: vi.fn().mockResolvedValue({
							data: householdRow,
							error: householdError
						})
					})
				})
			})
		})
	};
}

describe('signInWithPassword', () => {
	it('reports whether a user is linked to a household', async () => {
		const supabase = createSupabaseStub();

		await expect(hasHouseholdAccess(supabase as never, 'user-1')).resolves.toBe(true);
	});

	it('rejects users without household access after Supabase auth succeeds', async () => {
		const supabase = createSupabaseStub({ householdRow: null });

		const result = await signInWithPassword(supabase as never, {
			email: 'user@example.com',
			password: 'password123'
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('Expected failed result');
		expect(result.errors.form?.[0]).toContain('not linked to a household');
		expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
	});

	it('allows users with household access', async () => {
		const supabase = createSupabaseStub();

		const result = await signInWithPassword(supabase as never, {
			email: 'user@example.com',
			password: 'password123'
		});

		expect(result.ok).toBe(true);
		expect(supabase.auth.signOut).not.toHaveBeenCalled();
	});
});
