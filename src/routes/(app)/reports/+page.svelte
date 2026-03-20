<script lang="ts">
	import AppShell from '$components/app/AppShell.svelte';
	import ReportsScreen from '$features/reports/ReportsScreen.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AppShell title="Reports">
	<ReportsScreen configured={data.configured} transactions={data.transactions} />
</AppShell>
