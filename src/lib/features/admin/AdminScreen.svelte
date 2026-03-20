<script lang="ts">
	import * as Card from '$ui/card';
</script>

<Card.Root class="border-none bg-muted/45 shadow-none">
	<Card.Header>
		<Card.Title>Admin Grid</Card.Title>
		<Card.Description
			>Bulk correction, search, category cleanup, and spreadsheet-like workflows live here.</Card.Description
		>
	</Card.Header>
	<Card.Content class="grid gap-4 lg:grid-cols-3">
		<div class="rounded-xl border bg-background p-4">
			<p class="text-sm font-medium">Bulk category reassignment</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Select multiple rows and normalize categories from one place.
			</p>
		</div>
		<div class="rounded-xl border bg-background p-4">
			<p class="text-sm font-medium">Merchant normalization</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Preserve raw merchant text while linking to a clean normalized merchant.
			</p>
		</div>
		<div class="rounded-xl border bg-background p-4">
			<p class="text-sm font-medium">Audit-friendly edits</p>
			<p class="mt-2 text-sm text-muted-foreground">
				Every correction should remain explainable later.
			</p>
		</div>
	</Card.Content>
</Card.Root>
