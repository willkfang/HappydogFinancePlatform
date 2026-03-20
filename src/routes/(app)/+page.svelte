<script lang="ts">
	import AppShell from '$components/app/AppShell.svelte';
	import DashboardOverview from '$features/dashboard/DashboardOverview.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AppShell title="Overview">
	<DashboardOverview
		configured={data.configured}
		summary={data.summary}
		transactions={data.transactions}
	/>
</AppShell>
