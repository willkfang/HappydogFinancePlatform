<script lang="ts">
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Wallet from '@lucide/svelte/icons/wallet';
	import Tags from '@lucide/svelte/icons/tags';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Scale from '@lucide/svelte/icons/scale';
	import * as Card from '$ui/card';
	import Badge from '$ui/badge/badge.svelte';
	import DashboardHealthPanel from '$features/dashboard/DashboardHealthPanel.svelte';
	import { buildFinanceInsights } from '$domain/finance/finance.insights';
	import { buildDashboardAnalytics } from '$domain/transactions/transaction.analytics';
	import type { DashboardSummary, TransactionRecord } from '$domain/transactions/transaction.types';

	let {
		configured,
		summary,
		transactions
	}: {
		configured: boolean;
		summary: DashboardSummary;
		transactions: TransactionRecord[];
	} = $props();

	const stats = $derived([
		{
			label: 'Expense total',
			value: `$${summary.totalExpenseAmount.toFixed(2)}`,
			detail: 'Total tracked expenses',
			icon: Wallet
		},
		{
			label: 'Income total',
			value: `$${summary.totalIncomeAmount.toFixed(2)}`,
			detail: 'Total tracked income',
			icon: TrendingUp
		},
		{
			label: 'Transactions',
			value: String(summary.transactionCount),
			detail: 'Rows currently stored',
			icon: Tags
		},
		{
			label: 'Needs review',
			value: String(summary.reviewCount),
			detail: 'Rows still flagged for review',
			icon: AlertTriangle
		}
	]);

	const analytics = $derived(buildDashboardAnalytics(transactions));
	const insights = $derived(buildFinanceInsights(transactions));
</script>

