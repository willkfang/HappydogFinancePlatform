import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Database } from './database.types';

let cachedEnvFile: Record<string, string> | null = null;

function readLocalEnvFile() {
	if (cachedEnvFile) {
		return cachedEnvFile;
	}

	const envPath = join(process.cwd(), '.env');

	if (!existsSync(envPath)) {
		cachedEnvFile = {};
		return cachedEnvFile;
	}

	cachedEnvFile = Object.fromEntries(
		readFileSync(envPath, 'utf8')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'))
			.map((line) => {
				const separatorIndex = line.indexOf('=');
				return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
			})
	);

	return cachedEnvFile;
}

function getServerEnv(name: string) {
	return process.env[name] ?? readLocalEnvFile()[name] ?? null;
}

export function isSupabaseAdminConfigured() {
	if (process.env.VITEST) {
		return false;
	}

	return Boolean(getServerEnv('PUBLIC_SUPABASE_URL') && getServerEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function createSupabaseAdminClient() {
	if (!isSupabaseAdminConfigured()) {
		return null;
	}

	return createClient<Database>(
		getServerEnv('PUBLIC_SUPABASE_URL') ?? '',
		getServerEnv('SUPABASE_SERVICE_ROLE_KEY') ?? '',
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		}
	);
}
