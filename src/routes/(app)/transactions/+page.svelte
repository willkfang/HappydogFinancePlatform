<script lang="ts">
	import AppShell from '$components/app/AppShell.svelte';
	import TransactionsScreen from '$features/transactions/TransactionsScreen.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AppShell title="Transactions">
	<TransactionsScreen configured={data.configured} transactions={data.transactions} />
</AppShell>
