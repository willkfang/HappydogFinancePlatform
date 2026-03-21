import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('Enter a valid email address.').trim(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters.')
		.max(72, 'Password must be 72 characters or fewer.')
});

export type LoginInput = z.infer<typeof loginSchema>;
