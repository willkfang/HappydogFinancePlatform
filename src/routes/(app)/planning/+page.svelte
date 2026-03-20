<script lang="ts">
	import AppShell from '$components/app/AppShell.svelte';
	import PlanningScreen from '$features/planning/PlanningScreen.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AppShell title="Planning">
	<PlanningScreen configured={data.configured} insights={data.insights} planner={data.planner} />
</AppShell>
