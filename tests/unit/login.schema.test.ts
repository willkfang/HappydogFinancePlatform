import { describe, expect, it } from 'vitest';
import { loginSchema } from '../../src/lib/domain/auth/login.schema';

describe('loginSchema', () => {
	it('accepts a valid email and password', () => {
		const parsed = loginSchema.safeParse({
			email: 'user@example.com',
			password: 'correct-horse-battery'
		});

		expect(parsed.success).toBe(true);
	});

	it('rejects malformed credentials', () => {
		const parsed = loginSchema.safeParse({
			email: 'invalid',
			password: 'short'
		});

		expect(parsed.success).toBe(false);
	});
});
