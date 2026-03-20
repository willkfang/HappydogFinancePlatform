import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: {
			$components: 'src/lib/components',
			$ui: 'src/lib/components/ui',
			$hooks: 'src/lib/hooks',
			$server: 'src/lib/server',
			$domain: 'src/lib/domain',
			$features: 'src/lib/features'
		},
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		adapter: adapter()
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
