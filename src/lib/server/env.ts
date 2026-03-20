import { z } from 'zod';

const publicEnvSchema = z.object({
	PUBLIC_SUPABASE_URL: z.string().url(),
	PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const privateEnvSchema = z.object({
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional()
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type PrivateEnv = z.infer<typeof privateEnvSchema>;

export function parsePublicEnv(env: Record<string, string | undefined>) {
	return publicEnvSchema.parse(env);
}

export function parsePrivateEnv(env: Record<string, string | undefined>) {
	return privateEnvSchema.parse(env);
}
