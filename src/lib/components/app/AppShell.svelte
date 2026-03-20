<script lang="ts">
	import AppNav from '$components/app/AppNav.svelte';

	let {
		title,
		eyebrow = 'Happy Dog Finance',
		children
	} = $props<{
		title: string;
		eyebrow?: string;
		children: import('svelte').Snippet;
	}>();
</script>

<div class="mx-auto min-h-screen max-w-7xl px-4 py-4 md:px-6 md:py-6">
	<div class="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
		<aside class="rounded-[1.75rem] border bg-card/85 p-4 backdrop-blur md:p-5">
			<div class="mb-6">
				<p class="text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
					{eyebrow}
				</p>
				<h1 class="mt-2 text-2xl font-semibold tracking-tight">Household Ledger</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					Fast capture, clean correction, trustworthy reports.
				</p>
			</div>
			<AppNav />
		</aside>

		<main class="rounded-[1.75rem] border bg-card/90 p-4 shadow-sm backdrop-blur md:p-6">
			<header class="mb-6 flex flex-col gap-2 border-b pb-4">
				<p class="text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
					{eyebrow}
				</p>
				<h2 class="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
			</header>
			{@render children()}
		</main>
	</div>
</div>
