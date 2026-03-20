<script lang="ts">
	import AppShell from '$components/app/AppShell.svelte';
	import Button from '$ui/button/button.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AppShell title="Settings">
	<div class="grid gap-4 md:grid-cols-3">
		<div class="rounded-xl border bg-muted/45 p-4">
			<p class="font-medium">Accounts</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Manage cards, checking, savings, and cash sources.
			</p>
		</div>
		<div class="rounded-xl border bg-muted/45 p-4">
			<p class="font-medium">Categories</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Define the reporting taxonomy once and use it consistently.
			</p>
		</div>
		<div class="rounded-xl border bg-muted/45 p-4">
			<p class="font-medium">Household</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Current signed-in user: {data.user?.email ?? 'None'}.
			</p>
			<form method="POST" action="/logout" class="mt-4">
				<Button type="submit" variant="outline">Sign out</Button>
			</form>
		</div>
	</div>
</AppShell>