<div class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
	<section class="grid gap-4">
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each stats as stat (stat.label)}
				<Card.Root class="border-none bg-muted/50 shadow-none">
					<Card.Header class="pb-2">
						<div class="flex items-center justify-between">
							<Card.Description>{stat.label}</Card.Description>
							<stat.icon class="size-4 text-muted-foreground" />
						</div>
						<Card.Title class="text-2xl">{stat.value}</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-muted-foreground">{stat.detail}</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<DashboardHealthPanel {insights} />

		<div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
			<Card.Root class="border-none bg-muted/50 shadow-none">
				<Card.Header>
					<div class="flex items-center justify-between gap-3">
						<div>
							<Card.Title>What matters now</Card.Title>
							<Card.Description
								>Useful rollups from the current transaction history.</Card.Description
							>
						</div>
						<Scale class="size-4 text-muted-foreground" />
					</div>
				</Card.Header>
				<Card.Content class="grid gap-4 md:grid-cols-3">
					<div class="rounded-xl border bg-background p-4">
						<p class="text-sm text-muted-foreground">Net cashflow</p>
						<p class="mt-2 text-2xl font-semibold">${analytics.netCashflow.toFixed(2)}</p>
						<p class="mt-2 text-sm text-muted-foreground">
							Income minus expenses across currently loaded rows.
						</p>
					</div>
					<div class="rounded-xl border bg-background p-4">
						<p class="text-sm text-muted-foreground">Average expense</p>
						<p class="mt-2 text-2xl font-semibold">${analytics.averageExpense.toFixed(2)}</p>
						<p class="mt-2 text-sm text-muted-foreground">
							Useful for spotting unusually large entries at a glance.
						</p>
					</div>
					<div class="rounded-xl border bg-background p-4">
						<p class="text-sm text-muted-foreground">Review queue</p>
						<p class="mt-2 text-2xl font-semibold">{analytics.reviewQueue.length}</p>
						<p class="mt-2 text-sm text-muted-foreground">
							Rows still waiting for cleanup before reporting is fully trustworthy.
						</p>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-none bg-muted/50 shadow-none">
				<Card.Header>
					<Card.Title>Expense by expensor</Card.Title>
					<Card.Description
						>Who is carrying the spend in the current slice of data.</Card.Description
					>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#if analytics.expenseByExpensor.length === 0}
						<p class="text-sm text-muted-foreground">No expense data yet.</p>
					{:else}
						{#each analytics.expenseByExpensor as item (item.name)}
							<div class="rounded-xl border bg-background p-3">
								<div class="flex items-center justify-between gap-3">
									<p class="font-medium">{item.name}</p>
									<p class="font-semibold">${item.amount.toFixed(2)}</p>
								</div>
							</div>
						{/each}
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
			<Card.Root class="border-none bg-muted/50 shadow-none">
				<Card.Header>
					<Card.Title>Top expense categories</Card.Title>
					<Card.Description>Where money is actually going right now.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#if analytics.topExpenseCategories.length === 0}
						<p class="text-sm text-muted-foreground">No expense categories yet.</p>
					{:else}
						{#each analytics.topExpenseCategories as item (item.name)}
							<div class="rounded-xl border bg-background p-3">
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class="font-medium">{item.name}</p>
										<p class="text-sm text-muted-foreground">{item.count} transaction(s)</p>
									</div>
									<p class="font-semibold">${item.amount.toFixed(2)}</p>
								</div>
							</div>
						{/each}
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-none bg-muted/50 shadow-none">
				<Card.Header>
					<Card.Title>Review and income watch</Card.Title>
					<Card.Description>Two queues that usually matter most during weekly use.</Card.Description
					>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-3">
						<p class="text-sm font-medium">Needs review</p>
						{#if analytics.reviewQueue.length === 0}
							<p class="text-sm text-muted-foreground">No review items.</p>
						{:else}
							{#each analytics.reviewQueue as transaction (transaction.id)}
								<div class="rounded-xl border bg-background p-3">
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="font-medium">{transaction.subtypeName}</p>
											<p class="text-sm text-muted-foreground">{transaction.categoryName}</p>
										</div>
										<p class="font-semibold">${transaction.amount.toFixed(2)}</p>
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<div class="space-y-3">
						<p class="text-sm font-medium">Recent income</p>
						{#if analytics.recentIncome.length === 0}
							<p class="text-sm text-muted-foreground">No income rows yet.</p>
						{:else}
							{#each analytics.recentIncome as transaction (transaction.id)}
								<div class="rounded-xl border bg-background p-3">
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="font-medium">{transaction.subtypeName}</p>
											<p class="text-sm text-muted-foreground">{transaction.date}</p>
										</div>
										<p class="font-semibold">${transaction.amount.toFixed(2)}</p>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<Card.Root class="border-none bg-muted/50 shadow-none">
		<Card.Header>
			<Card.Title>Recent activity</Card.Title>
			<Card.Description>The latest rows flowing out of the live transaction table.</Card.Description
			>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#if transactions.length === 0}
				<div class="rounded-xl border border-dashed bg-background px-4 py-6">
					<p class="font-medium">No transactions yet</p>
					<p class="mt-2 text-sm text-muted-foreground">
						{#if configured}
							Start with Quick Add, then the dashboard will populate from real database rows.
						{:else}
							Add Supabase env values and run the migrations before expecting live data here.
						{/if}
					</p>
				</div>
			{:else}
				{#each transactions as transaction (transaction.id)}
					<div
						class="flex items-start justify-between gap-3 rounded-xl border bg-background px-3 py-3"
					>
						<div>
							<div class="flex items-center gap-2">
								<p class="font-medium">{transaction.subtypeName}</p>
								<Badge variant={transaction.status === 'review' ? 'secondary' : 'outline'}>
									{transaction.status}
								</Badge>
							</div>
							<p class="text-sm text-muted-foreground">
								{transaction.categoryName} • {transaction.paymentMethodName} • {transaction.expensorName}
							</p>
						</div>
						<div class="text-right">
							<p class="font-semibold">${transaction.amount.toFixed(2)}</p>
							<p class="text-xs text-muted-foreground">{transaction.date}</p>
						</div>
					</div>
				{/each}
			{/if}
		</Card.Content>
	</Card.Root>
</div>
