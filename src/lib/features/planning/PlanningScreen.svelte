<script lang="ts">
	import Input from '$ui/input/input.svelte';
	import * as Card from '$ui/card';
	import {
		buildDeterministicProjection,
		buildProbabilisticProjection,
		createRetirementScenarios
	} from '$domain/finance/retirement';
	import type {
		FinanceInsights,
		ProbabilisticAssumptions,
		RetirementAssumptions,
		RetirementPlannerModel
	} from '$domain/finance/finance.types';

	let {
		configured,
		insights,
		planner
	}: {
		configured: boolean;
		insights: FinanceInsights;
		planner: RetirementPlannerModel;
	} = $props();

	function cloneAssumptions(source: RetirementAssumptions): RetirementAssumptions {
		return { ...source };
	}

	function cloneBounded(source: ProbabilisticAssumptions): ProbabilisticAssumptions {
		return {
			...source,
			inflationRate: { ...source.inflationRate },
			returnRate: { ...source.returnRate },
			incomeGrowthRate: { ...source.incomeGrowthRate },
			retirementSpendingTarget: { ...source.retirementSpendingTarget },
			annualRentalNetIncome: { ...source.annualRentalNetIncome },
			vacancyShock: { ...source.vacancyShock },
			maintenanceShock: { ...source.maintenanceShock },
			retirementAge: { ...source.retirementAge }
		};
	}

	// svelte-ignore state_referenced_locally
	let assumptions = $state<RetirementAssumptions>(cloneAssumptions(planner.assumptions));
	// svelte-ignore state_referenced_locally
	let bounded = $state<ProbabilisticAssumptions>(cloneBounded(planner.probabilisticAssumptions));

	const deterministic = $derived(buildDeterministicProjection(assumptions));
	const scenarios = $derived(
		createRetirementScenarios(assumptions).map((scenario) => ({
			label: scenario.label,
			projection: buildDeterministicProjection(scenario.assumptions)
		}))
	);
	const probabilistic = $derived(buildProbabilisticProjection(assumptions, bounded));
</script>

