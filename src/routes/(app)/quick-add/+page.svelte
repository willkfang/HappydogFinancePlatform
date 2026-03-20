<script lang="ts">
	import AppShell from '$components/app/AppShell.svelte';
	import QuickAddScreen from '$features/quick-add/QuickAddScreen.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData | null } = $props();
</script>

<AppShell title="Quick Add">
	<QuickAddScreen
		configured={data.configured}
		referenceData={data.referenceData}
		defaults={data.defaults}
		{form}
	/>
</AppShell>
