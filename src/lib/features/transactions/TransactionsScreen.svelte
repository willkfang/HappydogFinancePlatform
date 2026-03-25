<script lang="ts">
	import type { TransactionRecord } from '$domain/transactions/transaction.types';
	import * as Card from '$ui/card';
	import Separator from '$ui/separator/separator.svelte';

	let {
		configured,
		transactions
	}: {
		configured: boolean;
		transactions: TransactionRecord[];
	} = $props();
</script>

<Card.Root class="border-none bg-muted/45 shadow-none">
	<Card.Header>
		<Card.Title>Transactions</Card.Title>
		<Card.Description>
			Review, search, and fix the latest entries without dropping into raw database thinking.
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if transactions.length === 0}
			<div class="rounded-xl border border-dashed bg-background px-4 py-6">
				<p class="font-medium">No transactions to review</p>
				<p class="mt-2 text-sm text-muted-foreground">
					{#if configured}
						Save a transaction and it will appear here immediately for review.
					{:else}
						Run the Supabase migrations and configure the environment to load real transaction rows.
					{/if}
				</p>
			</div>
		{:else}
			{#each transactions as transaction, index (transaction.id)}
				<div class="grid gap-2 md:grid-cols-[120px_minmax(0,1fr)_140px_120px] md:items-center">
					<p class="text-sm text-muted-foreground">{transaction.date}</p>
					<div>
						<p class="font-medium">
							{transaction.subtypeName || transaction.rawMerchantName || 'Untitled transaction'}
						</p>
						<p class="text-sm text-muted-foreground">
							{transaction.categoryName || 'Uncategorized'} • {transaction.paymentMethodName || 'No payment method'} • {transaction.expensorName || 'No expensor'}
						</p>
						<p class="text-sm text-muted-foreground">
							{transaction.accountName || 'No account'} • {transaction.rawMerchantName || transaction.merchantName || 'No merchant'}
						</p>
					</div>
					<p class="text-sm capitalize">{transaction.status}</p>
					<p class="text-right font-semibold">${transaction.amount.toFixed(2)}</p>
				</div>
				{#if index < transactions.length - 1}
					<Separator />
				{/if}
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