<div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
	<section class="grid gap-4">
		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Retirement assumptions</Card.Title>
				<Card.Description>
					Editable starter assumptions. Persistence can land later without changing the planning
					engine.
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4 md:grid-cols-2">
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Current age</span>
					<Input type="number" bind:value={assumptions.currentAge} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Retirement age</span>
					<Input type="number" bind:value={assumptions.retirementAge} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Retirement balance</span>
					<Input type="number" bind:value={assumptions.currentRetirementBalance} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Taxable balance</span>
					<Input type="number" bind:value={assumptions.currentTaxableBalance} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Cash reserves</span>
					<Input type="number" bind:value={assumptions.currentCashReserves} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Debt balance</span>
					<Input type="number" bind:value={assumptions.currentDebtBalance} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Annual earned income</span>
					<Input type="number" bind:value={assumptions.annualEarnedIncome} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Annual rental net income</span>
					<Input type="number" bind:value={assumptions.annualRentalNetIncome} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Annual contribution</span>
					<Input type="number" bind:value={assumptions.annualRetirementContribution} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Employer match</span>
					<Input type="number" bind:value={assumptions.employerMatch} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Inflation rate</span>
					<Input type="number" step="0.001" bind:value={assumptions.inflationRate} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Return rate</span>
					<Input type="number" step="0.001" bind:value={assumptions.returnRate} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Income growth rate</span>
					<Input type="number" step="0.001" bind:value={assumptions.incomeGrowthRate} />
				</label>
				<label class="grid gap-2 text-sm">
					<span class="font-medium">Retirement spending target</span>
					<Input type="number" bind:value={assumptions.retirementSpendingTarget} />
				</label>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Deterministic plan</Card.Title>
				<Card.Description
					>Baseline, explainable projection under the current assumption set.</Card.Description
				>
			</Card.Header>
			<Card.Content class="grid gap-4 md:grid-cols-4">
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">Assets at retirement</p>
					<p class="mt-2 text-2xl font-semibold">
						${deterministic.projectedAssetsAtRetirement.toFixed(0)}
					</p>
				</div>
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">Required capital</p>
					<p class="mt-2 text-2xl font-semibold">
						${deterministic.requiredCapitalAtRetirement.toFixed(0)}
					</p>
				</div>
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">Readiness gap</p>
					<p class="mt-2 text-2xl font-semibold">${deterministic.readinessGap.toFixed(0)}</p>
				</div>
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">FI age</p>
					<p class="mt-2 text-2xl font-semibold">{deterministic.estimatedFiAge ?? 'Not reached'}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Scenario comparison</Card.Title>
				<Card.Description>Which lever moves the retirement outcome most clearly.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-3 md:grid-cols-3">
				{#each scenarios as scenario (scenario.label)}
					<div class="rounded-xl border bg-background p-4">
						<p class="font-medium">{scenario.label}</p>
						<p class="mt-2 text-sm text-muted-foreground">
							Assets at retirement: ${scenario.projection.projectedAssetsAtRetirement.toFixed(0)}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Gap: ${scenario.projection.readinessGap.toFixed(0)}
						</p>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</section>

	<section class="grid gap-4">
		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Bounded probabilistic overlay</Card.Title>
				<Card.Description>
					Risk-adjusted range with bounded assumptions, not unconstrained Monte Carlo.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid gap-4 md:grid-cols-4">
					<div class="rounded-xl border bg-background p-4">
						<p class="text-sm text-muted-foreground">Success rate</p>
						<p class="mt-2 text-2xl font-semibold">
							{(probabilistic.successRate * 100).toFixed(0)}%
						</p>
					</div>
					{#each probabilistic.bands as band (band.label)}
						<div class="rounded-xl border bg-background p-4">
							<p class="text-sm text-muted-foreground">{band.label} path</p>
							<p class="mt-2 text-xl font-semibold">${band.assetsAtRetirement.toFixed(0)}</p>
							<p class="mt-1 text-sm text-muted-foreground">Gap: ${band.readinessGap.toFixed(0)}</p>
						</div>
					{/each}
				</div>

				<div class="grid gap-3">
					<p class="text-sm font-medium">Guardrails</p>
					{#if probabilistic.guardrails.length === 0}
						<p class="text-sm text-muted-foreground">
							Current bounds do not trigger any major warnings.
						</p>
					{:else}
						{#each probabilistic.guardrails as guardrail (guardrail)}
							<div class="rounded-xl border bg-background p-3 text-sm">{guardrail}</div>
						{/each}
					{/if}
				</div>

				<div class="grid gap-3">
					<p class="text-sm font-medium">Sensitivity ranking</p>
					{#each probabilistic.sensitivity as item (item.label)}
						<div class="rounded-xl border bg-background p-3">
							<div class="flex items-center justify-between gap-3">
								<p class="font-medium">{item.label}</p>
								<p class="text-sm text-muted-foreground">{item.impact.toFixed(2)}</p>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-none bg-muted/45 shadow-none">
			<Card.Header>
				<Card.Title>Planning context</Card.Title>
				<Card.Description>Current finance layer signals feeding the model.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">Core household net cashflow</p>
					<p class="mt-2 text-2xl font-semibold">
						${insights.health.rentalAdjustedNetCashflow.toFixed(2)}
					</p>
				</div>
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">Cash runway</p>
					<p class="mt-2 text-2xl font-semibold">
						{insights.health.cashRunwayMonths.toFixed(1)} months
					</p>
				</div>
				<div class="rounded-xl border bg-background p-4">
					<p class="text-sm text-muted-foreground">Rental properties tracked</p>
					<p class="mt-2 text-2xl font-semibold">{insights.rentalProperties.length}</p>
				</div>
				{#if assumptions.usingStarterAssumptions}
					<p class="text-sm text-muted-foreground">
						The planner uses visible starter assumptions for ages and balances until household
						profile persistence lands.
					</p>
				{/if}
				{#if !configured}
					<p class="text-sm text-muted-foreground">
						Configure Supabase and import real data before trusting any planning output.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</section>
</div>
