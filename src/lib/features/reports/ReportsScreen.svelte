<script lang="ts">
	import { buildFinanceInsights } from '$domain/finance/finance.insights';
	import type { TransactionRecord } from '$domain/transactions/transaction.types';
	import * as Card from '$ui/card';

	let {
		configured,
		transactions
	}: {
		configured: boolean;
		transactions: TransactionRecord[];
	} = $props();

	const insights = $derived(buildFinanceInsights(transactions));
</script>

<div class="grid gap-4">
	<div class="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Budget variance</Card.Title>
				<Card.Description>Monthly category budgets versus trailing spend behavior.</Card.Description
				>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if insights.budgetVariances.length === 0}
					<p class="text-sm text-muted-foreground">No spending data yet.</p>
				{:else}
					{#each insights.budgetVariances as budget (budget.categoryName)}
						<div class="rounded-xl border bg-background p-3">
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class="font-medium">{budget.categoryName}</p>
									<p class="text-sm text-muted-foreground">
										Target ${budget.target.toFixed(2)} • Avg ${budget.trailingAverage.toFixed(2)}
									</p>
								</div>
								<div class="text-right">
									<p class="font-semibold">${budget.actual.toFixed(2)}</p>
									<p class="text-sm text-muted-foreground">{budget.alert}</p>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Focus categories</Card.Title>
				<Card.Description
					>Food, home maintenance, kids, and travel pressure points.</Card.Description
				>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if insights.focusBreakdowns.length === 0}
					<p class="text-sm text-muted-foreground">No focus-category activity yet.</p>
				{:else}
					{#each insights.focusBreakdowns as item (item.name)}
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
	</div>

	<div class="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Cashflow explorer</Card.Title>
				<Card.Description
					>Different views of household, total, and lifestyle cashflow.</Card.Description
				>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each insights.cashflowViews as view (view.mode)}
					<div class="rounded-xl border bg-background p-4">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-medium">{view.label}</p>
								<p class="text-sm text-muted-foreground">
									Income ${view.incomeTotal.toFixed(2)} • Expense ${view.expenseTotal.toFixed(2)}
								</p>
							</div>
							<p class="text-xl font-semibold">${view.netTotal.toFixed(2)}</p>
						</div>
						<div class="mt-3 grid gap-2">
							{#each view.changeDrivers as driver (driver.label)}
								<div class="flex items-center justify-between gap-3 text-sm text-muted-foreground">
									<span>{driver.label}</span>
									<span>${driver.amount.toFixed(2)}</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Rental property lens</Card.Title>
				<Card.Description>Property-level rental income and expense separation.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if !configured && insights.rentalProperties.length === 0}
					<p class="text-sm text-muted-foreground">
						Configure Supabase and load rental-tagged transactions before expecting this view to be
						meaningful.
					</p>
				{:else if insights.rentalProperties.length === 0}
					<p class="text-sm text-muted-foreground">No rental properties are currently detected.</p>
				{:else}
					{#each insights.rentalProperties as property (property.propertyName)}
						<div class="rounded-xl border bg-background p-4">
							<p class="font-medium">{property.propertyName}</p>
							<p class="mt-2 text-sm text-muted-foreground">
								Income ${property.income.toFixed(2)} • Operating ${property.operatingExpense.toFixed(
									2
								)} • Capital ${property.capitalExpense.toFixed(2)}
							</p>
							<p class="mt-2 text-sm text-muted-foreground">
								Net ${property.netCashflow.toFixed(2)} • Reserve target ${property.maintenanceReserveTarget.toFixed(
									2
								)}
							</p>
						</div>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
