<script lang="ts">
	import type { TransactionReferenceData } from '$domain/transactions/transaction.types';
	import * as Card from '$ui/card';
	import Button from '$ui/button/button.svelte';
	import Input from '$ui/input/input.svelte';
	import Textarea from '$ui/textarea/textarea.svelte';
	import Badge from '$ui/badge/badge.svelte';

	type QuickAddFormState = {
		message?: string;
		status?: number;
		errors?: Record<string, string[] | undefined>;
		values?: {
			date: string;
			type: string;
			subtypeName: string;
			paymentMethodName: string;
			categoryName: string;
			expensorName: string;
			note: string;
			amount: string | number;
			legacySourceId: string | null;
		};
	};

	let {
		configured,
		referenceData,
		defaults,
		form
	}: {
		configured: boolean;
		referenceData: TransactionReferenceData;
		defaults: {
			date: string;
			type: string;
			subtypeName: string;
			paymentMethodName: string;
			categoryName: string;
			expensorName: string;
			note: string;
			amount: string | number;
			legacySourceId: string | null;
		};
		form: QuickAddFormState | null;
	} = $props();

	const values = $derived(form?.values ?? defaults);
	const errors = $derived(form?.errors ?? {});
</script>

<div class="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
	<Card.Root class="border-none bg-muted/45 shadow-none">
		<Card.Header>
			<Card.Title>Quick Add</Card.Title>
			<Card.Description
				>Aligned to your real import columns so migration and daily use share one model.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form method="POST" class="grid gap-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Amount</span>
						<Input
							name="amount"
							type="text"
							inputmode="decimal"
							placeholder="$1,450.00"
							value={values.amount}
						/>
						{#if errors.amount}
							<span class="text-xs text-destructive">{errors.amount[0]}</span>
						{/if}
					</label>
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Date</span>
						<Input name="date" type="date" value={values.date} />
						{#if errors.date}
							<span class="text-xs text-destructive">{errors.date[0]}</span>
						{/if}
					</label>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Type</span>
						<Input name="type" placeholder="Income" value={values.type} />
						{#if errors.type}
							<span class="text-xs text-destructive">{errors.type[0]}</span>
						{/if}
					</label>
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Subtype</span>
						<Input
							name="subtypeName"
							placeholder="929 Kirts"
							list="subtype-suggestions"
							value={values.subtypeName}
						/>
						{#if errors.subtypeName}
							<span class="text-xs text-destructive">{errors.subtypeName[0]}</span>
						{/if}
					</label>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Payment Method</span>
						<Input
							name="paymentMethodName"
							placeholder="Venmo"
							list="payment-method-suggestions"
							value={values.paymentMethodName}
						/>
						{#if errors.paymentMethodName}
							<span class="text-xs text-destructive">{errors.paymentMethodName[0]}</span>
						{/if}
					</label>
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Category</span>
						<Input
							name="categoryName"
							placeholder="Rental Income"
							list="category-suggestions"
							value={values.categoryName}
						/>
						{#if errors.categoryName}
							<span class="text-xs text-destructive">{errors.categoryName[0]}</span>
						{/if}
					</label>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Expensor</span>
						<Input
							name="expensorName"
							placeholder="Shared"
							list="expensor-suggestions"
							value={values.expensorName}
						/>
						{#if errors.expensorName}
							<span class="text-xs text-destructive">{errors.expensorName[0]}</span>
						{/if}
					</label>
					<label class="grid gap-2 text-sm">
						<span class="font-medium">Legacy ID</span>
						<Input name="legacySourceId" placeholder="1775" value={values.legacySourceId ?? ''} />
					</label>
				</div>

				<label class="grid gap-2 text-sm">
					<span class="font-medium">Note</span>
					<Textarea name="note" rows={2} placeholder="Optional note" value={values.note} />
				</label>

				{#if form?.message}
					<p class:text-destructive={Boolean(form.status && form.status >= 400)} class="text-sm">
						{form.message}
					</p>
				{/if}

				<div class="flex flex-wrap gap-3 pt-2">
					<Button disabled={!configured}>Save transaction</Button>
				</div>

				{#if !configured}
					<p class="text-sm text-muted-foreground">
						Database saving is disabled until Supabase env values are configured and the migrations
						are run.
					</p>
				{/if}

				<datalist id="subtype-suggestions">
					{#each referenceData.subtypes as subtype (subtype.id)}
						<option value={subtype.name}></option>
					{/each}
				</datalist>

				<datalist id="payment-method-suggestions">
					{#each referenceData.paymentMethods as paymentMethod (paymentMethod.id)}
						<option value={paymentMethod.name}></option>
					{/each}
				</datalist>

				<datalist id="category-suggestions">
					{#each referenceData.categories as category (category.id)}
						<option value={category.name}></option>
					{/each}
				</datalist>

				<datalist id="expensor-suggestions">
					{#each referenceData.expensors as expensor (expensor.id)}
						<option value={expensor.name}></option>
					{/each}
				</datalist>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-none bg-muted/45 shadow-none">
		<Card.Header>
			<Card.Title>Architect vs skeptic</Card.Title>
			<Card.Description
				>The workflow should stay honest, light, and easy to correct.</Card.Description
			>
		</Card.Header>
		<Card.Content class="space-y-5 text-sm">
			<div class="space-y-2">
				<Badge>Architect</Badge>
				<p>
					Use the same fields the import pipeline uses so daily entry and migrated history share one
					schema.
				</p>
			</div>
			<div class="space-y-2">
				<Badge variant="secondary">Skeptic</Badge>
				<p>
					If the user has to mentally translate spreadsheet columns into a different app model,
					cleanup debt starts on day one.
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
