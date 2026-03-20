import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$components: path.resolve('./src/lib/components'),
			$ui: path.resolve('./src/lib/components/ui'),
			$hooks: path.resolve('./src/lib/hooks'),
			$server: path.resolve('./src/lib/server'),
			$domain: path.resolve('./src/lib/domain'),
			$features: path.resolve('./src/lib/features')
		}
	},
	test: {
		include: ['tests/unit/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html']
		}
	}
});
