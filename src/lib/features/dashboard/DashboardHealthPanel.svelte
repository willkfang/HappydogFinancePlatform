<script lang="ts">
	import type { FinanceInsights } from '$domain/finance/finance.types';
	import * as Card from '$ui/card';

	let { insights }: { insights: FinanceInsights } = $props();

	const metricCards = $derived([
		{
			label: 'Savings rate',
			value: `${(insights.health.savingsRate * 100).toFixed(0)}%`,
			detail: 'Core household net cashflow divided by total income.'
		},
		{
			label: 'Fixed-cost ratio',
			value: `${(insights.health.fixedCostRatio * 100).toFixed(0)}%`,
			detail: 'Essential spend as a share of total inflows.'
		},
		{
			label: 'Cash runway',
			value: `${insights.health.cashRunwayMonths.toFixed(1)} mo`,
			detail: 'Approximate months of essential coverage.'
		},
		{
			label: 'Debt load',
			value: `${(insights.health.debtLoadRatio * 100).toFixed(0)}%`,
			detail: 'Debt-related outflows relative to income.'
		}
	]);
</script>

<div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
	<Card.Root class="border-none bg-muted/50 shadow-none">
		<Card.Header>
			<Card.Title>Financial health</Card.Title>
			<Card.Description>Month-to-month operating strength, not just total spend.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4 md:grid-cols-2">
			{#each metricCards as metric (metric.label)}
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">{metric.label}</p>
					<p class="mt-2 text-2xl font-semibold">{metric.value}</p>
					<p class="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-none bg-muted/50 shadow-none">
		<Card.Header>
			<Card.Title>Data trust</Card.Title>
			<Card.Description>Signals that the reporting layer still needs cleanup.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-3">
			<div class="rounded-xl border bg-background p-3">
				<p class="font-medium">Review rows</p>
				<p class="text-sm text-muted-foreground">{insights.health.dataTrust.reviewCount}</p>
			</div>
			<div class="rounded-xl border bg-background p-3">
				<p class="font-medium">Uncategorized / misc</p>
				<p class="text-sm text-muted-foreground">{insights.health.dataTrust.uncategorizedCount}</p>
			</div>
			<div class="rounded-xl border bg-background p-3">
				<p class="font-medium">Excluded household rows</p>
				<p class="text-sm text-muted-foreground">{insights.health.dataTrust.excludedCount}</p>
			</div>
			<div class="rounded-xl border bg-background p-3">
				<p class="font-medium">Potential anomalies</p>
				<p class="text-sm text-muted-foreground">{insights.health.dataTrust.anomalyCount}</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
